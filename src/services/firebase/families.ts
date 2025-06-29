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
import { CHUNK_SIZE } from "./core";
import type { EmergencyContact, Family } from "./models/types";

// Import collection references
import { familyDB, studentDB, userFamilyDB, yearDB } from "./collections";

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
 * saveFamily is the central handler for saving a family, its guardians and
 * students. It updates the following FirestoreDB collections:
 * - families - The main family database
 * - students - An independent database of individual students
 * - userFamilies - The family lookup table for granting access to families
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
    for (let i = 0; i < family.students.length; i++) {
      if (!family.students[i].id) {
        family.students[i].id = doc(studentDB).id;
      }
      family.students[i].familyID = familyID;
    }

    let emails: string[] = [];
    // Add Guardian email access
    emails.push(...family.guardians.map((g) => g.email));

    // Process otherEmails from guardians
    const otherEmails = family.guardians.flatMap((g) => _.split(g.otherEmails || "", ","));
    emails.push(...otherEmails);

    // Add student email address
    emails.push(...family.students.map((s) => s.email || ""));

    // Clean them up by flattening and trimming.
    emails = _.chain(emails)
      .flattenDeep()
      .map(_.trim)
      .map((s) => (s || "").toLowerCase())
      .compact()
      .value();

    // Make a copy of the family to save to Firestore with authorizedEmails
    const familyToSave = {
      ...family,
      id: familyID,
      authorizedEmails: emails, // Include authorizedEmails for Firebase security rules
    };

    await setDoc(doc(familyDB, familyID), familyToSave);

    // Save userFamily records
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      await setDoc(doc(userFamilyDB, email), {
        familyID: familyID,
        familyName: family.name,
      }).catch(() => {
        // Failed to set user family record
      });
    }

    // Save each student
    for (let i = 0; i < family.students.length; i++) {
      const student = family.students[i];
      const studentID = student.id;
      const studentData = { ...student, familyID: familyID };
      await setDoc(doc(studentDB, studentID), studentData);
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
  return `${_.chain([...family.students, ...family.guardians])
    .map((s) => (s.lastName ? s.lastName : "").trim())
    .sort()
    .uniq()
    .value()
    .join(" / ")} Family`;
}

/**
 * Returns a comma-separated list of guardian first names
 */
export function guardianNamesForFamily(family: Family): string {
  return _.chain(family.guardians)
    .map((g) => g.firstName)
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
