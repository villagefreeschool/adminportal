import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './config';

// Get the Firebase configuration based on environment or fallback
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set the chunk size for Firestore batch operations
// This is set to 10 to match Firestore's limit on 'in' query operators
export const CHUNK_SIZE = 10;

// Export Firebase app instance
export default app;
