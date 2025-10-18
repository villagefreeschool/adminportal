// Export core Firebase functionality

// Export collection references
export { familyDB, studentDB, userDB, userFamilyDB, yearDB } from "./collections";
export { auth, CHUNK_SIZE, db, default as firebaseApp, storage } from "./core";

// Export family-related functions
export {
  calculatedNameForFamily,
  contactToString,
  deleteFamily,
  fetchFamiliesWithIDs,
  guardianNamesForFamily,
  saveFamily,
} from "./families";
// Export types
export * from "./models/types";
// Export student-related functions
export { fetchStudentsWithIDs } from "./students";
// Export year-related functions
export { enrolledFamiliesInYear, enrolledStudentsInYear } from "./years";
