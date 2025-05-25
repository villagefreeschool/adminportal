import {
  type User,
  getAuthRedirectResult,
  logoutUser,
  resetPassword,
  signInWithEmail,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  subscribeToAuthChanges,
} from "@services/firebase/auth";
import { familyDB, userFamilyDB } from "@services/firebase/collections";
import type { Family, UserFamily } from "@services/firebase/models/types";
import type { FirebaseError } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextTypes";

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

  // Auth state listener
  useEffect(() => {
    setIsLoading(true);

    // Set up the auth state listener
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);

      if (user?.email) {
        try {
          // Fetch user family
          const userFamilyDocRef = doc(userFamilyDB, user.email.toLowerCase());
          const userFamilyDoc = await getDoc(userFamilyDocRef);

          if (userFamilyDoc.exists()) {
            const userFamilyData = userFamilyDoc.data() as UserFamily;
            setUserFamily(userFamilyData);

            // Fetch family data
            if (userFamilyData.familyID) {
              const familyDocRef = doc(familyDB, userFamilyData.familyID);
              const familyDoc = await getDoc(familyDocRef);

              if (familyDoc.exists()) {
                setMyFamily({ id: familyDoc.id, ...familyDoc.data() } as Family);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching user family data:", err);
        }
      } else {
        setUserFamily(null);
        setMyFamily(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmail(email, password);
      // Navigation happens in the auth state change listener
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  // Login with Google (popup)
  const loginWithGooglePopup = async () => {
    try {
      setError(null);
      await signInWithGooglePopup();
      // Navigation happens in the auth state change listener
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  // Login with Google (redirect - better for mobile)
  const loginWithGoogleRedirect = async () => {
    try {
      setError(null);
      await signInWithGoogleRedirect();
      // Page will redirect, so no further code will execute here
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message);
      throw err;
    }
  };

  // Check for redirect result (after coming back from redirect flow)
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

  // Other OAuth providers removed to simplify the implementation

  // Logout
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

  // Reset password
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

  const value = {
    currentUser,
    userFamily,
    myFamily,
    isAdmin: !!currentUser?.isAdmin,
    isAuthenticated: !!currentUser && !currentUser.isAnonymous,
    isLoading,
    login,
    loginWithGooglePopup,
    loginWithGoogleRedirect,
    checkRedirectResult,
    logout,
    sendPasswordReset,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The useAuth hook has been moved to its own file: useAuth.ts
