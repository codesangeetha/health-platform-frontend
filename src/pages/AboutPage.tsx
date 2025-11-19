import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

export const AboutPage = () => {
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

      {/* About Content */}
      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h1>About HealthCare+</h1>
            <p className="hc-muted">
              Your trusted partner in comprehensive healthcare services.
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>Our Mission</h2>
              <p>
                At HealthCare+, we are committed to providing accessible, affordable, and high-quality healthcare 
                services to our community. We believe that everyone deserves access to quality medical care, 
                and we strive to make healthcare convenient and transparent.
              </p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>Our Vision</h2>
              <p>
                To be the leading healthcare platform that revolutionizes how people access medical services, 
                making quality healthcare available at the click of a button. We envision a future where 
                healthcare is seamlessly integrated into everyday life.
              </p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>Our Values</h2>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Patient-Centric Care:</strong> Every decision we make puts our patients first.</li>
                <li><strong>Quality Excellence:</strong> We maintain the highest standards in all our services.</li>
                <li><strong>Innovation:</strong> We continuously evolve to meet changing healthcare needs.</li>
                <li><strong>Integrity:</strong> We operate with honesty and transparency in all interactions.</li>
                <li><strong>Accessibility:</strong> Healthcare should be available to everyone, everywhere.</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>Our Story</h2>
              <p>
                Founded in 2020, HealthCare+ emerged from the vision of making healthcare more accessible 
                and convenient for patients and healthcare providers alike. What started as a simple 
                appointment booking platform has grown into a comprehensive healthcare ecosystem.
              </p>
              <p>
                Today, we serve thousands of patients monthly, connecting them with qualified healthcare 
                professionals, facilitating seamless consultations, and ensuring access to essential 
                healthcare services including pharmacy services and laboratory tests.
              </p>
            </div>

            <div className="hc-card">
              <h2>Our Team</h2>
              <p>
                Our diverse team of medical professionals, technology experts, and healthcare administrators 
                work together to ensure the highest quality of service. Our medical advisory board includes 
                specialists from leading hospitals and research institutions.
              </p>
              <p>
                We're proud of our network of qualified doctors, nurses, and healthcare professionals who 
                share our commitment to excellence in patient care.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/patient/login" className="hc-btn hc-btn--primary">
              Join Our Community
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