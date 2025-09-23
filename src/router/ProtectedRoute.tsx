import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { authState } = useAuth();
  const location = useLocation();

  // If still loading, show loading state
  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!authState.isAuthenticated || !authState.token) {
    // Save the current location to redirect back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
