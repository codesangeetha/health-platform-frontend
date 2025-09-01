import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/components/dashboard.styles.css';

export const DoctorDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {authState.user?.email?.split('@')[0] || 'Doctor'}</h1>
          <p>Here's your schedule and patient overview</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Schedule Summary</h2>
          <div className="health-stats">
            <div className="stat-item">
              <span className="stat-label">Today's Appointments</span>
              <span className="stat-value">5</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Consultations</span>
              <span className="stat-value">2</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Follow-ups</span>
              <span className="stat-value">3</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Patients</h2>
          <div className="appointments-list">
            <div className="appointment-item">
              <div className="appointment-date">Sept 5, 2025</div>
              <div className="appointment-details">
                <h3>John Doe</h3>
                <p>General Checkup - 10:00 AM</p>
              </div>
            </div>
            <div className="appointment-item">
              <div className="appointment-date">Sept 5, 2025</div>
              <div className="appointment-details">
                <h3>Jane Smith</h3>
                <p>Follow-up - 11:30 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
