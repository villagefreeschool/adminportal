import { createContext } from "react";
import type { User } from "../services/firebase/auth";
import type { Family, UserFamily } from "../services/firebase/models/types";

export interface AuthContextType {
  currentUser: User | null;
  userFamily: UserFamily | null;
  myFamily: Family | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  checkRedirectResult: () => Promise<User | null>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
