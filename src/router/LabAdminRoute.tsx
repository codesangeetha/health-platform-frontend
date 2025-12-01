import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LabAdminRoute = () => {
  const { authState } = useAuth();
  const location = useLocation();

  // Check both labadmin session and admin session (in case labadmin logged in via admin login)
  const isLabAdminAuthenticated = authState.sessions.labadmin?.isAuthenticated;
  const isAdminAuthenticated = authState.sessions.admin?.isAuthenticated;
  
  // Get current user from either session
  const currentUser = isLabAdminAuthenticated 
    ? authState.sessions.labadmin.user 
    : isAdminAuthenticated 
      ? authState.sessions.admin.user 
      : null;

  // If no authenticated session, redirect to admin login
  if (!isLabAdminAuthenticated && !isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not a labadmin, redirect to appropriate dashboard
  if (currentUser?.userType !== 'labadmin') {
    if (currentUser?.userType === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser?.userType === 'pharmadmin') {
      return <Navigate to="/pharmadmin/dashboard" replace />;
    } else if (currentUser?.userType === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (currentUser?.userType === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    // If unknown user type, redirect to home
    return <Navigate to="/" replace />;
  }

  // Allow labadmin user to access labadmin routes
  return <Outlet />;
};