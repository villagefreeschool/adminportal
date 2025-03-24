import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  logoutUser,
  subscribeToAuthChanges,
  getUserData,
} from '../services/firebase/auth';
import { userFamilyDB, familyDB } from '../services/firebase/collections';
import { useNavigate } from 'react-router-dom';
import { Family, UserFamily } from '../services/firebase/models/types';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userFamily: UserFamily | null;
  myFamily: Family | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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

    const unsubscribe = subscribeToAuthChanges(async (user) => {
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
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await signInWithEmail(email, password);
      // Navigation happens in the auth state change listener
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const user = await signInWithGoogle();
      // Navigation happens in the auth state change listener
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const sendPasswordReset = async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: any) {
      setError(err.message);
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
    loginWithGoogle,
    logout,
    sendPasswordReset,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
