import { documentId, getDocs, query, where } from "firebase/firestore";
import _ from "lodash";
// Import collection references
import { studentDB } from "./collections";
import { CHUNK_SIZE } from "./core";
import type { Student } from "./models/types";

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
    const q = query(studentDB, where(documentId(), "in", chunk));
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      students.push({ id: doc.id, ...doc.data() } as Student);
    }
  }
  return students;
}
