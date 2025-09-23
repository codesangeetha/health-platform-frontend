import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/patient-dashboard.styles.css';

interface PatientHeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const PatientHeader = () => {
  const { authState, logout } = useContext(AuthContext);
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/patient/login';
  };

  // Get current path to determine active link
  const currentPath = location.pathname;
  
  // Navigation links configuration
  const navLinks = [
    { path: '/patient/dashboard', label: 'Dashboard' },
    { path: '/patient/doctor-directory', label: 'Doctor Directory' },
    { path: '/patient/my-appointments', label: 'My Appointments' },
    { path: '/patient/profile', label: 'Profile' },
    { path: '/patient/settings', label: 'Settings' }
  ];

  return (
    <>
      {/* Top Navigation */}
      <header className="pd-top-nav">
        <div className="pd-top-nav-inner">
          <div className="pd-brand">
            <Link to="/patient/dashboard" className="hc-logo" aria-label="HealthCare+ Home">
              <span className="hc-logo__mark">+</span>
              <span>HealthCare+</span>
            </Link>
          </div>
          <nav className="pd-nav-links" aria-label="Primary">
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
          <div className="pd-nav-right">
            <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
            <div className="pd-avatar" aria-label="Profile" />
            <button className="pd-logout-link" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
    </>
  );
};