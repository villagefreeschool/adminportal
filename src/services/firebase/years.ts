import _ from 'lodash';
import { collection, doc, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import { Enrollment, Family } from './models/types';
import { fetchFamiliesWithIDs } from './families';
import { fetchStudentsWithIDs } from './students';

// Import collection references
import { yearDB } from './collections';

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
    const birthdaySort = birthday ? dayjs(student.birthdate).format('MM DD MMMM') : '';
    const birthdayDisplay = birthday ? dayjs(student.birthdate).format('MMM Do') : '';

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
