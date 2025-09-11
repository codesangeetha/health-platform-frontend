import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthService } from '@/services/auth/auth.service';
import { PatientDashboard } from '@/features/patient/dashboard/PatientDashboard';
import '@/styles/components/dashboard.styles.css';

export const Dashboard = () => {
  const { authState, setAuthState } = useContext(AuthContext);

  const handleLogout = () => {
    AuthService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  if (!authState.user) {
    return null;
  }

  if (authState.user.userType === 'patient') {
    return <PatientDashboard />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {authState.user.email}</h1>
          <p>User Type: {authState.user.userType}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        {/* Add non-patient dashboard content here */}
      </div>
    </div>
  );
};
