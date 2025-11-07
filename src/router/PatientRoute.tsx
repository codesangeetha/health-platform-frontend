import type { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface PatientRouteProps {
  children: ReactNode;
}

export function PatientRoute({ children }: PatientRouteProps) {
  return (
    <ProtectedRoute requiredRole="patient">
      {children}
    </ProtectedRoute>
  );
}