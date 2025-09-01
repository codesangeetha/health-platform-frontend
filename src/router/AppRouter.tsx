import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from '../features/authentication/Login';
import { Register } from '../features/authentication/Register';
import { Home } from '../pages/Home';
import { Dashboard } from '../pages/Dashboard';
import { ProtectedRoute } from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
