import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

export const ContactPage = () => {
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

      {/* Contact Content */}
      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h1>Contact Us</h1>
            <p className="hc-muted">
              We're here to help. Get in touch with us through any of the following channels.
            </p>
          </div>

          <div className="hc-card-grid">
            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">📞</span>
                <div>
                  <h3>Phone Support</h3>
                  <p>Call us for immediate assistance</p>
                  <p><strong>24/7 Support:</strong> 1-800-HEALTHCARE</p>
                  <p><strong>Emergency:</strong> 1-800-EMERGENCY</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">✉️</span>
                <div>
                  <h3>Email Support</h3>
                  <p>Send us an email and we'll respond within 24 hours</p>
                  <p><strong>General Inquiries:</strong> info@healthcareplus.com</p>
                  <p><strong>Support:</strong> support@healthcareplus.com</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">📍</span>
                <div>
                  <h3>Office Location</h3>
                  <p>Visit our headquarters</p>
                  <p>
                    123 Healthcare Plaza<br />
                    Medical District<br />
                    Healthcare City, HC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🕒</span>
                <div>
                  <h3>Business Hours</h3>
                  <p>When you can reach us</p>
                  <p><strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM</p>
                  <p><strong>Saturday:</strong> 9:00 AM - 6:00 PM</p>
                  <p><strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </article>

            <article className="hc-card">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🐦</span>
                <div>
                  <h3>Social Media</h3>
                  <p>Follow us for updates and health tips</p>
                  <p><strong>Facebook:</strong> @HealthCarePlus</p>
                  <p><strong>Twitter:</strong> @HealthCarePlus</p>
                  <p><strong>Instagram:</strong> @healthcareplus</p>
                  <p><strong>LinkedIn:</strong> HealthCare Plus</p>
                </div>
              </div>
            </article>
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