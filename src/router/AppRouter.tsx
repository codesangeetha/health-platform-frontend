import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PatientProfile } from '@/features/patient/profile/PatientProfile';
import DoctorsPage from '../features/admin/doctors/DoctorsPage';
import AdminLogin from '../features/auth/AdminLogin';
import { AdminDashboard } from '../features/admin/dashboard/AdminDashboard';
import PatientsPage from '../features/admin/patients/PatientsPage';
import { PatientRegister } from '../features/auth/PatientRegister';
import { RootLayout } from '../components/layout/RootLayout';
import { PatientLogin } from '../features/auth/PatientLogin';
import { DoctorLogin } from '../features/auth/DoctorLogin';
import { ForgotPassword } from '../features/auth/ForgotPassword';
import { ResetPassword } from '../features/auth/ResetPassword';
import { LandingPage } from '../pages/LandingPage';
import { PatientDashboard } from '../features/patient/dashboard/PatientDashboard';
import { PatientProfileEdit } from '../features/patient/profile/PatientProfileEdit';
import { DoctorDashboard } from '../features/doctor/dashboard/DoctorDashboard';
import { DoctorProfile } from '../features/doctor/profile/DoctorProfile';
import { DoctorProfileEdit } from '../features/doctor/profile/DoctorProfileEdit';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" />,
      },
      {
        path: 'patient/login',
        element: <PatientLogin />,
      },
      {
        path: 'doctor/login',
        element: <DoctorLogin />,
      },
      {
        path: 'admin/login',
        element: <AdminLogin />,
      },
      {
        path: 'patient/register',
        element: <PatientRegister />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'home',
        element: <LandingPage />,
      },
      {
        path: 'patient',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <PatientDashboard />,
          },
          {
            path: 'profile',
            element: <PatientProfile />,
          },
          {
            path: 'profile/edit',
            element: <PatientProfileEdit />,
          }
        ]
      },
      {
        path: 'doctor',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DoctorDashboard />,
          },
          {
            path: 'profile',
            element: <DoctorProfile />,
          },
          {
            path: 'profile/edit',
            element: <DoctorProfileEdit />,
          }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'doctors',
            element: <DoctorsPage />,
          },
          {
            path: 'patients',
            element: <PatientsPage />,
          }
        ]
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
