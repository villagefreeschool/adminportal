import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowAnonymous?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  allowAnonymous = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if the route requires admin privileges
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Allow access to authenticated users or anonymous users if allowed
  if (isAuthenticated || allowAnonymous) {
    return <>{children}</>;
  }

  // Redirect to login page if not authenticated
  return <Navigate to="/login" state={{ from: location }} replace />;
}
