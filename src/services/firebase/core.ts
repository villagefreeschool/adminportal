import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseConfig } from "./config";

// Get the Firebase configuration based on environment or fallback
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Firestore limits 'in' queries to 10 items maximum.
 * This constant is used throughout the codebase to chunk large ID arrays
 * when fetching multiple documents by ID.
 *
 * @see https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 */
export const CHUNK_SIZE = 10;

// Export Firebase app instance
export default app;
