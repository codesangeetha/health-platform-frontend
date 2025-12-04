import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

export const NotFoundPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Determine which layout to suggest based on current path
  const getSuggestedAction = () => {
    if (currentPath.startsWith('/patient')) {
      return {
        title: 'Patient Dashboard',
        link: '/patient/dashboard',
        description: 'Return to your patient dashboard to access all available features',
        isAuthenticated: true
      };
    } else if (currentPath.startsWith('/doctor')) {
      return {
        title: 'Doctor Dashboard',
        link: '/doctor/dashboard',
        description: 'Go back to your doctor dashboard',
        isAuthenticated: true
      };
    } else if (currentPath.startsWith('/admin') || currentPath.startsWith('/pharmadmin') || currentPath.startsWith('/labadmin')) {
      return {
        title: 'Admin Dashboard',
        link: '/admin/dashboard',
        description: 'Access the admin dashboard',
        isAuthenticated: true
      };
    } else {
      return {
        title: 'Home',
        link: '/home',
        description: 'Return to the homepage',
        isAuthenticated: false
      };
    }
  };

  const suggestion = getSuggestedAction();

  // Show different content based on whether user is in a protected area
  const isProtectedRoute = currentPath.startsWith('/patient') || 
                          currentPath.startsWith('/doctor') || 
                          currentPath.startsWith('/admin') ||
                          currentPath.startsWith('/pharmadmin') ||
                          currentPath.startsWith('/labadmin');

  // For protected routes, we'll show a simpler layout since header/footer are handled by the layout wrapper
  if (isProtectedRoute) {
    return (
      <div className="pd-container">
        <div className="pd-banner" style={{ 
          flexDirection: 'column', 
          textAlign: 'center', 
          minHeight: '250px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔍</div>
          <h5 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--color-text-dark)' }}>
            Page Not Found
          </h5>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '1rem', 
            color: 'var(--color-text-light)',
            maxWidth: '500px'
          }}>
            The requested link "{currentPath}" doesn't exist. Please check the URL or use the navigation above.
          </p>
        </div>

        <div className="pd-grid" style={{ marginTop: '24px' }}>
          <div className="pd-col-8">
            <div className="pd-card">
              <h6>Possible Solutions</h6>
              <ul style={{ 
                color: 'var(--color-text-light)', 
                lineHeight: '1.6',
                paddingLeft: '20px',
                fontSize: '0.9rem'
              }}>
                <li>Verify the URL is correct and complete</li>
                <li>Try navigating from the menu above</li>
                <li>Use the search or browse available features</li>
              </ul>
            </div>
          </div>
          
          <div className="pd-col-4">
            <div className="pd-card">
              <h6>Quick Navigation</h6>
              <div className="pd-actions">
                {/* General navigation accessible to all users */}
                <Link to="/home" className="pd-btn pd-btn-primary-light">
                  <span className="pd-btn-icon">🏠</span>
                  Home
                </Link>
                
                <Link to="/services" className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon">⚕️</span>
                  Our Services
                </Link>
                
                <Link to="/about" className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon">ℹ️</span>
                  About Us
                </Link>
                
                {/* Authentication options */}
                <Link to="/patient/login" className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon">👤</span>
                  Patient Login
                </Link>
                
                <Link to="/doctor/login" className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon">👨‍⚕️</span>
                  Doctor Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For public routes, show a comprehensive 404 page with proper header and footer like landing page
  return (
    <div>
      {/* Header - same as landing page */}
      <header className={`hc-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="hc-container hc-header__inner">
          <Link to="/" className="hc-logo" aria-label="HealthCare+ Home">
            <span className="hc-logo__mark">+</span>
            <span>HealthCare+</span>
          </Link>
          <nav className="hc-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="hc-section" style={{ paddingTop: '120px' }}>
        <div className="hc-container">
          <div className="hc-section__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
            <h1 style={{ 
              fontSize: 'var(--hc-h1-size)', 
              fontWeight: 'var(--hc-h1-weight)',
              lineHeight: 'var(--hc-h1-line)',
              margin: '0 0 1rem 0',
              color: 'var(--hc-text-primary)'
            }}>
              Page Not Found
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--hc-text-secondary)',
              margin: '0 0 2rem 0'
            }}>
              The page you requested "{currentPath}" doesn't exist or may have been moved.
            </p>
          </div>

          {/* 404 Content */}
          <div className="hc-card-grid" style={{ marginBottom: '3rem' }}>
            <article className="hc-card">
              <h3>What can you do?</h3>
              <ul style={{ 
                color: 'var(--hc-text-secondary)', 
                lineHeight: '1.6',
                paddingLeft: '20px',
                textAlign: 'left'
              }}>
                <li>Check the URL for typos or errors</li>
                <li>Return to a known page using the navigation above</li>
                <li>Explore our services and features</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </article>

            <article className="hc-card">
              <h3>Quick Actions</h3>
              <div className="hc-card__actions" style={{ display: 'grid', gap: '1rem' }}>
                <Link to="/home" className="hc-btn hc-btn--primary" style={{ justifyContent: 'center' }}>
                  🏠 Go Home
                </Link>
                <Link to="/services" className="hc-btn hc-btn--text" style={{ justifyContent: 'center' }}>
                  ⚕️ Our Services
                </Link>
                <Link to="/patient/login" className="hc-btn hc-btn--text" style={{ justifyContent: 'center' }}>
                  👤 Patient Login
                </Link>
              </div>
            </article>

            <article className="hc-card">
              <h3>Need Help?</h3>
              <p style={{ marginBottom: '1rem' }}>
                Contact our support team for assistance with navigation or technical issues.
              </p>
              <div className="hc-card__actions">
                <a 
                  href="mailto:support@healthcare.com"
                  className="hc-btn hc-btn--text"
                  style={{ justifyContent: 'center', display: 'block' }}
                >
                  📧 Email Support
                </a>
              </div>
            </article>
          </div>

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/"
              className="hc-btn hc-btn--primary"
            >
              Go to Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="hc-btn hc-btn--text"
              style={{ 
                border: '1px solid var(--hc-color-primary)',
                background: 'transparent',
                color: 'var(--hc-color-primary)',
                borderRadius: '999px',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </main>

      {/* Footer - same as landing page */}
      <footer id="contact" className="hc-footer" role="contentinfo">
        <div className="hc-container">
          <div className="hc-footer__top">
            <div>
              <div className="hc-logo" aria-label="HealthCare+">
                <span className="hc-logo__mark">+</span>
                <span>HealthCare+</span>
              </div>
              <p className="hc-muted" style={{ marginTop: '1rem' }}>
                Short description of the company.
              </p>
            </div>
            <div>
              <h4>About Us</h4>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><a href="#">Company</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><a href="#services">Appointment</a></li>
                <li><a href="#">Medicines</a></li>
                <li><a href="#">Lab Packages</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="#contact">Email</a></li>
                <li><a href="#contact">Phone</a></li>
                <li><a href="#contact">Socials</a></li>
              </ul>
            </div>
          </div>
          <div className="hc-footer__bottom">© 2025 HealthCare+. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};