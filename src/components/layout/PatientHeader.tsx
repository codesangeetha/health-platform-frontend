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
  };

  // Get current path to determine active link
  const currentPath = location.pathname;

  // Navigation links configuration
  const navLinks = [
    { path: '/patient/dashboard', label: 'Dashboard' },
    { path: '/patient/doctor-directory', label: 'Doctor Directory' },
    { path: '/patient/my-appointments', label: 'My Appointments' },
    { path: '/patient/profile', label: 'Profile' }
  ];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const currentSession = authState.sessions[authState.currentUserType || 'patient'];
    if (currentSession?.user?.firstName || currentSession?.user?.lastName) {
      const firstName = currentSession.user.firstName || '';
      const lastName = currentSession.user.lastName || '';
      const parts = `${firstName} ${lastName}`.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      } else if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
    }
    
    // Fallback to email
    const email = currentSession?.user?.email || '';
    if (email) {
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
    const currentSession = authState.sessions[authState.currentUserType || 'patient'];
    if (currentSession?.user?.firstName || currentSession?.user?.lastName) {
      const firstName = currentSession.user.firstName || '';
      const lastName = currentSession.user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }
    
    // Fallback to email
    return currentSession?.user?.email || 'User';
  };

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
            <div className="pd-user-profile">
              <div className="pd-avatar" aria-label="Profile" title={getUserDisplayName()}>
                {getUserInitials()}
              </div>
              <div className="pd-user-info">
                <span className="pd-user-name">{getUserDisplayName()}</span>
              </div>
            </div>
            <button className="pd-logout-btn" onClick={handleLogout}>
              <span className="pd-logout-icon">🚪</span>
              <span className="pd-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};