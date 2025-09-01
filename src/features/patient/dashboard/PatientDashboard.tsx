import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/dashboard.styles.css';

export const PatientDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redirect to landing page
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {authState.user?.email?.split('@')[0] || 'Patient'}</h1>
          <p>Here's your health overview</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Health Summary</h2>
          <div className="health-stats">
            <div className="stat-item">
              <span className="stat-label">Last Visit</span>
              <span className="stat-value">Aug 25, 2025</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Upcoming Appointments</span>
              <span className="stat-value">2</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prescriptions</span>
              <span className="stat-value">Active: 3</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-list">
            <div className="appointment-item">
              <div className="appointment-date">Sept 5, 2025</div>
              <div className="appointment-details">
                <h3>Dr. Smith</h3>
                <p>General Checkup - 10:00 AM</p>
              </div>
            </div>
            <div className="appointment-item">
              <div className="appointment-date">Sept 12, 2025</div>
              <div className="appointment-details">
                <h3>Dr. Johnson</h3>
                <p>Follow-up - 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
