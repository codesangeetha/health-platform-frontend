import type { ReactNode } from 'react';
import { PatientHeader } from './PatientHeader';
import '../../styles/components/patient-dashboard.styles.css';

interface PatientLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const PatientLayout = ({ children, pageTitle, pageSubtitle }: PatientLayoutProps) => {
  return (
    <>
      <PatientHeader />
      <main className="pd-container">
        {(pageTitle || pageSubtitle) && (
          <section className="pd-banner">
            <h5>{pageTitle}</h5>
            {pageSubtitle && <p>{pageSubtitle}</p>}
            <div className="pd-banner-avatar" aria-hidden="true" />
          </section>
        )}
        {children}
      </main>
      <footer className="pd-footer">
        <div className="pd-footer-inner">
          <div className="pd-footer-grid">
            <div className="pd-footer-section">
              <div className="pd-footer-brand">
                <span className="pd-footer-logo" aria-hidden="true" />
                <div>
                  <strong>Doctor Appointment Booker</strong>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                    Accessible healthcare for everyone.
                  </div>
                </div>
              </div>
            </div>
            <div className="pd-footer-section">
              <h6>Quick Links</h6>
              <ul className="pd-footer-links">
                <li>Find Doctors</li>
                <li>Book Appointment</li>
                <li>Health Records</li>
              </ul>
            </div>
            <div className="pd-footer-section">
              <h6>Support</h6>
              <ul className="pd-footer-links">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div className="pd-footer-section">
              <h6>Contact</h6>
              <ul className="pd-footer-info">
                <li>support@example.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="pd-footer-copy">© 2025 Placeholder. All rights reserved.</div>
        </div>
      </footer>
      {/* Help icon removed */}
    </>
  );
};