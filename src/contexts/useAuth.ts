/**
 * Hook to access authentication state and methods throughout the app
 *
 * This is the primary way components interact with authentication.
 * It provides access to the current user, their family data, and auth methods.
 *
 * Must be used inside a component that's wrapped by <AuthProvider>
 * (which is set up in main.tsx at the root of the app).
 *
 * @example
 * function MyComponent() {
 *   const { currentUser, isAdmin, login, logout } = useAuth();
 *
 *   if (!currentUser) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return <div>Welcome {currentUser.email}</div>;
 * }
 *
 * @throws Error if used outside of AuthProvider
 */

import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export function useAuth() {
  // Get the auth context value (provided by AuthProvider)
  const context = useContext(AuthContext);

  // If context is undefined, this hook was called outside of AuthProvider
  // This catches developer mistakes early with a clear error message
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
