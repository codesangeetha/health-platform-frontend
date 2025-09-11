import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../../styles/components/patient-dashboard.styles.css';

export const PatientDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const displayName = authState.user?.email?.split('@')[0] || 'Patient';

  return (
    <>
      {/* Top Navigation */}
      <header className="pd-top-nav">
        <div className="pd-top-nav-inner">
          <div className="pd-brand">
            
           <Link to="/patient/dashboard" className="hc-logo" aria-label="HealthCare+ Home">
            <span className="hc-logo__mark">+</span>
            <span>HealthCare+</span>
          </Link>
          </div>
          <nav className="pd-nav-links" aria-label="Primary">
            <Link to="/patient/dashboard" className="active">Dashboard</Link>
            <a href="#">Doctor Directory</a>
            <a href="#">Appointment Schedule</a>
            <Link to="/patient/profile">Profile</Link>
            <a href="#">Settings</a>
          </nav>
          <div className="pd-nav-right">
            <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
            <div className="pd-avatar" aria-label="Profile" />
            <button className="pd-logout-link" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Container */}
      <main className="pd-container">
        {/* Welcome banner */}
        <section className="pd-banner">
          <h5>Welcome back, {displayName}!</h5>
          <div className="pd-banner-avatar" aria-hidden="true" />
        </section>

        {/* Main grid */}
        <section className="pd-grid">
          {/* Left column: 8 */}
          <div className="pd-col-8">
            {/* Metrics */}
            <div className="pd-card">
              <div className="pd-stats-grid">
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">📅</div>
                  <div>
                    <div className="pd-stat-value">2</div>
                    <div className="pd-stat-label">Upcoming Appointments</div>
                  </div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">💊</div>
                  <div>
                    <div className="pd-stat-value">3</div>
                    <div className="pd-stat-label">Active Prescriptions</div>
                  </div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">🏥</div>
                  <div>
                    <div className="pd-stat-value">Aug 25</div>
                    <div className="pd-stat-label">Last Visit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="pd-card" style={{ marginTop: '24px' }}>
              <div className="pd-appointments-head">
                <h6>Upcoming Appointments</h6>
                <a className="pd-link" href="#">View All</a>
              </div>

              <div className="pd-appointment-item">
                <div className="pd-doc-avatar" aria-hidden="true" />
                <div className="pd-appointment-details">
                  <h5>Dr. Placeholder Name</h5>
                  <p>General Physician • Wed, Sept 5 • 10:00 AM</p>
                </div>
                <div className="pd-appointment-actions">
                  <span className="pd-chip">Reschedule</span>
                  <span className="pd-chip pd-chip-primary">View Details</span>
                </div>
              </div>

              <div className="pd-appointment-item">
                <div className="pd-doc-avatar" aria-hidden="true" />
                <div className="pd-appointment-details">
                  <h5>Dr. Placeholder Name</h5>
                  <p>Dentistry • Thu, Sept 12 • 2:30 PM</p>
                </div>
                <div className="pd-appointment-actions">
                  <span className="pd-chip">Reschedule</span>
                  <span className="pd-chip pd-chip-primary">View Details</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: 4 */}
          <aside className="pd-col-4">
            {/* Quick Actions */}
            <div className="pd-card">
              <h6>Quick Actions</h6>
              <div className="pd-actions">
                <button className="pd-btn pd-btn-primary-light">
                  <span className="pd-btn-icon" style={{ background: 'rgba(0, 123, 255, 0.16)', color: 'var(--color-primary-blue)' }}>＋</span>
                  Book New Appointment
                </button>
                <button className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon" style={{ background: 'var(--color-tertiary-gray)' }}>🔎</span>
                  Find Doctor
                </button>
                <button className="pd-btn pd-btn-outlined">
                  <span className="pd-btn-icon" style={{ background: 'var(--color-tertiary-gray)' }}>📋</span>
                  View Medical History
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pd-card" style={{ marginTop: '24px' }}>
              <h6>Recent Activity</h6>
              <div className="pd-activity-item">
                <div className="pd-activity-icon">✓</div>
                <div className="pd-activity-text">Appointment confirmed with Dr. Placeholder</div>
                <div className="pd-activity-time">2h ago</div>
              </div>
              <div className="pd-activity-item">
                <div className="pd-activity-icon">✓</div>
                <div className="pd-activity-text">Lab results uploaded</div>
                <div className="pd-activity-time">1d ago</div>
              </div>
            </div>

            {/* Health Tips */}
            <div className="pd-card" style={{ marginTop: '24px' }}>
              <h6>Health Tips</h6>
              <div className="pd-tip-item">
                <p className="pd-tip-title">Stay Hydrated</p>
                <p className="pd-tip-desc">Drink at least 8 glasses of water daily to maintain good health.</p>
              </div>
              <div className="pd-tip-item">
                <p className="pd-tip-title">Regular Exercise</p>
                <p className="pd-tip-desc">Aim for 30 minutes of moderate activity most days of the week.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* Footer */}
      <footer className="pd-footer">
        <div className="pd-footer-inner">
          <div className="pd-footer-grid">
            <div className="pd-footer-section">
              <div className="pd-footer-brand">
                <span className="pd-footer-logo" aria-hidden="true" />
                <div>
                  <strong>Doctor Appointment Booker</strong>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Accessible healthcare for everyone.</div>
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

      {/* Floating help icon */}
      <div className="pd-help-fab" title="Help" aria-label="Help">?</div>
    </>
  );
};
