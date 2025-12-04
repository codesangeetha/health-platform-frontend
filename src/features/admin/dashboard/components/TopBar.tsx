import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';

const TopBar = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login', { replace: true });
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    // First try to get admin data directly from localStorage to ensure we have the latest data
    const adminDataStr = localStorage.getItem('admin');
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        if (adminData.firstName || adminData.lastName) {
          const firstName = adminData.firstName || '';
          const lastName = adminData.lastName || '';
          const parts = `${firstName} ${lastName}`.trim().split(/\s+/);
          if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
          } else if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
          }
        }
        if (adminData.email) {
          const emailPrefix = adminData.email.split('@')[0];
          const parts = emailPrefix.split(/[._-]/);
          if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
          } else {
            return adminData.email.charAt(0).toUpperCase();
          }
        }
      } catch (error) {
        console.error('Error parsing admin data from localStorage for initials:', error);
      }
    }

    // Fallback to authState if localStorage access fails
    const currentSession = authState.sessions[authState.currentUserType || 'admin'];
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
    
    // Final fallback to email or default
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
    return 'A';
  };

  // Get user display name
  const getUserDisplayName = () => {
    // First try to get admin data directly from localStorage to ensure we have the latest data
    const adminDataStr = localStorage.getItem('admin');
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        if (adminData.firstName || adminData.lastName) {
          const firstName = adminData.firstName || '';
          const lastName = adminData.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName) {
            return fullName;
          }
        }
        if (adminData.email) {
          return adminData.email;
        }
      } catch (error) {
        console.error('Error parsing admin data from localStorage:', error);
      }
    }

    // Fallback to authState if localStorage access fails
    const currentSession = authState.sessions[authState.currentUserType || 'admin'];
    if (currentSession?.user?.firstName || currentSession?.user?.lastName) {
      const firstName = currentSession.user.firstName || '';
      const lastName = currentSession.user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }
    
    // Final fallback to email or default
    return currentSession?.user?.email || 'Admin';
  };

  const TopBarContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'fixed',
    top: '0',
    right: '0',
    left: '240px',
    height: '64px',
    zIndex: '90',
    borderBottom: '1px solid #E0E0E0',
    boxSizing: 'border-box',
  };

  const ProfileSection = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const Avatar = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const UserInfo: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const UserName = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#333333',
  };

  const UserRole = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.75rem',
    color: '#666666',
  };

  const LogoutButton = {
    backgroundColor: 'transparent',
    color: '#333333',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    marginLeft: '1.5rem',
    transition: 'color 0.2s ease',
  };

  return (
    <div style={TopBarContainer as React.CSSProperties}>
      <div style={ProfileSection}>
        <div style={Avatar} title={getUserDisplayName()}>
          {getUserInitials()}
        </div>
        <div style={UserInfo}>
          <span style={UserRole}>Administrator</span>
        </div>
      </div>
      <button
        style={LogoutButton}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default TopBar;