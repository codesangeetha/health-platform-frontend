import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import '../../../styles/components/doctor-dashboard.styles.css';
import '../../../styles/components/patient-dashboard.styles.css';

type Appointment = {
  id: string;
  patientName: string;
  type: string;
  date: string; // ISO date for the day: YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
};

type Patient = {
  id: string;
  name: string;
  lastVisit: string; // ISO string
};

export const DoctorDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calendar state (month navigation)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // Optional: role-based guard to keep doctors on the correct dashboard
  useEffect(() => {
    const role = authState?.user && (authState.user as any)?.role;
    if (role && role !== 'doctor') {
      navigate('/', { replace: true });
    }
  }, [authState?.user, navigate]);

  useEffect(() => {
    let mounted = true;

    // Simulate fetching doctor's dashboard data
    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Replace with real API calls when available
        await new Promise((r) => setTimeout(r, 400));

        const today = new Date();
        const isoToday = today.toISOString().slice(0, 10); // YYYY-MM-DD

        const mockAppointments: Appointment[] = [
          { id: 'a1', patientName: 'John Doe', type: 'General Checkup', date: isoToday, time: '10:00 AM' },
          { id: 'a2', patientName: 'Jane Smith', type: 'Follow-up', date: isoToday, time: '11:30 AM' },
          { id: 'a3', patientName: 'Chris Lee', type: 'Consultation', date: isoToday, time: '01:00 PM' },
          { id: 'a4', patientName: 'Priya Patel', type: 'Dermatology', date: isoToday, time: '02:30 PM' },
          { id: 'a5', patientName: 'Alex Johnson', type: 'Cardiology', date: isoToday, time: '04:00 PM' },
          // Upcoming (tomorrow)
          {
            id: 'a6',
            patientName: 'Mia Gomez',
            type: 'Follow-up',
            date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10),
            time: '09:00 AM'
          }
        ];

        const mockPatients: Patient[] = [
          { id: 'p1', name: 'John Doe', lastVisit: new Date().toISOString() },
          { id: 'p2', name: 'Jane Smith', lastVisit: new Date().toISOString() },
          { id: 'p3', name: 'Chris Lee', lastVisit: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
        ];

        if (!mounted) return;

        setAppointments(mockAppointments);
        setRecentPatients(mockPatients);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Derived stats
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayCounts = useMemo(() => {
    const todays = appointments.filter((a) => a.date === todayISO);
    const pendingConsultations = todays.filter((a) => /consult/i.test(a.type)).length;
    const followUps = todays.filter((a) => /follow/i.test(a.type)).length;

    return {
      todaysAppointments: todays.length,
      pendingConsultations,
      followUps
    };
  }, [appointments, todayISO]);

  const todaysSchedule = useMemo(() => appointments.filter((a) => a.date === todayISO), [appointments, todayISO]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => a.date >= now).slice(0, 5);
  }, [appointments]);

  const displayName = useMemo(() => {
    const email = authState?.user?.email;
    if (!email) return 'Michael Chen'; // fallback similar to example
    return email.split('@')[0];
  }, [authState?.user?.email]);

  // Calendar helpers
  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric'
      }),
    [viewDate]
  );

  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const gridStart = new Date(year, month, 1 - startDay);

    const days: {
      date: Date;
      iso: string;
      inMonth: boolean;
      isToday: boolean;
      hasAppointments: boolean;
    }[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const inMonth = d >= startOfMonth && d <= endOfMonth;
      const todayIso = new Date().toISOString().slice(0, 10);
      const isToday = iso === todayIso;
      const hasAppointments = appointments.some((a) => a.date === iso);
      days.push({ date: d, iso, inMonth, isToday, hasAppointments });
    }

    return days;
  }, [viewDate, appointments]);

  const gotoPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const gotoNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const navItems = [
    { label: 'Dashboard', to: '/doctor/dashboard' },
    { label: 'Appointments', to: '/doctor/appointments' },
    { label: 'Patients', to: '/doctor/patients' },
    { label: 'Schedule', to: '/doctor/schedule' },
    { label: 'Settings', to: '/doctor/settings' }
  ];

  return (
    <DoctorLayout
      pageTitle={`Welcome back, Dr. ${displayName}!`}
      pageSubtitle="Here's your appointment overview and schedule for today."
      useDoctorContainer={true}
    >
      {error && (
        <div className="dd-card" role="alert" aria-live="polite" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>Something went wrong</h3>
          </div>
          <div style={{ padding: '0 var(--ds-space-l) var(--ds-space-l) var(--ds-space-l)' }}>
            <p className="dd-muted">{error}</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <section className="info-grid" aria-label="Statistics">
        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M19 4h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 1 0-2 0v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10h16v8Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : todayCounts.todaysAppointments}</div>
          <div className="label">Today's Appointments</div>
        </div>

        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm3 7V7a3 3 0 0 0-6 0v2h6Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : todayCounts.pendingConsultations}</div>
          <div className="label">Pending Consultations</div>
        </div>

        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 1 1-9 9 9 9 0 0 1 9-9Zm4.3 6.3a1 1 0 0 0-1.4-1.4L11 11.8l-1.9-1.9a1 1 0 1 0-1.4 1.4l2.6 2.6a1 1 0 0 0 1.4 0l5.6-5.6Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : todayCounts.followUps}</div>
          <div className="label">Follow-ups</div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="dd-main-grid">
        {/* Calendar */}
        <div className="dd-card calendar-card">
          <div className="card-header">
            <h3>Calendar</h3>
            <div className="calendar-nav" aria-label="Calendar Navigation">
              <button aria-label="Previous month" onClick={gotoPrevMonth}>‹</button>
              <div className="calendar-month" aria-live="polite">{monthLabel}</div>
              <button aria-label="Next month" onClick={gotoNextMonth}>›</button>
            </div>
          </div>
          <div className="calendar-body">
            <div className="calendar-grid" role="grid" aria-readonly>
              {daysOfWeek.map((d) => (
                <div key={d} className="calendar-day-label" role="columnheader">{d}</div>
              ))}
              {calendarDays.map((d) => (
                <div
                  key={d.iso}
                  className={
                    'calendar-cell' +
                    (d.inMonth ? '' : ' outside') +
                    (d.isToday ? ' today' : '')
                  }
                  role="gridcell"
                  aria-selected={d.isToday}
                  aria-label={`${new Date(d.iso).toDateString()}${d.hasAppointments ? ', has appointments' : ''}`}
                >
                  {new Date(d.iso).getDate()}
                  {d.hasAppointments && <span className="dot" />}
                </div>
              ))}
            </div>
            <div className="calendar-legend" aria-label="Legend">
              <div className="legend-item"><span className="legend-dot" /> Has Appointments</div>
              <div className="legend-item"><span className="legend-today" /> Today</div>
            </div>
          </div>
        </div>

        {/* Right column stack */}
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Quick Actions */}
          <div className="dd-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="dd-actions">
              <button
                type="button"
                className="dd-button"
                onClick={() => navigate('/doctor/appointments/new')}
                aria-label="Create new appointment"
              >
                Create Appointment
              </button>
              <button
                type="button"
                className="dd-button"
                onClick={() => navigate('/doctor/patients')}
                aria-label="View patients"
              >
                View Patients
              </button>
              <button
                type="button"
                className="dd-button"
                onClick={() => navigate('/doctor/messages')}
                aria-label="Open messages"
              >
                Messages
              </button>
              <button
                type="button"
                className="dd-button"
                onClick={() => navigate('/doctor/video-call')}
                aria-label="Start video call"
              >
                Video Call
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="dd-card schedule-card">
            <div className="card-header">
              <h3>Today's Schedule</h3>
              <button className="dd-button" onClick={() => navigate('/doctor/schedule')}>View Full Schedule</button>
            </div>
            <div className="schedule-body">
              {isLoading ? (
                <div className="schedule-item">
                  <div className="bullet" />
                  <div className="content"><p>Loading…</p></div>
                </div>
              ) : todaysSchedule.length === 0 ? (
                <div className="schedule-item">
                  <div className="bullet" />
                  <div className="content"><p>No appointments today</p></div>
                </div>
              ) : (
                todaysSchedule.map((appt) => (
                  <div key={appt.id} className="schedule-item">
                    <div className="bullet" />
                    <div className="content">
                      <h4>{appt.patientName}</h4>
                      <p>
                        {appt.type} • {appt.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="dd-card">
            <div className="card-header">
              <h3>Recent Patients</h3>
            </div>
            <div className="schedule-body">
              {isLoading ? (
                <div className="schedule-item">
                  <div className="bullet" />
                  <div className="content"><p>Loading…</p></div>
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="schedule-item">
                  <div className="bullet" />
                  <div className="content"><p>No recent patients</p></div>
                </div>
              ) : (
                recentPatients.map((p) => (
                  <div key={p.id} className="schedule-item">
                    <div className="bullet" />
                    <div className="content">
                      <h4>{p.name}</h4>
                      <p>
                        Last visit •{' '}
                        {new Date(p.lastVisit).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </DoctorLayout>
  );
};
