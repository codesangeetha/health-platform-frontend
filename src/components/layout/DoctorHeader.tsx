import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/components/doctor-dashboard.styles.css';

interface DoctorHeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const DoctorHeader = () => {
  const { authState, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Get current path to determine active link
  const currentPath = location.pathname;

  // Navigation links configuration
  const navLinks = [
    { path: '/doctor/dashboard', label: 'Dashboard' },
    { path: '/doctor/appointments', label: 'Appointments' },
    { path: '/doctor/patients', label: 'Patients' },
    { path: '/doctor/schedule', label: 'Schedule' },
    { path: '/doctor/profile', label: 'Profile' },
    { path: '/doctor/settings', label: 'Settings' }
  ];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (authState.user) {
      // Try to extract initials from email if no name available
      const email = authState.user.email;
      const emailPrefix = email.split('@')[0];
      const parts = emailPrefix.split(/[._-]/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      } else {
        return email.charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (authState.user) {
      return authState.user.email;
    }
    return 'User';
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="dd-header">
        <div className="dd-header-bar">
          <div className="dd-brand">
            <Link to="/doctor/dashboard" className="hc-logo" aria-label="HealthCare+ Home">
              <span className="hc-logo__mark">+</span>
              <span>HealthCare+</span>
            </Link>
          </div>
          <nav className="dd-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={currentPath === link.path ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="dd-user">
            <div className="dd-user-profile">
              <div className="dd-avatar" aria-label="Profile" title={getUserDisplayName()}>
                {getUserInitials()}
              </div>
              <div className="dd-user-info">
                <span className="dd-user-name">{getUserDisplayName()}</span>
              </div>
            </div>
            <button className="dd-logout-btn" onClick={handleLogout}>
              <span className="dd-logout-icon">🚪</span>
              <span className="dd-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};