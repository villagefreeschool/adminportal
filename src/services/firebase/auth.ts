import type { FirebaseError } from "firebase/app";
import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { userDB } from "./collections";
import { auth } from "./core";

/**
 * Interface for a VFS Admin user, extending Firebase User with additional properties
 */
export interface User extends Omit<FirebaseUser, "displayName"> {
  isAdmin?: boolean;
  displayName?: string | null;
  // Allow additional Firestore fields with unknown type
  [key: string]: unknown;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user as User;
  } catch (error: unknown) {
    console.error("Error signing in with email and password:", error);
    throw error;
  }
}

/**
 * Sign in with Google using popup
 */
export async function signInWithGooglePopup(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user as User;
  } catch (error: unknown) {
    console.error("Error signing in with Google popup:", error);
    throw error;
  }
}

/**
 * Sign in with Google using redirect (preferred for mobile)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider();

    // Set custom parameters to specify the redirect correctly
    provider.setCustomParameters({
      // Force account selection even if one account is available
      prompt: "select_account",
    });

    // Configure auth to handle the login correctly
    auth.useDeviceLanguage();

    console.info("Using redirect authentication flow");
    await signInWithRedirect(auth, provider);

    // No code past this point will execute in the current page load
    console.log("This log should not appear - redirect happened");
  } catch (error: unknown) {
    console.error("Error signing in with Google redirect:", error);
    throw error;
  }
}

// Additional OAuth providers removed to simplify the implementation

/**
 * Get result from redirect sign-in
 */
export async function getAuthRedirectResult(): Promise<User | null> {
  try {
    console.log("Getting redirect result...");

    // Get the redirect result from Firebase auth
    const result = await getRedirectResult(auth);

    if (result) {
      console.log("Redirect auth successful for user:", result.user.email);
      // Get extended user data from Firestore
      const extendedUser = await getUserData(result.user);
      return extendedUser;
    }

    // Check if we already have an authenticated user
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("No redirect result but user is already authenticated:", currentUser.email);
      return currentUser as User;
    }

    console.log("No redirect result and no current user");
    return null;
  } catch (error: unknown) {
    // Handle specific Firebase auth errors
    const firebaseError = error as FirebaseError;
    console.error(
      "Error getting redirect result:",
      firebaseError.code || "unknown",
      firebaseError.message,
    );

    // Let's not throw for certain error types that happen during normal flow
    if (firebaseError.code === "auth/no-auth-event") {
      console.log("No auth event found - this is normal for initial page load");
      return null;
    }

    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `https://admin.villagefreeschool.org/reset-password?email=${email}`,
    });
  } catch (error: unknown) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error("Error signing out:", error);
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
  } catch (error: unknown) {
    console.error("Error fetching user data:", error);
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
