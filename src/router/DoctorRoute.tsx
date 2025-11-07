import type { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface DoctorRouteProps {
  children: ReactNode;
}

export function DoctorRoute({ children }: DoctorRouteProps) {
  return (
    <ProtectedRoute requiredRole="doctor">
      {children}
    </ProtectedRoute>
  );
}