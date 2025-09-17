import { useNavigate } from 'react-router-dom';

const TopBar = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login', { replace: true });
  };

  const TopBarContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 32px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'fixed',
    top: '0',
    right: '0',
    left: '0',
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
    objectFit: 'cover',
  };

  const UserInfo = {
    display: 'flex',
    flexDirection: 'column',
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
        <button
          style={LogoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar;