import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

export const ServicesPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* Header */}
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

      {/* Services Content */}
      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h1>Our Services</h1>
            <p className="hc-muted">
              Comprehensive healthcare services designed to meet all your medical needs.
            </p>
          </div>

          <div className="hc-card-grid">
            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🩺</span>
                <div>
                  <h3>General Consultation</h3>
                  <p>Expert medical consultations with experienced doctors across various specializations.</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🏥</span>
                <div>
                  <h3>Specialist Care</h3>
                  <p>Access to specialists in Cardiology, Neurology, Orthopedics, and more.</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">💊</span>
                <div>
                  <h3>Pharmacy Services</h3>
                  <p>Order medicines online with doorstep delivery and competitive prices.</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🔬</span>
                <div>
                  <h3>Lab Tests</h3>
                  <p>Comprehensive lab testing with accurate results and quick turnaround.</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">📱</span>
                <div>
                  <h3>Telemedicine</h3>
                  <p>Video consultations with doctors from the comfort of your home.</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">📋</span>
                <div>
                  <h3>Health Checkups</h3>
                  <p>Regular health screening and preventive care programs.</p>
                </div>
              </div>
            </article>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/patient/login" className="hc-btn hc-btn--primary">
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hc-footer" role="contentinfo">
        <div className="hc-container">
          <div className="hc-footer__top">
            <div>
              <div className="hc-logo" aria-label="HealthCare+">
                <span className="hc-logo__mark">+</span>
                <span>HealthCare+</span>
              </div>
              <p className="hc-muted" style={{ marginTop: '1rem' }}>
                Your trusted partner in comprehensive healthcare services.
              </p>
            </div>
            <div>
              <h4>About Us</h4>
              <ul>
                <li><Link to="/about">Company</Link></li>
                <li><Link to="/about">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><Link to="/services">Appointment</Link></li>
                <li><Link to="/services">Medicines</Link></li>
                <li><Link to="/services">Lab Packages</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><Link to="/contact">Email</Link></li>
                <li><Link to="/contact">Phone</Link></li>
                <li><Link to="/contact">Socials</Link></li>
              </ul>
            </div>
          </div>
          <div className="hc-footer__bottom">© 2025 HealthCare+. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};