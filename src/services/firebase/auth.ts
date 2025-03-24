import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
  FirebaseError
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from './core';
import { userDB } from './collections';

/**
 * Interface for a VFS Admin user, extending Firebase User with additional properties
 */
export interface User extends FirebaseUser {
  isAdmin?: boolean;
  displayName?: string | null;
  [key: string]: any; // Additional properties from Firestore
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user as User;
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user as User;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: 'https://admin.villagefreeschool.org/reset-password?email=' + email,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(user: FirebaseUser): Promise<User> {
  if (!user.email) {
    return user as User;
  }

  try {
    const userDocRef = doc(userDB, user.email.toLowerCase());
    const userDoc = await getDoc(userDocRef);

    let userToReturn = { ...user } as User;

    if (userDoc.exists()) {
      userToReturn = { ...userToReturn, ...userDoc.data() };
    }

    return userToReturn;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return user as User;
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = await getUserData(user);
      callback(userData);
    } else {
      callback(null);
    }
  });
}
