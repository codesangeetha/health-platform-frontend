import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
}
