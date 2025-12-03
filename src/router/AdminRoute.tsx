import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { authState } = useAuth();
  
  const isAdminAuthenticated = authState.sessions.admin?.isAuthenticated;
  const isPharmAdminAuthenticated = authState.sessions.pharmadmin?.isAuthenticated;
  
  // Get current user from either session
  const currentUser = isPharmAdminAuthenticated 
    ? authState.sessions.pharmadmin.user 
    : authState.sessions.admin.user;

  // If user is pharmadmin trying to access admin routes, redirect to pharmadmin dashboard
  if (currentUser?.userType === 'pharmadmin' && isPharmAdminAuthenticated) {
    return <Navigate to="/pharmadmin/dashboard" replace />;
  }
  
  // If no admin user is authenticated, use normal admin protection
  if (!isAdminAuthenticated) {
    return (
      <ProtectedRoute requiredRole="admin">
        {children}
      </ProtectedRoute>
    );
  }
  
  // Admin user can access admin routes
  return <>{children}</>;
}