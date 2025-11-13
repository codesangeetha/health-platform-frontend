import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DoctorService } from '../../services/doctor/doctor.service';
import '../../styles/components/doctor-dashboard.styles.css';

interface DoctorHeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const DoctorHeader = () => {
  const { authState, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Fetch doctor profile to get the actual name
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await DoctorService.getCurrentDoctorProfile();
        setDoctorProfile(response.data);
      } catch (error) {
        console.warn('Failed to fetch doctor profile:', error);
      }
    };

    if (authState?.user?.userType === 'doctor') {
      fetchDoctorProfile();
    }
  }, [authState?.user?.userType]);

  // Get current path to determine active link
  const currentPath = location.pathname;

  // Navigation links configuration
  const navLinks = [
    { path: '/doctor/dashboard', label: 'Dashboard' },
    { path: '/doctor/appointments', label: 'Appointments' },
    { path: '/doctor/profile', label: 'Profile' }
  ];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    // Try to use doctor's actual name from profile
    if (doctorProfile && (doctorProfile.firstName || doctorProfile.lastName)) {
      const firstName = doctorProfile.firstName || '';
      const lastName = doctorProfile.lastName || '';
      const parts = `${firstName} ${lastName}`.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      } else if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
    }
    
    // Fallback to email
    if (authState.user) {
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
    // Try to use doctor's actual name from profile
    if (doctorProfile && (doctorProfile.firstName || doctorProfile.lastName)) {
      const firstName = doctorProfile.firstName || '';
      const lastName = doctorProfile.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return `Dr. ${fullName}`;
      }
    }
    
    // Fallback to email
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