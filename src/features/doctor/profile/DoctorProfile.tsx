import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { AuthService } from '../../../services/auth/auth.service';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import '../../../styles/components/patient-dashboard.styles.css';

interface DoctorProfileData {
  doctorId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string; // comma-separated
  licenseNumber?: string;
  experience?: string | number; // years
  consultationFee?: number;
  qualification?: string; // e.g., "MD, MBBS"
  hospital?: string;
  availableDays?: string[];
  availableTime?: {
    start?: string; // HH:mm
    end?: string;   // HH:mm
  };
  rating?: number;
  totalPatients?: number;
  [key: string]: any;
}

export const DoctorProfile = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const token = useMemo(() => authState.token || AuthService.getToken() || '', [authState.token]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    return authState.user?.email?.split('@')[0] || 'Doctor';
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
        let res = await fetch('http://localhost:3000/api/v1/doctors/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fallback to POST if API expects it (based on curl example)
        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await fetch('http://localhost:3000/api/v1/doctors/profile', {
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

        const data: DoctorProfileData = body?.data ?? body;
        if (isMounted) setProfile(data);
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
       navigate('/doctor/profile/edit', { state: { profile } });
  };

  // Helpers
  const chipList = (items?: string[] | string) => {
    if (!items) return ['—'];
    if (Array.isArray(items)) return items.length ? items : ['—'];
    // comma-separated string
    const split = items
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return split.length ? split : ['—'];
  };

  const timeRange = (start?: string, end?: string) => {
    if (!start && !end) return '—';
    return `${start ?? '—'} - ${end ?? '—'}`;
  };

  return (
    <DoctorLayout
      pageTitle={`Profile, Dr. ${displayName}!`}
      pageSubtitle=""
      useDoctorContainer={false}
    >
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
                  <div className="pd-stat-label">License Number</div>
                  <div style={{ color: 'var(--color-text-dark)' }}>{profile?.licenseNumber || '—'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div className="pd-stat-label">Specialization</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {chipList(profile?.specialization).map((s, i) => (
                      <span key={i} className="pd-chip">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="pd-stat-label">Qualification</div>
                  <div style={{ color: 'var(--color-text-dark)' }}>{profile?.qualification || '—'}</div>
                </div>
                <div>
                  <div className="pd-stat-label">Hospital / Clinic</div>
                  <div style={{ color: 'var(--color-text-dark)' }}>{profile?.hospital || '—'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="pd-card" style={{ marginTop: '24px' }}>
            <h6>Practice Details</h6>
            {loading ? (
              <p className="pd-stat-label">Loading…</p>
            ) : error ? (
              <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div className="pd-stat-label">Experience (years)</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.experience ?? '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Consultation Fee</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.consultationFee != null ? `$${profile.consultationFee}` : '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Available Days</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {chipList(profile?.availableDays).map((d, i) => (
                        <span key={i} className="pd-chip">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Available Time</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{timeRange(profile?.availableTime?.start, profile?.availableTime?.end)}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Rating</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.rating ?? '—'}</div>
                  </div>
                  <div>
                    <div className="pd-stat-label">Total Patients</div>
                    <div style={{ color: 'var(--color-text-dark)' }}>{profile?.totalPatients ?? '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="pd-col-4">
          <div className="pd-card">
            <h6>Account</h6>
            {loading ? (
              <p className="pd-stat-label">Loading…</p>
            ) : error ? (
              <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <div className="pd-stat-label">Doctor ID</div>
                  <div style={{ color: 'var(--color-text-dark)', fontFamily: 'monospace' }}>{profile?.doctorId || '—'}</div>
                </div>
                <div>
                  <div className="pd-stat-label">Email</div>
                  <div style={{ color: 'var(--color-text-dark)' }}>{profile?.email || authState.user?.email || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </DoctorLayout>
  );
};
