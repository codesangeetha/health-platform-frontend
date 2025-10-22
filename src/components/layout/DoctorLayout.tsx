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
        </main>
      )}
    </>
  );
};