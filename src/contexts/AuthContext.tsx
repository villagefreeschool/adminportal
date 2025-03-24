import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmail,
  signInWithGooglePopup,
  resetPassword,
  logoutUser,
  subscribeToAuthChanges,
} from '../services/firebase/auth';
import { userFamilyDB, familyDB } from '../services/firebase/collections';
import { useNavigate } from 'react-router-dom';
import { Family, UserFamily } from '../services/firebase/models/types';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userFamily: UserFamily | null;
  myFamily: Family | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setCurrentUser(user);

      if (user && user.email) {
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
          console.error('Error fetching user family data:', err);
        }
      } else {
        setUserFamily(null);
        setMyFamily(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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

  // Removed redirect authentication in favor of popup method

  // Other OAuth providers removed to simplify the implementation

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
      navigate('/login');
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
    logout,
    sendPasswordReset,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Extract to a separate file later to avoid the react-refresh/only-export-components warning
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
