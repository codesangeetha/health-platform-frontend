import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { authState } = useAuth();
  const location = useLocation();

  // If user is not authenticated (either not loading or loading but no token), redirect to login
  if (!authState.isAuthenticated || !authState.token) {
    // Determine the appropriate login page based on the current path
    let loginPath = '/';

    if (location.pathname.startsWith('/admin')) {
      loginPath = '/admin/login';
    } else if (location.pathname.startsWith('/doctor')) {
      loginPath = '/doctor/login';
    } else if (location.pathname.startsWith('/patient')) {
      loginPath = '/patient/login';
    }

    // Save the current location to redirect back after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If still loading but user is authenticated, show loading state
  if (authState.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return <Outlet />;
}
