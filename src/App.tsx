import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { PatientLogin } from './features/auth/PatientLogin';
import { DoctorLogin } from './features/auth/DoctorLogin';
import { ProtectedRoute } from './router/ProtectedRoute';
import { PatientDashboard } from './features/patient/dashboard/PatientDashboard';

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
    path: '/doctor/login',
    element: <DoctorLogin />,
  },
  {
    path: '/patient',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <PatientDashboard />,
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
