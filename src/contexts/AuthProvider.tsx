/**
 * AuthProvider - Central authentication and user data management
 *
 * This component wraps the entire app and provides authentication state and
 * methods to any component that needs them (via the useAuth() hook).
 * It automatically loads user data when someone logs in and keeps it synced.
 *
 * Key concepts:
 * - Firebase Auth handles login/logout (email/password and Google OAuth)
 * - Firestore stores additional user data in two collections:
 *   1. userFamilies: Links user email → family ID
 *   2. families: Contains full family data (guardians, students, etc.)
 */

import {
  createUserWithEmail,
  getAuthRedirectResult,
  logoutUser,
  resetPassword,
  signInWithEmail,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  subscribeToAuthChanges,
  type User,
} from "@services/firebase/auth";
import { familyDB, userFamilyDB } from "@services/firebase/collections";
import type { Family, UserFamily } from "@services/firebase/models/types";
import type { FirebaseError } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Shape of the authentication context available to all components
 */
export interface AuthContextType {
  // User data
  currentUser: User | null; // Firebase auth user (email, isAdmin flag)
  userFamily: UserFamily | null; // Link between user email and family ID
  myFamily: Family | null; // Full family data (guardians, students, etc.)

  // Derived values (calculated from currentUser)
  isAdmin: boolean; // Does user have admin permissions?
  isAuthenticated: boolean; // Is user logged in (and not anonymous)?
  isLoading: boolean; // Is auth state still initializing?

  // Authentication methods
  login: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  checkRedirectResult: () => Promise<User | null>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;

  // Error state
  error: string | null; // Last authentication error message
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userFamily, setUserFamily] = useState<UserFamily | null>(null);
  const [myFamily, setMyFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Listen for Firebase Auth state changes and automatically load user data
   *
   * This runs once when the app loads and sets up a real-time listener.
   * Whenever auth state changes (login/logout), this callback fires.
   *
   * Data loading chain:
   * 1. Firebase Auth provides user object (email, uid)
   * 2. Look up userFamilies/{email} to get familyID
   * 3. Look up families/{familyID} to get full family data
   */
  useEffect(() => {
    setIsLoading(true);

    // subscribeToAuthChanges returns an unsubscribe function
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);

      if (user?.email) {
        try {
          // Step 1: Get the link between user email and family ID
          const userFamilyDocRef = doc(userFamilyDB, user.email.toLowerCase());
          const userFamilyDoc = await getDoc(userFamilyDocRef);

          if (userFamilyDoc.exists()) {
            const userFamilyData = userFamilyDoc.data() as UserFamily;
            setUserFamily(userFamilyData);

            // Step 2: Get the full family data using the familyID
            if (userFamilyData.familyID) {
              const familyDocRef = doc(familyDB, userFamilyData.familyID);
              const familyDoc = await getDoc(familyDocRef);

              if (familyDoc.exists()) {
                setMyFamily({
                  id: familyDoc.id,
                  ...familyDoc.data(),
                } as Family);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching user family data:", err);
        }
      } else {
        // User logged out - clear family data
        setUserFamily(null);
        setMyFamily(null);
      }

      setIsLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   * Note: User data loads automatically via the auth state listener above
   */
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmail(email, password);
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Create a new user account with email and password
   * Note: This only creates the Firebase Auth account. Admin must still
   * create a userFamilies document to link this user to a family.
   */
  const createAccount = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmail(email, password);
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Sign in with Google using a popup window
   * Best for desktop browsers
   */
  const loginWithGooglePopup = async () => {
    try {
      setError(null);
      await signInWithGooglePopup();
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Sign in with Google using a redirect flow
   * Better for mobile devices where popups may be blocked
   * User leaves the page and returns after authenticating
   */
  const loginWithGoogleRedirect = async () => {
    try {
      setError(null);
      await signInWithGoogleRedirect();
      // Page will redirect away, so no code after this runs
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Check if user just returned from Google redirect flow
   * Call this on app load to complete the redirect authentication
   */
  const checkRedirectResult = async () => {
    try {
      setError(null);
      return await getAuthRedirectResult();
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Sign out the current user and redirect to login page
   */
  const logout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  /**
   * Send password reset email to the specified address
   * User will receive an email with a link to reset their password
   */
  const sendPasswordReset = async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  // Package everything into the context value
  const value = {
    currentUser,
    userFamily,
    myFamily,
    isAdmin: !!currentUser?.isAdmin, // Derived: true if currentUser has isAdmin flag
    isAuthenticated: !!currentUser && !currentUser.isAnonymous, // Derived: logged in and not anonymous
    isLoading,
    login,
    createAccount,
    loginWithGooglePopup,
    loginWithGoogleRedirect,
    checkRedirectResult,
    logout,
    sendPasswordReset,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
