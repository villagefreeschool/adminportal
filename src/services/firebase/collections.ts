import { collection } from "firebase/firestore";
import { db } from "./core";

/**
 * Firestore collection references for the VFS Admin Portal.
 *
 * Import these instead of creating collection() calls throughout the app
 * to ensure consistent collection naming and easier refactoring.
 */

/** User accounts with permissions (document ID = email) */
export const userDB = collection(db, "users");

/** Family records with embedded guardians and students */
export const familyDB = collection(db, "families");

/** Denormalized student data for efficient cross-family queries */
export const studentDB = collection(db, "students");

/** School year configurations and tuition parameters */
export const yearDB = collection(db, "years");

/** Links user emails to family IDs for access control (document ID = email) */
export const userFamilyDB = collection(db, "userFamilies");
