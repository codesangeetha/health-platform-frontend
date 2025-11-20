import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import '../../../styles/components/doctor-dashboard.styles.css';
import '../../../styles/components/patient-dashboard.styles.css';

type Appointment = {
  id: string;
  patientName: string;
  type: string;
  date: string; // ISO date for the day: YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
  status?: string;
  appointmentType?: string;
};

type Patient = {
  id: string;
  name: string;
  lastVisit: string; // ISO string
};

type CalendarBooking = {
  date: string;
  day: number;
  dayName: string;
  bookings: any[];
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
};

type CalendarData = {
  year: number;
  month: number;
  calendar: {
    monthName: string;
    daysInMonth: number;
    firstDayOfWeek: number;
    bookingsByDate: CalendarBooking[];
  };
  monthlyStats: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
};

interface DashboardData {
  todayAppointments: number;
  totalAppointments: number;
  pendingConsultations: number;
  todayCompletedConsultations: number;
}

export const DoctorDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calendar state (month navigation)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Optional: role-based guard to keep doctors on the correct dashboard
  useEffect(() => {
    const currentSession = authState?.currentUserType && authState.sessions[authState.currentUserType];
    const user = currentSession?.user;
    const role = user && (user as any)?.userType;
    if (role && role !== 'doctor') {
      navigate('/', { replace: true });
    }
  }, [authState, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch dashboard data from API
      const dashboardResponse = await DoctorService.getDashboardData();
      setDashboardData(dashboardResponse.data);

      // Fetch doctor's profile to get the actual name
      try {
        const profileResponse = await DoctorService.getCurrentDoctorProfile();
        setDoctorProfile(profileResponse.data);
      } catch (profileError) {
        console.warn('Failed to fetch doctor profile, using fallback name:', profileError);
        // Continue without profile data
      }

      // Keep mock data for other components until we have real APIs
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

      setAppointments(mockAppointments);
      setRecentPatients(mockPatients);
    } catch (e) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarData = async (year: number, month: number) => {
    try {
      setIsCalendarLoading(true);
      const response = await AppointmentService.getCalendarData(year, month);
      if (response.success) {
        setCalendarData(response.data);
      } else {
        console.error('Failed to fetch calendar data:', response.message);
        setError('Failed to load calendar data');
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch calendar data when view date changes
  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1; // JavaScript months are 0-based, API expects 1-based
    fetchCalendarData(year, month);
  }, [viewDate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Derived stats - now using real API data
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todaysSchedule = useMemo(() => appointments.filter((a) => a.date === todayISO), [appointments, todayISO]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => a.date >= now).slice(0, 5);
  }, [appointments]);

  const displayName = useMemo(() => {
    // First try to use doctor's actual name from profile
    if (doctorProfile && (doctorProfile.firstName || doctorProfile.lastName)) {
      const firstName = doctorProfile.firstName || '';
      const lastName = doctorProfile.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }
    
    // Fallback to email prefix if no name available
    const currentSession = authState?.currentUserType && authState.sessions[authState.currentUserType];
    const user = currentSession?.user;
    const email = user && (user as any)?.email;
    if (!email) return 'Michael Chen'; // fallback similar to example
    return email.split('@')[0];
  }, [authState, doctorProfile]);

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
      appointmentCount: number;
      bookingData?: CalendarBooking;
    }[] = [];

    // Create a map of date strings to booking data for quick lookup
    const bookingsMap = new Map<string, CalendarBooking>();
    if (calendarData?.calendar.bookingsByDate) {
      calendarData.calendar.bookingsByDate.forEach(booking => {
        bookingsMap.set(booking.date, booking);
      });
    }

    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const inMonth = d >= startOfMonth && d <= endOfMonth;
      const todayIso = new Date().toISOString().slice(0, 10);
      const isToday = iso === todayIso;
      const bookingData = bookingsMap.get(iso);
      const hasAppointments = bookingData ? bookingData.totalBookings > 0 : false;
      const appointmentCount = bookingData?.totalBookings || 0;
      
      days.push({ 
        date: d, 
        iso, 
        inMonth, 
        isToday, 
        hasAppointments, 
        appointmentCount,
        bookingData 
      });
    }

    return days;
  }, [viewDate, calendarData]);

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
      pageTitle={`Welcome back, Dr. ${displayName}`}
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
            <button
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
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
          <div className="number">{isLoading ? '—' : (dashboardData?.todayAppointments || 0)}</div>
          <div className="label">Today's Appointments</div>
        </div>

        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm3 7V7a3 3 0 0 0-6 0v2h6Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : (dashboardData?.pendingConsultations || 0)}</div>
          <div className="label">Pending Consultations</div>
        </div>

        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 1 1-9 9 9 9 0 0 1 9-9Zm4.3 6.3a1 1 0 0 0-1.4-1.4L11 11.8l-1.9-1.9a1 1 0 1 0-1.4 1.4l2.6 2.6a1 1 0 0 0 1.4 0l5.6-5.6Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : (dashboardData?.todayCompletedConsultations || 0)}</div>
          <div className="label">Completed Today</div>
        </div>

        <div className="info-card">
          <div className="icon-wrap" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 3h5v5h-5V6Zm-2 6H6v-2h4v2Zm0-4H6V8h4v2Zm6 4h-4v-2h4v2Zm0-4h-4V8h4v2Z" />
            </svg>
          </div>
          <div className="number">{isLoading ? '—' : (dashboardData?.totalAppointments || 0)}</div>
          <div className="label">Total Appointments</div>
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
              <div className="calendar-month" aria-live="polite">
                {isCalendarLoading ? 'Loading...' : monthLabel}
              </div>
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
                  aria-label={`${new Date(d.iso).toDateString()}${d.hasAppointments ? `, ${d.appointmentCount} appointment${d.appointmentCount > 1 ? 's' : ''}` : ''}`}
                >
                  {new Date(d.iso).getDate()}
                  {d.hasAppointments && d.bookingData && (
                    <div className="appointment-indicators">
                      {/* Show individual dots for each appointment based on their status */}
                      {d.bookingData.bookings.map((booking, index) => (
                        <span
                          key={`${d.iso}-${index}`}
                          className={`dot status-${booking.status}`}
                          title={`${booking.status} - ${booking.patient?.firstName} ${booking.patient?.lastName} at ${booking.time}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="calendar-legend" aria-label="Legend">
              <div className="legend-item">
                <span className="legend-today" /> Today
              </div>
              <div className="legend-item">
                <span className="legend-dot status-pending" /> Pending
              </div>
              <div className="legend-item">
                <span className="legend-dot status-confirmed" /> Confirmed
              </div>
              <div className="legend-item">
                <span className="legend-dot status-completed" /> Completed
              </div>
              <div className="legend-item">
                <span className="legend-dot status-cancelled" /> Cancelled
              </div>
            </div>
            {/* Monthly Stats */}
            {calendarData && (
              <div className="monthly-stats" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                  {calendarData.calendar.monthName} {calendarData.year} Stats
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div>Total: {calendarData.monthlyStats.totalBookings}</div>
                  <div>Pending: {calendarData.monthlyStats.pendingBookings}</div>
                  <div>Confirmed: {calendarData.monthlyStats.confirmedBookings}</div>
                  <div>Completed: {calendarData.monthlyStats.completedBookings}</div>
                  <div>Cancelled: {calendarData.monthlyStats.cancelledBookings}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column stack - now empty */}
        <div style={{ display: 'grid', gap: 20 }}>
        </div>
      </section>
    </DoctorLayout>
  );
};
