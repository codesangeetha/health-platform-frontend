import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthService } from '@/services/auth/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import '@/styles/components/patient-dashboard.styles.css';

// Minimal shape based on patient registration fields; server may return more
interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

interface PatientProfileData {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  dateOfBirth?: string; // ISO
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: EmergencyContact;
  // allow additional fields
  [key: string]: any;
}

export const PatientProfile = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const token = useMemo(() => authState.token || AuthService.getToken() || '', [authState.token]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfileData | null>(null);

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    return authState.user?.email?.split('@')[0] || 'Patient';
  }, [profile, authState.user?.email]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!token) {
        setError('Missing authentication token');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // First try GET
        let res = await fetch('http://localhost:3000/api/v1/patients/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        // If API expects POST due to curl -d, fallback
        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await fetch('http://localhost:3000/api/v1/patients/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          });
        }

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = (body && (body.message || body.error)) || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        // Common API envelope { success, data }
        const data: PatientProfileData = body?.data ?? body;
        if (isMounted) {
          setProfile(data);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleEditProfile = () => {
    // Navigate to edit page; pass current profile in state for prefill (optional)
    navigate('/patient/profile/edit', { state: { profile } });
  };

  // Helpers
  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
  };

  const listOrDash = (list?: string[]) => (list && list.length ? list : ['—']);

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
            <a href="/patient/dashboard">Dashboard</a>
            <a href="#">Doctor Directory</a>
            <a href="#">Appointment Schedule</a>
            <a href="/patient/profile" className="active">Profile</a>
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
          <h5>Profile, {displayName}!</h5>
          <div className="pd-banner-avatar" aria-hidden="true" />
        </section>

        {/* Content Grid */}
        <section className="pd-grid">
          <div className="pd-col-8">
            <div className="pd-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <h6 style={{ margin: 0 }}>Personal Information</h6>
                <button
                  type="button"
                  onClick={handleEditProfile}
                  disabled={loading}
                  aria-label="Edit Profile"
                  title="Edit your profile"
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-accent, #2a9d8f)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Edit Profile
                </button>
              </div>


              {loading ? (
                <p className="pd-stat-label">Loading profile…</p>
              ) : error ? (
                <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div className="pd-stat-label">Full Name</div>
                    <div className="pd-stat-value" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{(profile?.firstName || '') + (profile?.lastName ? ` ${profile.lastName}` : '') || '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Email</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.email || authState.user?.email}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Phone</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.phone || '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">WhatsApp</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.whatsapp || '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Date of Birth</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{formatDate(profile?.dateOfBirth)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pd-card" style={{ marginTop: '24px' }}>
              <h6>Medical Information</h6>
              {loading ? (
                <p className="pd-stat-label">Loading…</p>
              ) : error ? (
                <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div className="pd-stat-label">Blood Group</div>
                      <div style={{ color: 'var(--color-text-dark)' }}>{profile?.bloodGroup || '—'}</div>
                    </div>
                    <div>
                      <div className="pd-stat-label">Chronic Diseases</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {listOrDash(profile?.chronicDiseases).map((d, i) => (
                          <span key={i} className="pd-chip">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div className="pd-stat-label">Allergies</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {listOrDash(profile?.allergies).map((a, i) => (
                        <span key={i} className="pd-chip">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="pd-col-4">
            <div className="pd-card">
              <h6>Emergency Contact</h6>
              {loading ? (
                <p className="pd-stat-label">Loading…</p>
              ) : error ? (
                <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <div className="pd-stat-label">Name</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.emergencyContact?.name || '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Relationship</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.emergencyContact?.relationship || '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Phone</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.emergencyContact?.phone || '—'}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pd-card" style={{ marginTop: '24px' }}>
              <h6>Account</h6>
              <div>
                <div className="pd-stat-label">User ID</div>
                <div style={{ color: 'var(--color-text-light)', fontFamily: 'monospace' }}>{profile?._id || authState.user?.userId || '—'}</div>
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
}
