import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import _ from "lodash";
// Import collection references
import { familyDB, studentDB, userFamilyDB, yearDB } from "./collections";
import { CHUNK_SIZE } from "./core";
import type { EmergencyContact, Family } from "./models/types";

/**
 * Recursively removes undefined fields from an object to prevent Firestore errors.
 *
 * Firestore throws an error if you try to save a document with undefined values.
 * This utility strips them out before saving. Null values are preserved.
 *
 * @param obj - Object to clean
 * @returns Cleaned object with no undefined values
 */
function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Fetches all families from Firestore
 */
export async function fetchFamilies(): Promise<Family[]> {
  const families: Family[] = [];

  try {
    const snapshot = await getDocs(familyDB);
    for (const doc of snapshot.docs) {
      families.push({ id: doc.id, ...doc.data() } as Family);
    }
  } catch (error) {
    console.error("Error fetching families:", error);
    throw error;
  }

  return families;
}

/**
 * Fetches a single family by ID
 */
export async function fetchFamily(id: string): Promise<Family | null> {
  try {
    const docRef = doc(familyDB, id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as Family;
    }
    return null;
  } catch (error) {
    console.error("Error fetching family:", error);
    throw error;
  }
}

/**
 * Saves a family and all related data to Firestore.
 *
 * This is the primary function for creating or updating families. It handles:
 * - Generating IDs for new families and students
 * - Saving to families collection (with embedded guardians/students)
 * - Saving to students collection (denormalized for efficient queries)
 * - Creating userFamilies records (links user emails to this family for access control)
 * - Building authorizedEmails array from guardian/student emails
 *
 * @param family - Family object with guardians and students arrays
 * @returns Promise resolving to the saved family with generated IDs
 *
 * @example
 * const newFamily = {
 *   name: "Smith Family",
 *   guardians: [{ firstName: "John", lastName: "Smith", email: "john@example.com" }],
 *   students: [{ firstName: "Jane", lastName: "Smith", birthdate: "2015-03-15" }]
 * };
 * const saved = await saveFamily(newFamily);
 */
export async function saveFamily(family: Family): Promise<Family> {
  let familyID = family.id;
  if (!familyID) {
    familyID = doc(familyDB).id;
  }

  if (family.grossFamilyIncome && family.grossFamilyIncome < 1) {
    family.grossFamilyIncome = null;
  }

  try {
    // Assign missing student IDs and family ID
    const students = family.students || [];
    for (let i = 0; i < students.length; i++) {
      if (!students[i].id) {
        students[i].id = doc(studentDB).id;
      }
      students[i].familyID = familyID;
    }

    // Build authorizedEmails array - determines who can access this family's data
    // Includes: guardian emails, guardian otherEmails (comma-separated), and student emails
    let emails: string[] = [];

    // Add Guardian email access
    emails.push(...(family.guardians || []).map((g) => g.email).filter((email) => email != null));

    // Process otherEmails from guardians (comma-separated string)
    const otherEmails = (family.guardians || []).flatMap((g) => _.split(g.otherEmails || "", ","));
    emails.push(...otherEmails);

    // Add student email addresses
    emails.push(...(family.students || []).map((s) => s.email).filter((email) => email != null));

    // Clean: flatten, trim whitespace, lowercase, remove empty strings
    emails = _.chain(emails)
      .flattenDeep()
      .map(_.trim)
      .map((s) => (s || "").toLowerCase())
      .compact()
      .value();

    // Clean the family object to remove undefined values before saving
    const cleanFamily = removeUndefinedFields(family);

    // Prepare family document for Firestore
    // authorizedEmails is used by Firebase security rules to control access
    const familyToSave = {
      ...cleanFamily,
      id: familyID,
      authorizedEmails: emails,
    };

    try {
      await setDoc(doc(familyDB, familyID), familyToSave);
    } catch (error) {
      console.error("Error saving family to Firestore:", error);
      console.error("Family data that failed to save:", JSON.stringify(familyToSave, null, 2));
      throw error;
    }

    // Save userFamily records
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const userFamilyData = removeUndefinedFields({
        familyID: familyID,
        familyName: family.name || "",
      });
      await setDoc(doc(userFamilyDB, email), userFamilyData).catch(() => {
        // Failed to set user family record
      });
    }

    // Save each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentID = student.id;
      const studentData = removeUndefinedFields({ ...student, familyID: familyID });
      try {
        await setDoc(doc(studentDB, studentID), studentData);
      } catch (error) {
        console.error(`Error saving student ${studentID} to Firestore:`, error);
        console.error("Student data that failed to save:", JSON.stringify(studentData, null, 2));
        throw error;
      }
    }

    // Save contracts
    // TODO

    // Save enrollments
    // TODO
  } catch (error) {
    return Promise.reject(error);
  }
  return Promise.resolve({ ...family, id: familyID });
}

/**
 * deleteFamily deletes all records associated with a specific familyID. This
 * includes records in the following collections:
 * - families
 * - students
 * - userFamilies
 * - years/{year}/contracts
 * - years/{year}/enrollments
 */
export async function deleteFamily(family: Family): Promise<void> {
  const familyID = family.id;

  // Delete student records
  const studentIDs = _.map(family.students || [], "id");
  for (let i = 0; i < studentIDs.length; i++) {
    await deleteDoc(doc(studentDB, studentIDs[i]));
  }

  const yearSnap = await getDocs(yearDB);
  for (const yearDoc of yearSnap.docs) {
    const yearID = yearDoc.id;
    deleteDoc(doc(collection(doc(yearDB, yearID), "contracts"), familyID));
    for (let i = 0; i < studentIDs.length; i++) {
      deleteDoc(doc(collection(doc(yearDB, yearID), "enrollments"), studentIDs[i]));
    }
  }

  // Finally delete the actual family
  await deleteDoc(doc(familyDB, familyID));
}

/**
 * fetchFamiliesWithIDs is a utility function to get multiple *read-only*
 * Family collection entries from Firebase efficiently. Data returned from
 * this function should not be edited, and it will not live-update when the
 * individual Student records are changed.
 *
 * This function obeys Firebase's limit of 10 items being fetched by ID at
 * a time.
 *
 * @param ids An array of Family collection identifiers
 * @returns Family[]
 */
export async function fetchFamiliesWithIDs(ids: string[]): Promise<Family[]> {
  const families: Family[] = [];
  // Firestore 'in' queries are limited to 10 items, so we chunk the IDs
  // Also flatten (in case nested arrays), remove duplicates, and chunk into groups of 10
  const chunks = _.chain([ids]).flatten().uniq().chunk(CHUNK_SIZE).value();

  for (const chunk of chunks) {
    const q = query(familyDB, where(documentId(), "in", chunk));
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      families.push({ id: doc.id, ...doc.data() } as Family);
    }
  }
  return families;
}

/**
 * enrolledFamiliesInYear fetches a read-only array of Families with at least
 * one student enrolled in the provided YearID. The returned records
 * SHOULD NOT BE EDITED and are not watched for server-side changes. This
 * function is to be used for reporting/listing only.
 *
 * @param yearID
 * @returns An array of Family objects.
 */
export async function enrolledFamiliesInYear(yearID: string): Promise<Family[]> {
  try {
    // Verify yearID is not empty
    if (!yearID) {
      console.error("Year ID is empty");
      return [];
    }

    const familyIDs: string[] = [];
    const validDecisions = ["Full Time", "Part Time"];

    try {
      // Get the contracts collection for this year
      const contractsRef = collection(doc(yearDB, yearID), "contracts");

      const contractsDocs = await getDocs(contractsRef);

      // First pass, we just collect the IDs of families attending
      for (const contract of contractsDocs.docs) {
        const data = contract.data();
        const decisions = _.values(data.studentDecisions || {});
        if (_.intersection(decisions, validDecisions).length > 0) {
          familyIDs.push(contract.id); // Contract IDs are the ID of the family
        }
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw new Error(`Failed to fetch contracts for year ${yearID}: ${error}`);
    }

    // If no families found, return empty array
    if (familyIDs.length === 0) {
      return [];
    }

    // Fetch the full family data for each family ID
    const results = await fetchFamiliesWithIDs(familyIDs);

    return results;
  } catch (error) {
    console.error("Error in enrolledFamiliesInYear:", error);
    throw error;
  }
}

/**
 * Generates a family name based on the last names of guardians and students
 */
export function calculatedNameForFamily(family: Family): string {
  return `${_.chain([...(family.students || []), ...(family.guardians || [])])
    .map((s) => (s.lastName ? s.lastName : "").trim())
    .compact() // Remove empty strings
    .sort()
    .uniq()
    .value()
    .join(" / ")} Family`;
}

/**
 * Returns a comma-separated list of guardian first names
 */
export function guardianNamesForFamily(family: Family): string {
  return _.chain(family.guardians || [])
    .map((g) => g.firstName)
    .compact() // Remove undefined/null values
    .join(", ")
    .value();
}

/**
 * Formats a contact into a readable string
 */
export function contactToString(contact: EmergencyContact | null): string {
  if (!contact) {
    return "";
  }
  const firstName = _.get(contact, "firstName");
  const cellPhone = _.get(contact, "cellPhone");
  const rel = _.get(contact, "relationship");
  let str = "";
  if (!firstName) {
    return str;
  }
  str += firstName;
  if (rel) {
    str += ` (${rel})`;
  }
  if (cellPhone) {
    str += ` ${cellPhone}`;
  }
  return str;
}
