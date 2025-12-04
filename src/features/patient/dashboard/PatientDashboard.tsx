import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../../context/PatientContext';
import { withAuth } from '../../../components/hocs/withAuth';
import { withDataFetching } from '../../../components/hocs/withDataFetching';
import { withLoading } from '../../../components/hocs/withLoading';
import { PatientService } from '../../../services/patient/patient.service';
import '../../../styles/components/patient-dashboard.styles.css';

// Types for the data
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

interface DashboardData {
  upcomingAppointments: number;
  allAppointments: number;
  lastVisitDate: string | null;
}

// Pure component - only handles UI rendering
const PatientDashboardContent: React.FC<{
  data: {
    dashboardData: DashboardData;
    appointments: Appointment[];
    doctorDetails: { [doctorId: string]: DoctorDetails };
  };
  loadingStates: { dashboard: boolean; appointments: boolean; doctorDetails: boolean };
  errorStates: { dashboard: string | null; appointments: string | null; doctorDetails: string | null };
  retryFunctions: { 
    retryDashboard: () => void; 
    retryAppointments: () => void; 
    retryAll: () => void 
  };
  displayName: string;
  navigate: (path: string) => void;
}> = ({
  data,
  loadingStates,
  errorStates,
  retryFunctions,
  displayName,
  navigate
}) => {
  const { dashboardData, appointments, doctorDetails } = data;
  
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
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      case 'rescheduled': return '#fd7e14';
      default: return '#6c757d';
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

          {/* Appointments */}
          <div className="pd-card" style={{ marginTop: '24px' }}>
            <div className="pd-appointments-head">
              <h6>Your Appointments</h6>
              <a className="pd-link" href="#" onClick={() => navigate('/patient/my-appointments')}>View All</a>
            </div>

            {appointments?.length > 0 ? (
              <div>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="pd-appointment-item">
                    <div className="pd-doc-avatar" aria-hidden="true" />
                    <div className="pd-appointment-details">
                      <h5>
                        {doctorDetails?.[appointment.doctorId] 
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
                      {appointment.status === 'confirmed' && (
                        <span className="pd-chip pd-chip-primary">Join Call</span>
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
                  onClick={() => navigate('/patient/doctor-directory')}
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: 4 */}
        <aside className="pd-col-4">
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
    </>
  );
};

// Wrapper component that handles patient context and state
const PatientDashboardWrapper: React.FC<any> = (props) => {
  const { getDisplayName, fetchPatientProfile } = usePatient();
  const navigate = useNavigate();
  const displayName = getDisplayName();

  // Fetch patient profile on mount
  React.useEffect(() => {
    fetchPatientProfile();
  }, []);

  return (
    <PatientDashboardContent
      data={{
        dashboardData: props.data?.dashboard || null,
        appointments: props.data?.appointments || [],
        doctorDetails: props.data?.doctorDetails || {}
      }}
      loadingStates={props.loadingStates || { dashboard: false, appointments: false, doctorDetails: false }}
      errorStates={props.errorStates || { dashboard: null, appointments: null, doctorDetails: null }}
      retryFunctions={props.retryFunctions || { retryDashboard: () => {}, retryAppointments: () => {}, retryAll: () => {} }}
      displayName={displayName}
      navigate={navigate}
    />
  );
};

// Fetch configurations for withDataFetching HOC
const fetchConfigs = [
  {
    service: PatientService,
    method: 'getDashboardData',
    key: 'dashboard',
    transform: (response: any) => response.data
  },
  {
    service: PatientService,
    method: 'getAppointments',
    params: [1, 5],
    key: 'appointments',
    transform: (response: any) => response.data.appointments
  },
  {
    service: PatientService,
    method: 'getAppointments',
    params: [1, 5],
    key: 'doctorDetails',
    transform: (response: any) => response.data.appointments,
    onSuccess: async (appointments: Appointment[]) => {
      // After appointments are fetched, fetch doctor details
      const uniqueDoctorIds = [...new Set(appointments.map((apt: Appointment) => apt.doctorId))];
      const doctorDetailsArray = await Promise.all(
        uniqueDoctorIds.map((doctorId: string) => 
          PatientService.getDoctorDetails(doctorId).catch(err => {
            console.warn(`Failed to fetch doctor details for ${doctorId}:`, err);
            return null;
          })
        )
      );
      
      // Store doctor details in a way that the component can access them
      const doctorDetails: { [doctorId: string]: DoctorDetails } = {};
      doctorDetailsArray.forEach((detail: any, index: number) => {
        if (detail && detail.data) {
          doctorDetails[uniqueDoctorIds[index]] = detail.data;
        } else {
          // Set fallback doctor details
          const doctorId = uniqueDoctorIds[index];
          doctorDetails[doctorId] = {
            doctorId,
            firstName: 'Dr.',
            lastName: 'Unknown'
          };
        }
      });
      return doctorDetails;
    }
  }
];

// Compose HOCs step by step
const PatientDashboardWithData = withDataFetching(PatientDashboardWrapper, fetchConfigs);
const PatientDashboardWithLoading = withLoading(PatientDashboardWithData);

// Main component wrapped with auth HOC
export const PatientDashboard = withAuth(PatientDashboardWithLoading, 'patient');
