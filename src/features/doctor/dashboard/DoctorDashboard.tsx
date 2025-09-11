import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/components/dashboard.styles.css';

type Appointment = {
  id: string;
  patientName: string;
  type: string;
  date: string; // ISO date for the day
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

  // Derived stats similar to patient-facing summaries
  const todayCounts = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const todays = appointments.filter((a) => a.date === todayISO);
    const pendingConsultations = todays.filter((a) => /consult/i.test(a.type)).length;
    const followUps = todays.filter((a) => /follow/i.test(a.type)).length;

    return {
      todaysAppointments: todays.length,
      pendingConsultations,
      followUps
    };
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => a.date >= now).slice(0, 5);
  }, [appointments]);

  const displayName = useMemo(() => {
    const email = authState?.user?.email;
    if (!email) return 'Doctor';
    return email.split('@')[0];
  }, [authState?.user?.email]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {displayName}</h1>
          <p>Here’s your schedule and patient overview</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {error && (
        <div className="dashboard-card" role="alert" aria-live="polite">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Schedule Summary */}
        <div className="dashboard-card">
          <h2>Schedule Summary</h2>
          {isLoading ? (
            <div className="health-stats">
              <div className="stat-item"><span className="stat-label">Loading…</span></div>
            </div>
          ) : (
            <div className="health-stats">
              <div className="stat-item">
                <span className="stat-label">Today's Appointments</span>
                <span className="stat-value">{todayCounts.todaysAppointments}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Consultations</span>
                <span className="stat-value">{todayCounts.pendingConsultations}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Follow-ups</span>
                <span className="stat-value">{todayCounts.followUps}</span>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card">
          <h2>Upcoming Appointments</h2>
          {isLoading ? (
            <div className="appointments-list">
              <div className="appointment-item">Loading…</div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p>No upcoming appointments</p>
          ) : (
            <div className="appointments-list">
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className="appointment-item">
                  <div className="appointment-date">
                    {new Date(appt.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="appointment-details">
                    <h3>{appt.patientName}</h3>
                    <p>
                      {appt.type} - {appt.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="health-stats">
            <button
              type="button"
              className="stat-item"
              onClick={() => navigate('/doctor/appointments/new')}
              aria-label="Create new appointment"
            >
              <span className="stat-label">Create Appointment</span>
            </button>
            <button
              type="button"
              className="stat-item"
              onClick={() => navigate('/doctor/patients')}
              aria-label="View patients"
            >
              <span className="stat-label">View Patients</span>
            </button>
            <button
              type="button"
              className="stat-item"
              onClick={() => navigate('/doctor/messages')}
              aria-label="Open messages"
            >
              <span className="stat-label">Messages</span>
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="dashboard-card">
          <h2>Recent Patients</h2>
          {isLoading ? (
            <div className="appointments-list">
              <div className="appointment-item">Loading…</div>
            </div>
          ) : recentPatients.length === 0 ? (
            <p>No recent patients</p>
          ) : (
            <div className="appointments-list">
              {recentPatients.map((p) => (
                <div key={p.id} className="appointment-item">
                  <div className="appointment-date">
                    {new Date(p.lastVisit).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="appointment-details">
                    <h3>{p.name}</h3>
                    <p>Last visit</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};