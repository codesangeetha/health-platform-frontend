import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { PatientLayout } from '../../../components/layout/PatientLayout';
import '../../../styles/components/patient-dashboard.styles.css';

export const PatientDashboard = () => {
  const { authState } = useContext(AuthContext);
  const displayName = authState.user?.email?.split('@')[0] || 'Patient';

  return (
    <PatientLayout pageTitle={`Welcome back, ${displayName}!`}>

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
      </PatientLayout>
    );
};
