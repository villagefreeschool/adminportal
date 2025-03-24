// Export core Firebase functionality
export { default as firebaseApp } from './core';
export { auth, db, storage, CHUNK_SIZE } from './core';

// Export collection references
export { userDB, familyDB, studentDB, yearDB, userFamilyDB } from './collections';

// Export family-related functions
export { saveFamily, deleteFamily, fetchFamiliesWithIDs } from './families';

// Export student-related functions
export { fetchStudentsWithIDs } from './students';

// Export year-related functions
export { enrolledStudentsInYear, enrolledFamiliesInYear } from './years';

// Export utility functions
export {
  contactToString,
  calculatedNameForFamily,
  guardianNamesForFamily,
} from './utils/formatters';

// Export types
export * from './models/types';
