import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PharmAdminRoute = () => {
  const { authState } = useAuth();
  const location = useLocation();

  // Check both pharmadmin session and admin session (in case pharmadmin logged in via admin login)
  const isPharmAdminAuthenticated = authState.sessions.pharmadmin?.isAuthenticated;
  const isAdminAuthenticated = authState.sessions.admin?.isAuthenticated;
  
  // Get current user from either session
  const currentUser = isPharmAdminAuthenticated 
    ? authState.sessions.pharmadmin.user 
    : isAdminAuthenticated 
      ? authState.sessions.admin.user 
      : null;

  // If no authenticated session, redirect to admin login
  if (!isPharmAdminAuthenticated && !isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not a pharmadmin, redirect to appropriate dashboard
  if (currentUser?.userType !== 'pharmadmin') {
    if (currentUser?.userType === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser?.userType === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (currentUser?.userType === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    // If unknown user type, redirect to home
    return <Navigate to="/" replace />;
  }

  // Allow pharmadmin user to access pharmadmin routes
  return <Outlet />;
};