import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('/admin/dashboard');
  const SidebarContainer = {
    width: '240px',
    backgroundColor: '#FFFFFF',
    padding: '24px',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    height: '100vh',
    position: 'fixed',
    left: '0',
    top: '0',
    bottom: '0',
    overflowY: 'auto',
    zIndex: '100',
    borderRight: '1px solid #E0E0E0',
    boxSizing: 'border-box',
  };

  const Logo = {
    marginBottom: '2rem',
  };

  const HcLogo = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    color: '#1F2937',
    textDecoration: 'none',
  };

  const HcLogoMark = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 800,
  };

  const NavSection = {
    marginBottom: '2rem',
  };

  const NavTitle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#666666',
    marginBottom: '1rem',
    textTransform: 'uppercase',
  };

  const getNavItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    textDecoration: 'none',
    color: isActive ? '#4A90E2' : '#333333',
    backgroundColor: isActive ? '#E9EBFB' : 'transparent',
    borderRadius: '0.5rem',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  });

  const navigationItems: {
    main: Array<{ label: string; icon: string; path: string }>;
    management: Array<{ label: string; icon: string; path: string }>;
  } = {
    main: [
      { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
      { label: 'Doctors', icon: '👨‍⚕️', path: '/admin/doctors' },
      { label: 'Patients', icon: '🏥', path: '/admin/patients' },
      { label: 'Specializations', icon: '🎯', path: '/admin/specializations' },
      { label: 'Medicine Categories', icon: '🏷️', path: '/admin/categories' },
      { label: 'Lab Test Categories', icon: '🧪', path: '/admin/lab-test-categories' },
      { label: 'Lab Tests', icon: '🔬', path: '/admin/lab-tests' },
      { label: 'Medicines', icon: '💊', path: '/admin/medicines' },
      { label: 'Lab Test Orders', icon: '🧪📋', path: '/admin/lab-test-orders' },
      { label: 'Pharmacy Orders', icon: '💊📋', path: '/admin/pharmacy-orders' },
    ],
    management: [],
  };

  const handleNavItemClick = (path: string) => {
    setActiveItem(path);
    navigate(path);
  };

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  return (
    <div style={SidebarContainer as React.CSSProperties}>
      <div style={Logo}>
        <Link to="/" style={HcLogo as React.CSSProperties} aria-label="HealthCare+ Home">
          <span style={HcLogoMark as React.CSSProperties}>+</span>
          <span>HealthCare+</span>
        </Link>
      </div>
      
      <div style={NavSection}>
        <h2 style={NavTitle as React.CSSProperties}>MAIN</h2>
        {navigationItems.main.map((item) => (
          <div
            key={item.label}
            style={getNavItemStyle(activeItem === item.path)}
            onClick={() => handleNavItemClick(item.path)}
          >
            <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {navigationItems.management.length > 0 && (
        <div style={NavSection}>
          <h2 style={NavTitle as React.CSSProperties}>MANAGEMENT</h2>
          {navigationItems.management.map((item) => (
            <div
              key={item.label}
              style={getNavItemStyle(activeItem === item.path)}
              onClick={() => handleNavItemClick(item.path)}
            >
              <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;