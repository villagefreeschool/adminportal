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
import { CHUNK_SIZE } from './core';
import { Family } from './models/types';

// Import collection references
import { familyDB, studentDB, userFamilyDB, yearDB } from './collections';

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

    // Process otherEmails from guardians
    const otherEmails = family.guardians.map((g) => _.split(g.otherEmails || '', ',')).flat();
    emails.push(...otherEmails);

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
