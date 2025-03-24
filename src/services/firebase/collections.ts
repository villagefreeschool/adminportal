import { collection } from 'firebase/firestore';
import { db } from './core';

// Define all Firestore collection references
export const userDB = collection(db, 'users');
export const familyDB = collection(db, 'families');
export const studentDB = collection(db, 'students');
export const yearDB = collection(db, 'years');
export const userFamilyDB = collection(db, 'userFamilies');
