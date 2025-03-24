import _ from 'lodash';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import moment from 'moment';
import { Enrollment, Family } from './models/types';
import { fetchFamiliesWithIDs } from './families';
import { fetchStudentsWithIDs } from './students';

// Import collection references
import { yearDB } from './collections';

// Default values for year properties
export const DefaultMinimumIncome = 28000;
export const DefaultMaximumIncome = 120000;
export const DefaultMinimumTuition = 1000;
export const DefaultMaximumTuition = 12500;

// Year interface definition
export interface Year {
  id: string;
  name: string;
  minimumTuition: number;
  maximumTuition: number;
  minimumIncome: number;
  maximumIncome: number;
  isAcceptingRegistrations: boolean;
  isAcceptingIntentToReturns?: boolean;
}

/**
 * Fetches all school years from Firestore
 * @returns Promise resolving to an array of Year objects
 */
export async function fetchYears(): Promise<Year[]> {
  const yearsQuery = query(yearDB, orderBy('name', 'desc'));
  const snapshot = await getDocs(yearsQuery);

  return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
    } as Year;
  });
}

/**
 * Fetches a specific year by ID
 * @param id Year ID to fetch
 * @returns Promise resolving to a Year object or null if not found
 */
export async function fetchYear(id: string): Promise<Year | null> {
  const yearRef = doc(yearDB, id);
  const snapshot = await getDoc(yearRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as Year;
}

/**
 * Creates a new school year
 * @param year Year data to save (without ID)
 * @returns Promise resolving to the created Year with ID
 */
export async function createYear(year: Omit<Year, 'id'>): Promise<Year> {
  const docRef = await addDoc(yearDB, year);
  return {
    ...year,
    id: docRef.id,
  } as Year;
}

/**
 * Updates an existing school year
 * @param year Year data to update (must include ID)
 * @returns Promise that resolves when the update completes
 */
export async function updateYear(year: Year): Promise<void> {
  const { id, ...yearData } = year;
  const yearRef = doc(yearDB, id);
  return setDoc(yearRef, yearData);
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
  docs.forEach((docSnapshot) => {
    const id = docSnapshot.id;
    const data = docSnapshot.data() as Enrollment;
    const student = students[data.studentID];
    const birthday = student?.birthdate ? student.birthdate : null;
    const birthdaySort = birthday ? moment(student.birthdate).format('MM DD MMMM') : '';
    const birthdayDisplay = birthday ? moment(student.birthdate).format('MMM Do') : '';

    enrolledStudents.push({
      ...data,
      id,
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
