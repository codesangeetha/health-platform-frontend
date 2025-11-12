import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { DoctorRoute } from './DoctorRoute';
import { PatientRoute } from './PatientRoute';
import { useAuth } from '../context/AuthContext';
import { PatientProfile } from '../features/patient/profile/PatientProfile';
import { DoctorDirectory } from '../features/patient/doctor-directory/DoctorDirectory';
import { BookAppointment } from '../features/patient/book-appointment/BookAppointment';
import { MyAppointments } from '../features/patient/my-appointments/MyAppointments';
import { RescheduleAppointment } from '../features/patient/reschedule-appointment/RescheduleAppointment';
import { CancelAppointment } from '../features/patient/cancel-appointment/CancelAppointment';
import { OrderMedicines } from '../features/patient/order-medicines/OrderMedicines';
import { PatientOrders } from '../features/patient/patient-orders/PatientOrders';
import DoctorsPage from '../features/admin/doctors/DoctorsPage';
import { CategoriesPage } from '../features/admin/categories';
import LabTestCategoriesPage from '../features/admin/lab-test-categories/LabTestCategoriesPage';
import LabTestsPage from '../features/admin/lab-tests/LabTestsPage';
import { MedicinesPage } from '../features/admin/medicines';
import AdminLogin from '../features/auth/AdminLogin';
import SpecializationsPage from '../features/admin/specializations/SpecializationsPage';
import { AdminDashboard } from '../features/admin/dashboard/AdminDashboard';
import PatientsPage from '../features/admin/patients/PatientsPage';
import { PatientRegister } from '../features/auth/PatientRegister';
import { RootLayout } from '../components/layout/RootLayout';
import { PatientLogin } from '../features/auth/PatientLogin';
import { DoctorLogin } from '../features/auth/DoctorLogin';
import { ForgotPassword } from '../features/auth/ForgotPassword';
import { ResetPassword } from '../features/auth/ResetPassword';
import GoogleCallback from '../features/auth/GoogleCallback';
import { LandingPage } from '../pages/LandingPage';
import { PatientDashboard } from '../features/patient/dashboard/PatientDashboard';
import VideoCall from '../components/VideoCall/VideoCall';
import { PatientProfileEdit } from '../features/patient/profile/PatientProfileEdit';
import { DoctorDashboard } from '../features/doctor/dashboard/DoctorDashboard';
import { PatientLayout } from '../components/layout/PatientLayout';
import { DoctorAppointments } from '../features/doctor/appointments/DoctorAppointments';
import { DoctorProfile } from '../features/doctor/profile/DoctorProfile';
import { DoctorProfileEdit } from '../features/doctor/profile/DoctorProfileEdit';
import { CreatePrescription } from '../features/doctor/prescription/CreatePrescription';
import { DoctorVideoCallView } from '../features/doctor/video-call/DoctorVideoCallView';
import { PatientVideoCallView } from '../features/patient/video-call/PatientVideoCallView';

// Component to combine PatientRoute with PatientLayout
const ProtectedPatientLayout = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <PatientLayout>
        <Outlet />
      </PatientLayout>
    </ProtectedRoute>
  );
};

const router = createBrowserRouter([
  {
    path: '/auth/google/callback',
    element: <GoogleCallback />,
  },
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
        element: <ProtectedPatientLayout />,
        children: [
          {
            path: 'dashboard',
            element: <PatientDashboard />,
          },
          {
            path: 'video-call',
            element: <VideoCall />,
          },
          {
            path: 'video-call/:appointmentId',
            element: <PatientVideoCallView />,
          },
          {
            path: 'doctor-directory',
            element: <DoctorDirectory />,
          },
          {
            path: 'doctor/:doctorId/book-appointment',
            element: <BookAppointment />,
          },
          {
            path: 'reschedule-appointment/:appointmentId',
            element: <RescheduleAppointment />,
          },
          {
            path: 'cancel-appointment/:appointmentId',
            element: <CancelAppointment />,
          },
          {
            path: 'profile',
            element: <PatientProfile />,
          },
          {
            path: 'profile/edit',
            element: <PatientProfileEdit />,
          },
          {
            path: 'my-appointments',
            element: <MyAppointments />,
          },
          {
            path: 'order-medicines',
            element: <OrderMedicines />,
          },
          {
            path: 'my-orders',
            element: <PatientOrders />,
          }
        ]
      },
      {
        path: 'doctor',
        element: <ProtectedRoute requiredRole="doctor" />,
        children: [
          {
            path: 'dashboard',
            element: <DoctorDashboard />,
          },
          {
            path: 'video-call',
            element: <VideoCall />,
          },
          {
            path: 'appointments',
            element: <DoctorAppointments />,
          },
          {
            path: 'video-call/:appointmentId',
            element: <DoctorVideoCallView />,
          },
          {
            path: 'prescription/:appointmentId',
            element: <CreatePrescription />,
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
        element: <ProtectedRoute requiredRole="admin" />,
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
          },
          {
            path: 'specializations',
            element: <SpecializationsPage />,
          },
          {
            path: 'categories',
            element: <CategoriesPage />,
          },
          {
            path: 'lab-test-categories',
            element: <LabTestCategoriesPage />,
          },
          {
            path: 'lab-tests',
            element: <LabTestsPage />,
          },
          {
            path: 'medicines',
            element: <MedicinesPage />,
          }
        ]
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
