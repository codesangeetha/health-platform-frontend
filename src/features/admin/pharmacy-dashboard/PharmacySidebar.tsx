import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const PharmacySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('/pharmadmin/dashboard');
  
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

  const navigationItems = [
    { label: 'Dashboard', icon: '📊', path: '/pharmadmin/dashboard' },
    { label: 'Medicines', icon: '💊', path: '/pharmadmin/medicines' },
    { label: 'Pharmacy Orders', icon: '💊📋', path: '/pharmadmin/pharmacy-orders' },
  ];

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
        <h2 style={NavTitle as React.CSSProperties}>PHARMACY ADMIN</h2>
        {navigationItems.map((item) => (
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
    </div>
  );
};

export default PharmacySidebar;