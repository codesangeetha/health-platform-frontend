import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { PatientLogin } from './features/auth/PatientLogin';
import { DoctorLogin } from './features/auth/DoctorLogin';
import { ProtectedRoute } from './router/ProtectedRoute';
import { PatientDashboard } from './features/patient/dashboard/PatientDashboard';
import { DoctorDashboard } from './features/doctor/dashboard/DoctorDashboard';
import { PatientRegister } from './features/auth/PatientRegister';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ResetPassword } from './features/auth/ResetPassword';
import { PatientProfile } from './features/patient/profile/PatientProfile';
import { PatientProfileEdit } from './features/patient/profile/PatientProfileEdit';
import { DoctorProfile } from './features/doctor/profile/DoctorProfile';
import { DoctorProfileEdit } from './features/doctor/profile/DoctorProfileEdit';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/patient/login',
    element: <PatientLogin />,
  },
  {
    path: '/patient/register',
    element: <PatientRegister />,
  },
  {
    path: '/doctor/login',
    element: <DoctorLogin />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/patient',
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
      },

    ],
  },
  {
    path: '/doctor',
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
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
