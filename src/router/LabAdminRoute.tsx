import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LabAdminRoute = () => {
  const { authState } = useAuth();
  const location = useLocation();

  console.log('🏥 [LabAdminRoute] Checking authentication...');
  console.log('📊 [LabAdminRoute] Auth state:', authState);

  // Check both labadmin session and admin session (in case labadmin logged in via admin login)
  const isLabAdminAuthenticated = authState.sessions.labadmin?.isAuthenticated;
  const isAdminAuthenticated = authState.sessions.admin?.isAuthenticated;
  const isPharmAdminAuthenticated = authState.sessions.pharmadmin?.isAuthenticated;
  
  console.log('🔍 [LabAdminRoute] Authentication status:');
  console.log('   - labadmin session:', isLabAdminAuthenticated);
  console.log('   - admin session:', isAdminAuthenticated);
  console.log('   - pharmadmin session:', isPharmAdminAuthenticated);

  // Get current user from either session
  const currentUser = isLabAdminAuthenticated 
    ? authState.sessions.labadmin.user 
    : isAdminAuthenticated 
      ? authState.sessions.admin.user 
      : isPharmAdminAuthenticated
        ? authState.sessions.pharmadmin.user
        : null;

  console.log('👤 [LabAdminRoute] Current user:', currentUser);
  console.log('🔑 [LabAdminRoute] Current user type:', currentUser?.userType);

  // If still loading, show loading state to prevent premature redirects
  if (authState.isLoading) {
    console.log('⏳ [LabAdminRoute] Still loading, showing loading state...');
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

  // If no authenticated session, redirect to admin login
  if (!isLabAdminAuthenticated && !isAdminAuthenticated && !isPharmAdminAuthenticated) {
    console.log('❌ [LabAdminRoute] No authenticated session, redirecting to admin login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not a labadmin, redirect to appropriate dashboard
  if (currentUser?.userType !== 'labadmin') {
    console.log('⚠️ [LabAdminRoute] User is not a labadmin, current user type:', currentUser?.userType);
    
    if (currentUser?.userType === 'admin') {
      console.log('🔄 [LabAdminRoute] Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser?.userType === 'pharmadmin') {
      console.log('🔄 [LabAdminRoute] Redirecting to pharmacy admin dashboard');
      return <Navigate to="/pharmadmin/dashboard" replace />;
    } else if (currentUser?.userType === 'doctor') {
      console.log('🔄 [LabAdminRoute] Redirecting to doctor dashboard');
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (currentUser?.userType === 'patient') {
      console.log('🔄 [LabAdminRoute] Redirecting to patient dashboard');
      return <Navigate to="/patient/dashboard" replace />;
    }
    // If unknown user type, redirect to home
    console.log('❓ [LabAdminRoute] Unknown user type, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ [LabAdminRoute] Authentication successful, allowing access to labadmin routes');
  // Allow labadmin user to access labadmin routes
  return <Outlet />;
};