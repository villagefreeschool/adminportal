import _ from 'lodash';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  where,
  query,
  documentId,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { db } from './firebase';

/**
 * Types for the data models used in the application
 */
export interface Guardian {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  otherEmails?: string;
  cellPhone?: string;
  relationship?: string;
}

export interface Student {
  id: string;
  familyID: string;
  firstName: string;
  lastName: string;
  birthdate?: string; // ISO date string
  email?: string;
  grade?: string;
  medicalNotes?: string;
  allergies?: string;
}

export interface EmergencyContact {
  firstName: string;
  cellPhone?: string;
  relationship?: string;
}

export interface Family {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  allergies?: string;
  grossFamilyIncome?: number | null;
  guardians: Guardian[];
  students: Student[];
  emergencyContacts?: EmergencyContact[];
}

export interface UserFamily {
  familyID: string;
  familyName: string;
}

export interface Enrollment {
  id: string;
  yearID: string;
  enrollmentType: string;
  familyID: string;
  familyName: string;
  studentID: string;
  studentName: string;
  family?: Family;
  student?: Student;
  birthday?: string | null;
  birthdaySort?: string;
  birthdayDisplay?: string;
}

/**
 * Constants and collection references
 */
export const CHUNK_SIZE = 10;

// Collection references
export const userDB = collection(db, 'users');
export const familyDB = collection(db, 'families');
export const studentDB = collection(db, 'students');
export const yearDB = collection(db, 'years');
export const userFamilyDB = collection(db, 'userFamilies');

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
    // Assign missing student IDs
    for (let i = 0; i < family.students.length; i++) {
      if (!family.students[i].id) {
        family.students[i].id = doc(studentDB).id;
      }
    }

    await setDoc(doc(familyDB, familyID), family);

    let emails: string[] = [];
    // Add Guardian email access
    emails.push(...family.guardians.map((g) => g.email));
    emails.push(...family.guardians.map((g) => _.split(g.otherEmails || '', ',')));
    // Add student email address
    emails.push(...family.students.map((s) => s.email || ''));

    // Clean them up by flattening and trimming.
    emails = _.chain(emails)
      .flattenDeep()
      .map(_.trim)
      .map((s) => (s || '').toLowerCase())
      .compact()
      .value();

    // Save userFamily records
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      await setDoc(doc(userFamilyDB, email), {
        familyID: familyID,
        familyName: family.name,
      }).catch(() => {
        console.log('Failed to set userFamilyRecord for ', email);
      });
    }

    // Save each student
    for (let i = 0; i < family.students.length; i++) {
      const student = family.students[i];
      let studentID = student.id;
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
  return Promise.resolve(family);
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
  const studentIDs = _.map(family.students || [], 'id');
  for (let i = 0; i < studentIDs.length; i++) {
    console.log('Deleting students/' + studentIDs[i]);
    await deleteDoc(doc(studentDB, studentIDs[i]));
  }

  const yearSnap = await getDocs(yearDB);
  yearSnap.forEach((yearDoc) => {
    const yearID = yearDoc.id;
    console.log('Deleting years/' + yearID + '/contracts/' + familyID);
    deleteDoc(doc(collection(doc(yearDB, yearID), 'contracts'), familyID));
    for (let i = 0; i < studentIDs.length; i++) {
      console.log('Deleting years/' + yearID + '/enrollments/' + studentIDs[i]);
      deleteDoc(doc(collection(doc(yearDB, yearID), 'enrollments'), studentIDs[i]));
    }
  });

  // Finally delete the actual family
  console.log('Deleting families/' + familyID);
  await deleteDoc(doc(familyDB, familyID));
}

/**
 * enrolledStudentsInYear fetches a read-only array of "Enrolled Students".
 * Each result is based on the 'enrollments' collection underneath the year,
 * but it adds the full student and family objects instead of just references.
 */
export async function enrolledStudentsInYear(yearID: string): Promise<Enrollment[]> {
  const enrolledStudents: Enrollment[] = [];
  const familyIDs: string[] = [];
  const studentIDs: string[] = [];
  const enrollmentCollection = collection(doc(yearDB, yearID), 'enrollments');
  const docs = await getDocs(enrollmentCollection);

  // First pass, we just collect the IDs of families and students we need
  docs.forEach((enrollment) => {
    const data = enrollment.data() as Enrollment;
    familyIDs.push(data.familyID);
    studentIDs.push(data.studentID);
  });

  let results = await Promise.all([
    fetchFamiliesWithIDs(familyIDs),
    fetchStudentsWithIDs(studentIDs),
  ]);

  const families = _.keyBy(results[0], 'id');
  const students = _.keyBy(results[1], 'id');

  // Second pass, we add a .student and .family property
  docs.forEach((doc) => {
    const id = doc.id;
    const data = doc.data() as Enrollment;
    const student = students[data.studentID];
    const birthday = student?.birthdate ? student.birthdate : null;
    const birthdaySort = birthday ? dayjs(student.birthdate).format('MM DD MMMM') : '';
    const birthdayDisplay = birthday ? dayjs(student.birthdate).format('MMM Do') : '';

    enrolledStudents.push({
      id,
      ...data,
      family: families[data.familyID],
      student,
      birthday,
      birthdaySort,
      birthdayDisplay,
    });
  });

  return enrolledStudents;
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
  const familyIDs: string[] = [];
  const validDecisions = ['Full Time', 'Part Time'];
  const contractsCollection = collection(doc(yearDB, yearID), 'contracts');
  const docs = await getDocs(contractsCollection);

  // First pass, we just collect the IDs of families attending
  docs.forEach((contract) => {
    const data = contract.data();
    const decisions = _.values(data.studentDecisions);
    if (_.intersection(decisions, validDecisions).length > 0) {
      familyIDs.push(contract.id); // Contract IDs are the ID of the family
    }
  });

  const results = await fetchFamiliesWithIDs(familyIDs);
  return results;
}

/**
 * fetchStudentsWithIDs is a utility function to get multiple *read-only*
 * Student collection entries from Firebase efficiently. Data returned from
 * this function should not be edited, and it will not live-update when the
 * individual Student records are changed.
 *
 * This function obeys Firebase's limit of 10 items being fetched by ID at
 * a time.
 *
 * @param ids An array of Student collection identifiers
 * @returns Student[]
 */
export async function fetchStudentsWithIDs(ids: string[]): Promise<Student[]> {
  const students: Student[] = [];
  const chunks = _.chain([ids]).flatten().uniq().chunk(CHUNK_SIZE).value();

  for (const chunk of chunks) {
    const q = query(studentDB, where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
  }
  return students;
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
    const q = query(familyDB, where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach((doc) => {
      families.push({ id: doc.id, ...doc.data() } as Family);
    });
  }
  return families;
}

/**
 * Formats a contact into a readable string
 */
export function contactToString(contact: EmergencyContact | null): string {
  if (!contact) {
    return '';
  }
  const firstName = _.get(contact, 'firstName');
  const cellPhone = _.get(contact, 'cellPhone');
  const rel = _.get(contact, 'relationship');
  let str = '';
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

/**
 * Generates a family name based on the last names of guardians and students
 */
export function calculatedNameForFamily(family: Family): string {
  return (
    _.chain([...family.students, ...family.guardians])
      .map((s) => (s.lastName ? s.lastName : '').trim())
      .sort()
      .uniq()
      .value()
      .join(' / ') + ' Family'
  );
}

/**
 * Returns a comma-separated list of guardian first names
 */
export function guardianNamesForFamily(family: Family): string {
  return _.chain(family.guardians)
    .map((g) => g.firstName)
    .join(', ')
    .value();
}
