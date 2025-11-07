import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'doctor' | 'patient';
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps = {}) {
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

  // Check role-based access control
  if (requiredRole && authState.user?.userType !== requiredRole) {
    console.warn(`Access denied: User role '${authState.user?.userType}' cannot access '${requiredRole}' routes`);
    
    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    switch (authState.user?.userType) {
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      case 'doctor':
        redirectPath = '/doctor/dashboard';
        break;
      case 'patient':
        redirectPath = '/patient/dashboard';
        break;
      default:
        redirectPath = '/';
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Redirecting to your dashboard...</p>
        <Navigate to={redirectPath} replace />
      </div>
    );
  }

  // Return children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
