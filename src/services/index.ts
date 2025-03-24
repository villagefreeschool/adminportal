// Export Firebase and Firestore-related functionality
export { default as firebaseApp } from './firebase';
export { auth, db, storage } from './firebase';
export {
  userDB,
  familyDB,
  studentDB,
  yearDB,
  userFamilyDB,
  saveFamily,
  deleteFamily,
  enrolledStudentsInYear,
  enrolledFamiliesInYear,
  fetchStudentsWithIDs,
  fetchFamiliesWithIDs,
  contactToString,
  calculatedNameForFamily,
  guardianNamesForFamily,
  CHUNK_SIZE,
} from './firestoredb';

// Export types
export type {
  Guardian,
  Student,
  Family,
  EmergencyContact,
  UserFamily,
  Enrollment,
} from './firestoredb';
