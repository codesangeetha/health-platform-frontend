import type { ReactNode } from 'react';
import { DoctorHeader } from './DoctorHeader';

interface DoctorLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  useDoctorContainer?: boolean; // Whether to use doctor-specific container styling
}

export const DoctorLayout = ({
  children,
  pageTitle,
  pageSubtitle,
  useDoctorContainer = false
}: DoctorLayoutProps) => {
  return (
    <>
      <DoctorHeader />
      {useDoctorContainer ? (
        // For pages that need doctor dashboard styling (like dashboard and appointments)
        <div className="doctor-dashboard">
          <div className="dd-container">
            {(pageTitle || pageSubtitle) && (
              <section className="dd-hero" aria-label={pageTitle || 'Page'}>
                <div className="hero-text">
                  <h2>{pageTitle}</h2>
                  {pageSubtitle && <p>{pageSubtitle}</p>}
                </div>
                <div className="hero-icon" aria-hidden>
                  {/* Decorative medical icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Medical icon">
                    <path d="M6 2a1 1 0 0 1 1 1v5a3 3 0 0 0 6 0V3a1 1 0 1 1 2 0v5a5 5 0 0 1-10 0V3a1 1 0 0 1 1-1Zm13 11a3 3 0 0 1 0 6h-2a1 1 0 1 1 0-2h2a1 1 0 1 0 0-2h-2a3 3 0 0 1-3-3V9a1 1 0 1 1 2 0v3a1 1 0 0 0 1 1h2Z" />
                  </svg>
                </div>
              </section>
            )}
            {children}
          </div>
          
          {/* Doctor Dashboard Footer */}
          <footer className="dd-footer" role="contentinfo">
            <div className="dd-footer-inner">
              <div className="dd-footer-grid">
                <div className="dd-footer-section">
                  <div className="dd-footer-brand">
                    <span className="dd-footer-logo" aria-hidden="true" />
                    <div>
                      <h6>HealthCare+ Doctors</h6>
                      <p>Professional healthcare management platform</p>
                    </div>
                  </div>
                </div>
                <div className="dd-footer-section">
                  <h6>Quick Links</h6>
                  <ul className="dd-footer-links">
                    <li>Dashboard</li>
                    <li>Appointments</li>
                    <li>Patients</li>
                    <li>Schedule</li>
                    <li>Profile</li>
                  </ul>
                </div>
                <div className="dd-footer-section">
                  <h6>Tools</h6>
                  <ul className="dd-footer-links">
                    <li>Prescriptions</li>
                    <li>Lab Orders</li>
                    <li>Medical Records</li>
                    <li>Reports</li>
                    <li>Settings</li>
                  </ul>
                </div>
                <div className="dd-footer-section">
                  <h6>Support</h6>
                  <ul className="dd-footer-info">
                    <li>Medical Support</li>
                    <li>Technical Help</li>
                    <li>Training Resources</li>
                    <li>doctor-support@example.com</li>
                  </ul>
                </div>
              </div>
              <div className="dd-footer-copy">© 2025 HealthCare+ Doctors. All rights reserved.</div>
            </div>
          </footer>
        </div>
      ) : (
        // For pages that use patient-style layout (like profile pages)
        <main className="pd-container">
          {(pageTitle || pageSubtitle) && (
            <section className="pd-banner">
              <h5>{pageTitle}</h5>
              {pageSubtitle && <p>{pageSubtitle}</p>}
              <div className="pd-banner-avatar" aria-hidden="true" />
            </section>
          )}
          {children}
          
          {/* Footer for non-dashboard pages */}
          <footer className="pd-footer">
            <div className="pd-footer-inner">
              <div className="pd-footer-grid">
                <div className="pd-footer-section">
                  <div className="pd-footer-brand">
                    <span className="pd-footer-logo" aria-hidden="true" />
                    <div>
                      <h6>HealthCare+ Doctors</h6>
                      <p>Professional healthcare platform</p>
                    </div>
                  </div>
                </div>
                <div className="pd-footer-section">
                  <h6>Quick Links</h6>
                  <ul className="pd-footer-links">
                    <li>Find Doctors</li>
                    <li>Book Appointment</li>
                    <li>My Appointments</li>
                    <li>Health Records</li>
                    <li>Support</li>
                  </ul>
                </div>
                <div className="pd-footer-section">
                  <h6>Support</h6>
                  <ul className="pd-footer-links">
                    <li>Help Center</li>
                    <li>Contact Us</li>
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                    <li>Medical Disclaimer</li>
                  </ul>
                </div>
                <div className="pd-footer-section">
                  <h6>Contact</h6>
                  <ul className="pd-footer-info">
                    <li>support@example.com</li>
                    <li>1-800-HEALTHCARE</li>
                    <li>Available 24/7</li>
                  </ul>
                </div>
              </div>
              <div className="pd-footer-copy">© 2025 HealthCare+. All rights reserved.</div>
            </div>
          </footer>
        </main>
      )}
    </>
  );
};