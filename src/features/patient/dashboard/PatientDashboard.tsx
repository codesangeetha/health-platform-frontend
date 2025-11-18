import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { PatientService } from '../../../services/patient/patient.service';
import '../../../styles/components/patient-dashboard.styles.css';

interface DashboardData {
  upcomingAppointments: number;
  allAppointments: number;
  lastVisitDate: string | null;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  isVideoCall: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface DoctorDetails {
  doctorId: string;
  firstName: string;
  lastName: string;
}

export const PatientDashboard = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<{ [doctorId: string]: DoctorDetails }>({});
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayName = authState.user?.email?.split('@')[0] || 'Patient';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PatientService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorDetails = async (doctorId: string) => {
    if (doctorDetails[doctorId]) {
      return; // Already fetched
    }

    try {
      setDoctorLoading(true);
      const response = await PatientService.getDoctorDetails(doctorId);
      setDoctorDetails(prev => ({
        ...prev,
        [doctorId]: response.data
      }));
    } catch (err) {
      console.error('Error fetching doctor details for', doctorId, ':', err);
      // Set a fallback doctor name if fetch fails
      setDoctorDetails(prev => ({
        ...prev,
        [doctorId]: {
          doctorId,
          firstName: 'Dr.',
          lastName: 'Unknown'
        }
      }));
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      const response = await PatientService.getAppointments(1, 5);
      setAppointments(response.data.appointments);
      
      // Fetch doctor details for all unique doctor IDs
      const uniqueDoctorIds = [...new Set(response.data.appointments.map(apt => apt.doctorId))];
      uniqueDoctorIds.forEach(doctorId => {
        if (!doctorDetails[doctorId]) {
          fetchDoctorDetails(doctorId);
        }
      });
    } catch (err) {
      setAppointmentsError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAppointments();
  }, []);

  const formatLastVisitDate = (dateString: string | null) => {
    if (!dateString) return 'No visits yet';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'No visits yet';
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'completed':
        return '#6c757d';
      case 'cancelled':
        return '#dc3545';
      case 'rescheduled':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  

  return (
    <>
        <div style={{ marginBottom: 16 }}>
          <h3>Welcome, {displayName}</h3>
        </div>

        {/* Loading State */}
        {loading && appointmentsLoading && (
          <div className="pd-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading dashboard data...</div>
          </div>
        )}

        {/* Error State */}
        {(error || appointmentsError) && (
          <div className="pd-card" style={{
            textAlign: 'center',
            padding: '40px',
            borderColor: '#dc3545',
            color: '#dc3545'
          }}>
            <div>Error: {error || appointmentsError}</div>
            <button
              onClick={() => {
                setError(null);
                setAppointmentsError(null);
                setLoading(true);
                setAppointmentsLoading(true);
                fetchDashboardData();
                fetchAppointments();
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={loading || appointmentsLoading}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !appointmentsLoading && !error && !appointmentsError && (
        <section className="pd-grid">
          {/* Left column: 8 */}
          <div className="pd-col-8">
            {/* Metrics */}
            <div className="pd-card">
              <div className="pd-stats-grid">
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">📅</div>
                  <div>
                    <div className="pd-stat-value">{dashboardData?.upcomingAppointments || 0}</div>
                    <div className="pd-stat-label">Upcoming Appointments</div>
                  </div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">📋</div>
                  <div>
                    <div className="pd-stat-value">{dashboardData?.allAppointments || 0}</div>
                    <div className="pd-stat-label">All Appointments</div>
                  </div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-icon">🏥</div>
                  <div>
                    <div className="pd-stat-value">
                      {formatLastVisitDate(dashboardData?.lastVisitDate || null)}
                    </div>
                    <div className="pd-stat-label">Last Visit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="pd-card" style={{ marginTop: '24px' }}>
              <div className="pd-appointments-head">
                <h6>Your Appointments</h6>
                <a className="pd-link" href="#" onClick={() => navigate('/patient/my-appointments')}>View All</a>
              </div>

              {appointments.length > 0 ? (
                <div>
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="pd-appointment-item">
                      <div className="pd-doc-avatar" aria-hidden="true" />
                      <div className="pd-appointment-details">
                        <h5>
                          {doctorDetails[appointment.doctorId] 
                            ? `${doctorDetails[appointment.doctorId].firstName} ${doctorDetails[appointment.doctorId].lastName}`
                            : 'Dr. Unknown'
                          }
                        </h5>
                        <p>{appointment.reason} • {formatAppointmentDate(appointment.date)} • {appointment.time}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span 
                            className="pd-chip" 
                            style={{ 
                              backgroundColor: `${getStatusColor(appointment.status)}20`,
                              color: getStatusColor(appointment.status),
                              fontSize: '12px',
                              padding: '4px 8px'
                            }}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                          {appointment.isVideoCall && (
                            <span 
                              className="pd-chip" 
                              style={{ 
                                backgroundColor: '#007bff20',
                                color: '#007bff',
                                fontSize: '12px',
                                padding: '4px 8px'
                              }}
                            >
                              🎥 Video Call
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pd-appointment-actions">
                        {appointment.status === 'pending' && (
                          <>
                            <span className="pd-chip">Reschedule</span>
                            <span className="pd-chip pd-chip-primary">View Details</span>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <span className="pd-chip pd-chip-primary">Join Call</span>
                            <span className="pd-chip">View Details</span>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <span className="pd-chip pd-chip-primary">View Details</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <p>No appointments found</p>
                  <button 
                    className="pd-btn pd-btn-primary-light" 
                    style={{ marginTop: '16px' }}
                    onClick={() => navigate('/patient/book-appointment')}
                  >
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: 4 */}
          <aside className="pd-col-4">
            {/* Health Tips */}
            <div className="pd-card">
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
        )}
    </>
  );
};
