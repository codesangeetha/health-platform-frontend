import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import type { Appointment } from '../../../types/appointment/appointment.types';
import '../../../styles/components/patient-dashboard.styles.css';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    primary: "#3B82F6",
    secondary: "#E5E7EB",
    text_dark: "#1F2937",
    text_light: "#6B7280",
    background_light: "#F9FAFB",
    border: "#E5E7EB",
    status_confirmed: "#10B981",
    status_pending: "#F59E0B",
    status_cancelled: "#EF4444",
    status_completed: "#E5E7EB",
    icon_cardiology: "#3B82F6",
    icon_dermatology: "#34D399",
    icon_neurology: "#8B5CF6"
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    headings: {
      h1: {
        fontSize: "1.5rem",
        fontWeight: "600",
        color: "#1F2937"
      },
      h2: {
        fontSize: "1.125rem",
        fontWeight: "600",
        color: "#1F2937"
      }
    },
    body: {
      fontSize: "0.875rem",
      fontWeight: "400",
      color: "#6B7280"
    },
    subtext: {
      fontSize: "0.75rem",
      fontWeight: "400",
      color: "#9CA3AF"
    },
    button_text: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "white"
    },
    status_text: {
      fontSize: "0.75rem",
      fontWeight: "600"
    }
  },
  components: {
    header: {
      backgroundColor: "white",
      height: "64px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      layout: "flexbox",
      items: [
        {
          type: "logo",
          text: "Doctor Appointment Booker"
        },
        {
          type: "nav_menu",
          items: [
            { text: "Dashboard", active: false },
            { text: "Doctor Directory", active: false },
            { text: "Appointment Schedule", active: true },
            { text: "Profile", active: false },
            { text: "Settings", active: false }
          ]
        },
        {
          type: "user_profile",
          elements: [
            { type: "notification_icon" },
            { type: "user_avatar", placeholder: "" }
          ]
        }
      ]
    },
    main_content: {
      layout: "flexbox",
      direction: "column",
      padding: "2rem"
    },
    heading_section: {
      layout: "flexbox",
      justifyContent: "space-between",
      alignItems: "center",
      elements: [
        {
          type: "title_and_subtitle",
          title: "My Appointments",
          subtitle: "Manage your upcoming and past appointments"
        },
        {
          type: "button",
          text: "+ Book New Appointment",
          variant: "primary",
          icon: "plus"
        }
      ]
    },
    tab_group: {
      layout: "flexbox",
      items: [
        {
          text: "Upcoming (3)",
          active: true
        },
        {
          text: "Past (12)",
          active: false
        }
      ],
      border_radius: "9999px"
    },
    appointment_card: {
      layout: "flexbox",
      direction: "row",
      gap: "1rem",
      backgroundColor: "white",
      border: "1px solid #E5E7EB",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      padding: "1.5rem",
      elements: [
        {
          type: "icon_container",
          placeholder: "",
          shape: "circle",
          size: "56px"
        },
        {
          type: "appointment_details",
          layout: "flexbox",
          direction: "column",
          flexGrow: "1",
          elements: [
            { type: "doctor_info", name: "Dr. [Name]", specialization: "[Specialization]" },
            { type: "status_badge", text: "Confirmed/Pending" },
            {
              type: "meta_info",
              items: [
                { icon: "calendar", text: "Month Day, Year" },
                { icon: "clock", text: "Time" },
                { icon: "location", text: "Location/Telemedicine" }
              ]
            },
            { type: "reason", label: "Reason:", text: "Placeholder for reason of visit" }
          ]
        },
        {
          type: "actions",
          layout: "flexbox",
          direction: "column",
          gap: "0.5rem",
          elements: [
            {
              type: "button",
              text: "Reschedule",
              variant: "outline",
              color: "#6B7280"
            },
            {
              type: "button",
              text: "Cancel",
              variant: "outline",
              color: "#EF4444"
            }
          ]
        }
      ]
    }
  }
};

export const MyAppointments = () => {
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorDetails, setDoctorDetails] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    limit: 5,
    page: 1,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AppointmentService.getAppointments(filters);
      
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
        setPagination(response.data.pagination);
        
        // Fetch doctor details for each appointment
        const doctorDetailsMap: {[key: string]: any} = {};
        for (const appointment of response.data.appointments) {
          if (!doctorDetailsMap[appointment.doctorId]) {
            try {
              const doctorResponse = await DoctorService.getDoctorById(appointment.doctorId);
              if (doctorResponse.success) {
                doctorDetailsMap[appointment.doctorId] = doctorResponse.data;
              }
            } catch (err) {
              console.error(`Failed to fetch doctor details for ${appointment.doctorId}:`, err);
            }
          }
        }
        setDoctorDetails(doctorDetailsMap);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return DESIGN_SYSTEM.colors.status_pending;
      case 'confirmed':
        return DESIGN_SYSTEM.colors.status_confirmed;
      case 'cancelled':
        return DESIGN_SYSTEM.colors.status_cancelled;
      case 'completed':
        return DESIGN_SYSTEM.colors.status_completed;
      default:
        return DESIGN_SYSTEM.colors.text_light;
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    const lowerSpec = specialization.toLowerCase();
    if (lowerSpec.includes('cardio') || lowerSpec.includes('heart')) {
      return { color: DESIGN_SYSTEM.colors.icon_cardiology, icon: '❤️' };
    } else if (lowerSpec.includes('derma') || lowerSpec.includes('skin')) {
      return { color: DESIGN_SYSTEM.colors.icon_dermatology, icon: '🌿' };
    } else if (lowerSpec.includes('neuro') || lowerSpec.includes('brain')) {
      return { color: DESIGN_SYSTEM.colors.icon_neurology, icon: '🧠' };
    }
    return { color: DESIGN_SYSTEM.colors.primary, icon: '👨‍⚕️' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, time: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hour12}:${minutes} ${ampm}`;
    
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <>
      <div style={{ 
        backgroundColor: DESIGN_SYSTEM.colors.background_light, 
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Heading Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
           { <div>
              <h1 style={DESIGN_SYSTEM.typography.headings.h1}>My Appointments</h1>
              <p style={DESIGN_SYSTEM.typography.body}>Manage your upcoming and past appointments</p>
            </div>}
            <button
              onClick={() => navigate('/patient/doctor-directory')}
              style={{
                backgroundColor: DESIGN_SYSTEM.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                fontSize: DESIGN_SYSTEM.typography.button_text.fontSize,
                fontWeight: DESIGN_SYSTEM.typography.button_text.fontWeight,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.primary}
            >
              <span>+</span> Book New Appointment
            </button>
          </div>

          {/* Filter Tabs */}
          {/* <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            borderRadius: '9999px',
            padding: '0.25rem',
            backgroundColor: DESIGN_SYSTEM.colors.secondary
          }}>
            <button
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                fontWeight: '500',
                color: DESIGN_SYSTEM.colors.primary,
                cursor: 'pointer',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            >
              Upcoming ({appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length})
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                fontWeight: '400',
                color: DESIGN_SYSTEM.colors.text_light,
                cursor: 'pointer'
              }}
            >
              Past ({appointments.filter(a => a.status === 'cancelled' || a.status === 'completed').length})
            </button>
          </div> */}

          {/* Appointments List */}
          {loading ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '3rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              textAlign: 'center'
            }}>
              <p style={DESIGN_SYSTEM.typography.body}>Loading appointments...</p>
            </div>
          ) : error ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '3rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              color: '#e63946',
              textAlign: 'center'
            }}>
              <p style={DESIGN_SYSTEM.typography.body}>{error}</p>
              <button 
                onClick={fetchAppointments}
                style={{
                  marginTop: '1rem',
                  backgroundColor: DESIGN_SYSTEM.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '3rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              textAlign: 'center'
            }}>
              <h2 style={DESIGN_SYSTEM.typography.headings.h2}>No appointments found</h2>
              <p style={DESIGN_SYSTEM.typography.body}>
                You don't have any appointments scheduled. Book an appointment with a doctor.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={() => navigate('/patient/doctor-directory')}
                  style={{
                    backgroundColor: DESIGN_SYSTEM.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Browse Doctors
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(appointment => {
                  const doctorInfo = doctorDetails[appointment.doctorId];
                  const iconInfo = doctorInfo ? getSpecializationIcon(doctorInfo.specialization) : { color: DESIGN_SYSTEM.colors.primary, icon: '👨‍⚕️' };
                  
                  return (
                    <div 
                      key={appointment.id} 
                      style={{ 
                        backgroundColor: 'white',
                        border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        padding: '1.5rem',
                        display: 'flex',
                        gap: '1rem'
                      }}
                    >
                      {/* Icon Container */}
                      <div 
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: `${iconInfo.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: '0'
                        }}
                      >
                        <span style={{ color: iconInfo.color }}>{iconInfo.icon}</span>
                      </div>

                      {/* Appointment Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
                        {/* Doctor Info */}
                        <div style={{ marginBottom: '0.5rem' }}>
                          {doctorInfo ? (
                            <>
                              <strong style={{ 
                                fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                                fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                                color: DESIGN_SYSTEM.colors.text_dark
                              }}>
                                Dr. {doctorInfo.firstName} {doctorInfo.lastName}
                              </strong>
                              <span style={{ 
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_light,
                                marginLeft: '0.5rem'
                              }}>
                                - {doctorInfo.specialization}
                              </span>
                            </>
                          ) : (
                            <strong style={{ 
                              fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                              fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                              color: DESIGN_SYSTEM.colors.text_dark
                            }}>
                              Doctor ID: {appointment.doctorId}
                            </strong>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div style={{ marginBottom: '1rem' }}>
                          <span 
                            style={{ 
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '9999px', 
                              fontSize: DESIGN_SYSTEM.typography.status_text.fontSize, 
                              fontWeight: DESIGN_SYSTEM.typography.status_text.fontWeight,
                              backgroundColor: getStatusColor(appointment.status),
                              color: appointment.status === 'confirmed' ? '#065F46' :
                                     appointment.status === 'pending' ? '#92400E' :
                                     appointment.status === 'cancelled' ? '#991B1B' :
                                     appointment.status === 'completed' ? '#374151' :
                                     DESIGN_SYSTEM.colors.text_light
                            }}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {appointment.isVideoCall && (
                            <span style={{ 
                              marginLeft: '0.5rem',
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '9999px', 
                              fontSize: DESIGN_SYSTEM.typography.status_text.fontSize, 
                              backgroundColor: '#DBEAFE', 
                              color: '#1E40AF' 
                            }}>
                              Video Call
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>📅</span>
                            <span style={DESIGN_SYSTEM.typography.body}>{formatDate(appointment.date)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>🕐</span>
                            <span style={DESIGN_SYSTEM.typography.body}>{appointment.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>📍</span>
                            <span style={DESIGN_SYSTEM.typography.body}>
                              {appointment.isVideoCall ? 'Telemedicine' : 'In-Person'}
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        {appointment.reason && (
                          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={DESIGN_SYSTEM.typography.subtext}>
                              Reason:
                            </span>
                            <span style={DESIGN_SYSTEM.typography.body}>
                              {appointment.reason.includes('|')
                                ? appointment.reason.split('|').pop()?.trim()
                                : appointment.reason}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {appointment.isVideoCall && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => navigate(`/patient/video-call/${appointment.id}`)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#10B981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#059669';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#10B981';
                            }}
                          >
                            📹 Join Video Call
                          </button>
                        )}
                        {/* Reschedule button for pending appointments */}
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/patient/reschedule-appointment/${appointment.id}`)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'transparent',
                              color: DESIGN_SYSTEM.colors.primary,
                              border: `1px solid ${DESIGN_SYSTEM.colors.primary}40`,
                              borderRadius: '0.5rem',
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#DBEAFE';
                              e.currentTarget.style.color = '#1D4ED8';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = DESIGN_SYSTEM.colors.primary;
                            }}
                          >
                            Reschedule
                          </button>
                        )}
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/patient/cancel-appointment/${appointment.id}`)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'transparent',
                              color: DESIGN_SYSTEM.colors.status_cancelled,
                              border: `1px solid ${DESIGN_SYSTEM.colors.status_cancelled}40`,
                              borderRadius: '0.5rem',
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE2E2';
                              e.currentTarget.style.color = '#991B1B';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = DESIGN_SYSTEM.colors.status_cancelled;
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                    backgroundColor: filters.page === 1 ? '#F9FAFB' : 'white',
                    borderRadius: '0.5rem',
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                    fontWeight: '400',
                    color: DESIGN_SYSTEM.colors.text_light
                  }}
                >
                  Previous
                </button>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  alignSelf: 'center',
                  fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                  color: DESIGN_SYSTEM.colors.text_light
                }}>
                  Page {filters.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= pagination.totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                    backgroundColor: filters.page >= pagination.totalPages ? '#F9FAFB' : 'white',
                    borderRadius: '0.5rem',
                    cursor: filters.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                    fontWeight: '400',
                    color: DESIGN_SYSTEM.colors.text_light
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};