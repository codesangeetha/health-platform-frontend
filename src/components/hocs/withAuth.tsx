import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface WithAuthProps {
  requiredUserType?: 'patient' | 'doctor' | 'admin' | 'pharmadmin' | 'labadmin';
  redirectTo?: string;
}

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredUserType?: 'patient' | 'doctor' | 'admin' | 'pharmadmin' | 'labadmin',
  redirectTo?: string
) => {
  const WithAuthComponent: React.FC<P & WithAuthProps> = ({
    requiredUserType,
    redirectTo = '/login',
    ...props
  }) => {
    const { authState } = useContext(AuthContext);

    // Check if there's a current user type and if they're authenticated
    if (!authState.currentUserType || !authState.sessions[authState.currentUserType].isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }

    // Check if required user type is specified and user has it
    if (requiredUserType && authState.currentUserType !== requiredUserType) {
      // If user doesn't have the required type, redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }

    return <WrappedComponent {...(props as P)} />;
  };

  return WithAuthComponent;
};