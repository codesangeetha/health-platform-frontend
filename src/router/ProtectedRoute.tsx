import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'doctor' | 'patient';
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps = {}) {
  const { authState, getCurrentSession } = useAuth();
  const location = useLocation();

  // Get the current session
  const currentSession = getCurrentSession();

  // If still loading (including initial load), show loading state to prevent flicker
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

  // Get the appropriate session based on requiredRole or current path
  let targetUserType: 'patient' | 'doctor' | 'admin' | null = null;
  let targetSession = currentSession;

  if (requiredRole) {
    targetUserType = requiredRole;
    targetSession = authState.sessions[requiredRole];
  } else {
    // Determine user type from path
    if (location.pathname.startsWith('/admin')) {
      targetUserType = 'admin';
      targetSession = authState.sessions.admin;
    } else if (location.pathname.startsWith('/doctor')) {
      targetUserType = 'doctor';
      targetSession = authState.sessions.doctor;
    } else if (location.pathname.startsWith('/patient')) {
      targetUserType = 'patient';
      targetSession = authState.sessions.patient;
    }
  }

  // Only redirect to login after loading is complete and user is not authenticated
  if (!targetSession?.isAuthenticated || !targetSession?.token) {
    // Determine the appropriate login page based on the current path or required role
    let loginPath = '/';
    
    if (targetUserType === 'admin' || location.pathname.startsWith('/admin')) {
      loginPath = '/admin/login';
    } else if (targetUserType === 'doctor' || location.pathname.startsWith('/doctor')) {
      loginPath = '/doctor/login';
    } else if (targetUserType === 'patient' || location.pathname.startsWith('/patient')) {
      loginPath = '/patient/login';
    }

    // Save the current location to redirect back after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (requiredRole && targetSession.user?.userType !== requiredRole) {
    console.warn(`Access denied: User role '${targetSession.user?.userType}' cannot access '${requiredRole}' routes`);
    
    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    switch (targetSession.user?.userType) {
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
