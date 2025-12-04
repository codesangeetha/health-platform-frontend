import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import '../../../styles/components/doctor-dashboard.styles.css';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    primary: "#3B82F6",
    secondary: "#E5E7EB",
    text_dark: "#111827",
    text_light: "#374151",
    text_muted: "#6B7280",
    background_light: "#F9FAFB",
    background_white: "#FFFFFF",
    background_subtle: "#F3F4F6",
    border: "#D1D5DB",
    border_focus: "#3B82F6",
    status_confirmed: "#059669",
    status_pending: "#D97706",
    status_cancelled: "#DC2626",
    status_completed: "#4B5563",
    icon_cardiology: "#3B82F6",
    icon_dermatology: "#34D399",
    icon_neurology: "#8B5CF6",
    // High contrast accessibility colors
    accessible_success: "#047857",
    accessible_warning: "#B45309",
    accessible_error: "#B91C1C",
    accessible_info: "#1E40AF",
    modal_backdrop: "rgba(0, 0, 0, 0.75)",
    card_background: "#FFFFFF",
    section_background: "#F8FAFC"
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    headings: {
      h1: {
        fontSize: "1.75rem",
        fontWeight: "700",
        color: "#111827",
        lineHeight: "1.2",
        letterSpacing: "-0.025em"
      },
      h2: {
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#111827",
        lineHeight: "1.3"
      },
      h3: {
        fontSize: "1.125rem",
        fontWeight: "600",
        color: "#111827",
        lineHeight: "1.4"
      },
      h4: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#111827",
        lineHeight: "1.4"
      }
    },
    body: {
      fontSize: "0.875rem",
      fontWeight: "400",
      color: "#374151",
      lineHeight: "1.5"
    },
    body_large: {
      fontSize: "1rem",
      fontWeight: "400",
      color: "#374151",
      lineHeight: "1.5"
    },
    subtext: {
      fontSize: "0.75rem",
      fontWeight: "500",
      color: "#6B7280",
      lineHeight: "1.4"
    },
    button_text: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "white",
      lineHeight: "1.25"
    },
    status_text: {
      fontSize: "0.75rem",
      fontWeight: "600",
      lineHeight: "1"
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#111827",
      lineHeight: "1.4"
    },
    label_small: {
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#111827",
      lineHeight: "1.3"
    },
    code: {
      fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#111827",
      lineHeight: "1.4"
    }
  }
};

interface DoctorAppointment {
  appointmentId: string;
  patient: {
    patientId: string;
    firstName: string;
    lastName: string;
    age: number;
  };
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  appointmentType: 'video' | 'in-person';
  reason: string;
}

export const DoctorAppointments = () => {
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    limit: 10,
    page: 1,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState<boolean>(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getDoctorAppointments(filters);
      
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
        setPagination(response.data.pagination);
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

  const handleMarkAsComplete = (appointment: DoctorAppointment) => {
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return; // Don't show button for cancelled or completed appointments
    }

    // For video appointments, navigate to video call
    if (appointment.appointmentType === 'video') {
      navigate(`/doctor/video-call/${appointment.appointmentId}`);
      return;
    }

    // For in-person appointments, navigate to prescription creation page
    navigate(`/doctor/prescription/${appointment.appointmentId}`);
  };

  const handleVideoCall = (appointment: DoctorAppointment) => {
    // Navigate to video call page with appointment ID
    navigate(`/doctor/video-call/${appointment.appointmentId}`);
  };

  const fetchPrescriptionDetails = async (appointmentId: string) => {
    try {
      setPrescriptionLoading(true);
      const response = await DoctorService.getPrescriptionDetails(appointmentId);
      if (response.success && response.data) {
        setSelectedPrescription(response.data);
        setShowPrescriptionModal(true);
      }
    } catch (err: any) {
      console.error('Error fetching prescription details:', err);
      setError(err.message || 'Failed to fetch prescription details');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return DESIGN_SYSTEM.colors.status_pending;
      case 'confirmed':
        return DESIGN_SYSTEM.colors.status_confirmed;
      case 'cancelled':
        return DESIGN_SYSTEM.colors.status_cancelled;
      case 'completed':
        return DESIGN_SYSTEM.colors.status_completed;
      case 'created':
        return DESIGN_SYSTEM.colors.accessible_success;
      case 'active':
        return DESIGN_SYSTEM.colors.accessible_info;
      case 'inactive':
        return DESIGN_SYSTEM.colors.text_muted;
      default:
        return DESIGN_SYSTEM.colors.status_completed;
    }
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getAppointmentTypeText = (type: string) => {
    return type === 'video' ? 'Video Call' : 'In-Person';
  };

  return (
    <DoctorLayout
      pageTitle="Appointments"
      pageSubtitle="View and manage your scheduled appointments"
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

      <div style={{
        backgroundColor: DESIGN_SYSTEM.colors.background_light,
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Appointments List */}
          <div className="dd-card">
            <div className="card-header">
              <h3>Your Appointments</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: DESIGN_SYSTEM.colors.status_pending }}></span>
                  Pending
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: DESIGN_SYSTEM.colors.status_confirmed }}></span>
                  Confirmed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: DESIGN_SYSTEM.colors.status_cancelled }}></span>
                  Cancelled
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: DESIGN_SYSTEM.colors.status_completed }}></span>
                  Completed
                </span>
              </div>
            </div>

            <div style={{ padding: 'var(--ds-space-l)' }}>
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
                    You don't have any appointments scheduled.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {appointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(appointment => {
                      const getSpecializationIcon = (type: string) => {
                        const lowerType = type.toLowerCase();
                        if (lowerType.includes('cardio') || lowerType.includes('heart')) {
                          return { color: DESIGN_SYSTEM.colors.icon_cardiology, icon: '❤️' };
                        } else if (lowerType.includes('derma') || lowerType.includes('skin')) {
                          return { color: DESIGN_SYSTEM.colors.icon_dermatology, icon: '🌿' };
                        } else if (lowerType.includes('neuro') || lowerType.includes('brain')) {
                          return { color: DESIGN_SYSTEM.colors.icon_neurology, icon: '🧠' };
                        }
                        return { color: DESIGN_SYSTEM.colors.primary, icon: '👨‍⚕️' };
                      };

                      const iconInfo = getSpecializationIcon(appointment.appointmentType);

                      return (
                        <div
                          key={appointment.appointmentId}
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
                            {/* Patient Info */}
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong style={{
                                fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                                fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                                color: DESIGN_SYSTEM.colors.text_dark
                              }}>
                                {appointment.patient.firstName} {appointment.patient.lastName}
                              </strong>
                              <span style={{
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_light,
                                marginLeft: '0.5rem'
                              }}>
                                - Age {appointment.patient.age}
                              </span>
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
                                         appointment.status === 'completed' ? '#FFFFFF' :
                                         DESIGN_SYSTEM.colors.text_light
                                }}
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                              <span style={{
                                marginLeft: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: DESIGN_SYSTEM.typography.status_text.fontSize,
                                backgroundColor: appointment.appointmentType === 'video' ? '#DBEAFE' : '#D1FAE5',
                                color: appointment.appointmentType === 'video' ? '#1E40AF' : '#065F46'
                              }}>
                                {getAppointmentTypeText(appointment.appointmentType)}
                              </span>
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>📅</span>
                                <span style={DESIGN_SYSTEM.typography.body}>{formatDate(appointment.date)}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>🕐</span>
                                <span style={DESIGN_SYSTEM.typography.body}>{formatTime(appointment.time)}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>🏥</span>
                                <span style={DESIGN_SYSTEM.typography.body}>
                                  {appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Consultation'}
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
                            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                              <>
                                {appointment.appointmentType === 'video' ? (
                                  <button
                                    onClick={() => handleVideoCall(appointment)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      backgroundColor: '#3B82F6',
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
                                      e.currentTarget.style.backgroundColor = '#2563EB';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = '#3B82F6';
                                    }}
                                  >
                                    📹 Start Video Call
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleMarkAsComplete(appointment)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      backgroundColor: DESIGN_SYSTEM.colors.status_confirmed,
                                      color: '#065F46',
                                      border: `1px solid ${DESIGN_SYSTEM.colors.status_confirmed}40`,
                                      borderRadius: '0.5rem',
                                      fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = '#D1FAE5';
                                      e.currentTarget.style.color = '#065F46';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.status_confirmed;
                                      e.currentTarget.style.color = '#065F46';
                                    }}
                                  >
                                    Create Prescription
                                  </button>
                                )}
                              </>
                            )}

                            {/* View Prescription Button - Only for completed appointments */}
                            {appointment.status === 'completed' && (
                              <button
                                onClick={() => fetchPrescriptionDetails(appointment.appointmentId)}
                                disabled={prescriptionLoading}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: prescriptionLoading ? '#9CA3AF' : '#8B5CF6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                  fontWeight: '500',
                                  cursor: prescriptionLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                  if (!prescriptionLoading) {
                                    e.currentTarget.style.backgroundColor = '#7C3AED';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!prescriptionLoading) {
                                    e.currentTarget.style.backgroundColor = '#8B5CF6';
                                  }
                                }}
                              >
                                📋 {prescriptionLoading ? 'Loading...' : 'View Prescription'}
                              </button>
                            )}
                            <div style={{
                              fontSize: DESIGN_SYSTEM.typography.subtext.fontSize,
                              color: DESIGN_SYSTEM.colors.text_light,
                              textAlign: 'center'
                            }}>
                              ID: {appointment.appointmentId}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-space-l) var(--ds-space-l) 0' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    style={{
                      padding: '8px 12px',
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
                    padding: '8px 12px',
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
                      padding: '8px 12px',
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
      </div>

      {/* Prescription Details Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: DESIGN_SYSTEM.colors.modal_backdrop,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={closePrescriptionModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="prescription-modal-title"
        >
          <div 
            style={{
              backgroundColor: DESIGN_SYSTEM.colors.card_background,
              borderRadius: '1rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '2rem',
              borderBottom: `2px solid ${DESIGN_SYSTEM.colors.section_background}`,
              backgroundColor: DESIGN_SYSTEM.colors.card_background,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <h2 
                  id="prescription-modal-title"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h1.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h1.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    margin: 0,
                    marginBottom: '0.5rem',
                    lineHeight: DESIGN_SYSTEM.typography.headings.h1.lineHeight
                  }}
                >
                  📋 Prescription Details
                </h2>
                <p style={{
                  fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                  color: DESIGN_SYSTEM.colors.text_muted,
                  margin: 0,
                  lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                }}>
                  Complete prescription information and medical orders
                </p>
              </div>
              <button
                onClick={closePrescriptionModal}
                style={{
                  padding: '0.75rem',
                  backgroundColor: DESIGN_SYSTEM.colors.section_background,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: DESIGN_SYSTEM.colors.text_dark,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: DESIGN_SYSTEM.typography.button_text.fontWeight,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.accessible_error;
                  e.currentTarget.style.color = DESIGN_SYSTEM.colors.accessible_error;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.section_background;
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border;
                  e.currentTarget.style.color = DESIGN_SYSTEM.colors.text_dark;
                }}
                aria-label="Close prescription modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              padding: '2rem',
              overflowY: 'auto',
              flex: 1,
              backgroundColor: DESIGN_SYSTEM.colors.background_white
            }}>
              {/* Prescription Info */}
              {selectedPrescription.prescription && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{
                    backgroundColor: DESIGN_SYSTEM.colors.section_background,
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: `2px solid ${DESIGN_SYSTEM.colors.border}`,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h3 style={{
                      fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                      fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                      color: DESIGN_SYSTEM.colors.text_dark,
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📝 Prescription Information
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        backgroundColor: DESIGN_SYSTEM.colors.background_white,
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                      }}>
                        <label style={DESIGN_SYSTEM.typography.label}>
                          Diagnosis
                        </label>
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: DESIGN_SYSTEM.typography.body_large.fontSize,
                          color: DESIGN_SYSTEM.colors.text_dark,
                          fontWeight: '500',
                          lineHeight: DESIGN_SYSTEM.typography.body_large.lineHeight
                        }}>
                          {selectedPrescription.prescription.diagnosis}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: DESIGN_SYSTEM.colors.background_white,
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                      }}>
                        <label style={DESIGN_SYSTEM.typography.label}>
                          Status
                        </label>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontSize: DESIGN_SYSTEM.typography.status_text.fontSize,
                            fontWeight: DESIGN_SYSTEM.typography.status_text.fontWeight,
                            backgroundColor: getStatusColor(selectedPrescription.prescription.status),
                            color: 'white',
                            textTransform: 'capitalize',
                            display: 'inline-block',
                            lineHeight: DESIGN_SYSTEM.typography.status_text.lineHeight
                          }}>
                            {selectedPrescription.prescription.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPrescription.prescription.notes && (
                      <div style={{
                        backgroundColor: DESIGN_SYSTEM.colors.background_white,
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                      }}>
                        <label style={DESIGN_SYSTEM.typography.label}>
                          Additional Notes
                        </label>
                        <p style={{ 
                          margin: '0.75rem 0 0 0', 
                          fontSize: DESIGN_SYSTEM.typography.body_large.fontSize,
                          color: DESIGN_SYSTEM.colors.text_dark,
                          lineHeight: DESIGN_SYSTEM.typography.body_large.lineHeight,
                          fontStyle: 'normal',
                          fontWeight: '400'
                        }}>
                          {selectedPrescription.prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {selectedPrescription.prescription?.medicines && selectedPrescription.prescription.medicines.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    💊 Medicines ({selectedPrescription.prescription.medicines.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedPrescription.prescription.medicines.map((medicine: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.card_background,
                          border: `2px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: DESIGN_SYSTEM.typography.headings.h3.fontSize,
                              fontWeight: DESIGN_SYSTEM.typography.headings.h3.fontWeight,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              margin: 0,
                              marginBottom: '0.5rem',
                              lineHeight: DESIGN_SYSTEM.typography.headings.h3.lineHeight
                            }}>
                              {medicine.name}
                            </h4>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              backgroundColor: DESIGN_SYSTEM.colors.accessible_info,
                              color: 'white',
                              borderRadius: '0.75rem',
                              fontSize: DESIGN_SYSTEM.typography.subtext.fontSize,
                              fontWeight: DESIGN_SYSTEM.typography.subtext.fontWeight,
                              lineHeight: DESIGN_SYSTEM.typography.subtext.lineHeight
                            }}>
                              💊 {medicine.dosage}
                            </div>
                          </div>
                          <div style={{
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <span style={{
                              fontSize: DESIGN_SYSTEM.typography.subtext.fontSize,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              fontWeight: DESIGN_SYSTEM.typography.subtext.fontWeight
                            }}>
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: '1rem',
                          marginTop: '1rem'
                        }}>
                          <div style={{
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>⏰</span>
                              <label style={DESIGN_SYSTEM.typography.label_small}>
                                Timing Schedule
                              </label>
                            </div>
                            <div style={{
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              fontWeight: '500',
                              lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                            }}>
                              {medicine.timing?.join(', ') || 'Not specified'}
                            </div>
                          </div>
                          
                          <div style={{
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>📅</span>
                              <label style={DESIGN_SYSTEM.typography.label_small}>
                                Duration
                              </label>
                            </div>
                            <div style={{
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              fontWeight: '500',
                              lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                            }}>
                              {medicine.duration} day(s)
                            </div>
                          </div>
                          
                          <div style={{
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>🍽️</span>
                              <label style={DESIGN_SYSTEM.typography.label_small}>
                                Meal Time
                              </label>
                            </div>
                            <div style={{
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              fontWeight: '500',
                              lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                            }}>
                              {medicine.mealTime || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Test Orders */}
              {selectedPrescription.labTestOrders && selectedPrescription.labTestOrders.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🧪 Lab Test Orders ({selectedPrescription.labTestOrders.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedPrescription.labTestOrders.map((order: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.card_background,
                          border: `2px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: DESIGN_SYSTEM.typography.headings.h3.fontSize,
                              fontWeight: DESIGN_SYSTEM.typography.headings.h3.fontWeight,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              margin: 0,
                              marginBottom: '0.5rem',
                              lineHeight: DESIGN_SYSTEM.typography.headings.h3.lineHeight
                            }}>
                              Lab Order #{order.orderId}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginTop: '0.5rem'
                            }}>
                              <div style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: DESIGN_SYSTEM.colors.accessible_success,
                                color: 'white',
                                borderRadius: '0.75rem',
                                fontSize: DESIGN_SYSTEM.typography.subtext.fontSize,
                                fontWeight: DESIGN_SYSTEM.typography.subtext.fontWeight
                              }}>
                                💰 ₹{order.totalAmount}
                              </div>
                              <span style={{
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_muted,
                                fontWeight: '500'
                              }}>
                                {order.items?.length || 0} test(s) ordered
                              </span>
                            </div>
                          </div>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontSize: DESIGN_SYSTEM.typography.status_text.fontSize,
                            fontWeight: DESIGN_SYSTEM.typography.status_text.fontWeight,
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            textTransform: 'capitalize',
                            lineHeight: DESIGN_SYSTEM.typography.status_text.lineHeight
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ 
                          backgroundColor: DESIGN_SYSTEM.colors.section_background,
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🔬</span>
                            <label style={DESIGN_SYSTEM.typography.label}>
                              Ordered Tests
                            </label>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {order.items?.map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                style={{
                                  backgroundColor: DESIGN_SYSTEM.colors.background_white,
                                  padding: '1rem',
                                  borderRadius: '0.75rem',
                                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <span style={{ 
                                    fontSize: DESIGN_SYSTEM.typography.body_large.fontSize,
                                    fontWeight: '600', 
                                    color: DESIGN_SYSTEM.colors.text_dark 
                                  }}>
                                    {item.name}
                                  </span>
                                  <span style={{ 
                                    fontSize: DESIGN_SYSTEM.typography.body.fontSize, 
                                    color: DESIGN_SYSTEM.colors.text_muted,
                                    fontWeight: '500'
                                  }}>
                                    ₹{item.price} × {item.quantity}
                                  </span>
                                </div>
                                {item.result && (
                                  <div style={{ 
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    backgroundColor: DESIGN_SYSTEM.colors.section_background,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                      <span style={{ fontSize: '1rem' }}>📋</span>
                                      <label style={DESIGN_SYSTEM.typography.label_small}>
                                        Result
                                      </label>
                                    </div>
                                    <div style={{
                                      fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                      color: DESIGN_SYSTEM.colors.text_dark,
                                      lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                                    }}>
                                      {item.result}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.collectionMethod && (
                          <div style={{ 
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            borderRadius: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>📍</span>
                              <label style={DESIGN_SYSTEM.typography.label_small}>
                                Collection Method
                              </label>
                              <span style={{
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_dark,
                                fontWeight: '500',
                                marginLeft: '0.5rem'
                              }}>
                                {order.collectionMethod?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicine Orders */}
              {selectedPrescription.medicineOrders && selectedPrescription.medicineOrders.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    💊 Medicine Orders ({selectedPrescription.medicineOrders.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedPrescription.medicineOrders.map((order: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: DESIGN_SYSTEM.colors.card_background,
                          border: `2px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: DESIGN_SYSTEM.typography.headings.h3.fontSize,
                              fontWeight: DESIGN_SYSTEM.typography.headings.h3.fontWeight,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              margin: 0,
                              marginBottom: '0.5rem',
                              lineHeight: DESIGN_SYSTEM.typography.headings.h3.lineHeight
                            }}>
                              Medicine Order #{order.orderId}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginTop: '0.5rem'
                            }}>
                              <div style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: DESIGN_SYSTEM.colors.accessible_success,
                                color: 'white',
                                borderRadius: '0.75rem',
                                fontSize: DESIGN_SYSTEM.typography.subtext.fontSize,
                                fontWeight: DESIGN_SYSTEM.typography.subtext.fontWeight
                              }}>
                                💰 ₹{order.totalAmount}
                              </div>
                              <span style={{
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_muted,
                                fontWeight: '500'
                              }}>
                                {order.items?.length || 0} medicine(s) ordered
                              </span>
                            </div>
                          </div>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontSize: DESIGN_SYSTEM.typography.status_text.fontSize,
                            fontWeight: DESIGN_SYSTEM.typography.status_text.fontWeight,
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            textTransform: 'capitalize',
                            lineHeight: DESIGN_SYSTEM.typography.status_text.lineHeight
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ 
                          backgroundColor: DESIGN_SYSTEM.colors.section_background,
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>💊</span>
                            <label style={DESIGN_SYSTEM.typography.label}>
                              Ordered Medicines
                            </label>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {order.items?.map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                style={{
                                  backgroundColor: DESIGN_SYSTEM.colors.background_white,
                                  padding: '1rem',
                                  borderRadius: '0.75rem',
                                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ 
                                    fontSize: DESIGN_SYSTEM.typography.body_large.fontSize,
                                    fontWeight: '600', 
                                    color: DESIGN_SYSTEM.colors.text_dark 
                                  }}>
                                    {item.name}
                                  </span>
                                  <span style={{ 
                                    fontSize: DESIGN_SYSTEM.typography.body.fontSize, 
                                    color: DESIGN_SYSTEM.colors.text_muted,
                                    fontWeight: '500'
                                  }}>
                                    ₹{item.price} × {item.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{
                            padding: '1rem',
                            backgroundColor: DESIGN_SYSTEM.colors.section_background,
                            borderRadius: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>🚚</span>
                              <label style={DESIGN_SYSTEM.typography.label_small}>
                                Delivery Method
                              </label>
                            </div>
                            <span style={{
                              fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                              color: DESIGN_SYSTEM.colors.text_dark,
                              fontWeight: '500',
                              lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                            }}>
                              {order.deliveryMethod?.toUpperCase() || 'Not specified'}
                            </span>
                          </div>
                          
                          {order.estimatedDelivery && (
                            <div style={{
                              padding: '1rem',
                              backgroundColor: DESIGN_SYSTEM.colors.section_background,
                              borderRadius: '0.75rem',
                              border: `1px solid ${DESIGN_SYSTEM.colors.border}`
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>📅</span>
                                <label style={DESIGN_SYSTEM.typography.label_small}>
                                  Estimated Delivery
                                </label>
                              </div>
                              <span style={{
                                fontSize: DESIGN_SYSTEM.typography.body.fontSize,
                                color: DESIGN_SYSTEM.colors.text_dark,
                                fontWeight: '500',
                                lineHeight: DESIGN_SYSTEM.typography.body.lineHeight
                              }}>
                                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {!selectedPrescription.prescription?.medicines?.length && 
               !selectedPrescription.labTestOrders?.length && 
               !selectedPrescription.medicineOrders?.length && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  backgroundColor: DESIGN_SYSTEM.colors.section_background,
                  borderRadius: '1rem',
                  border: `2px dashed ${DESIGN_SYSTEM.colors.border}`,
                  margin: '2rem 0'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h4 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h3.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h3.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    margin: '0 0 0.5rem 0',
                    lineHeight: DESIGN_SYSTEM.typography.headings.h3.lineHeight
                  }}>
                    No Prescription Details Available
                  </h4>
                  <p style={{
                    fontSize: DESIGN_SYSTEM.typography.body_large.fontSize,
                    color: DESIGN_SYSTEM.colors.text_muted,
                    margin: 0,
                    lineHeight: DESIGN_SYSTEM.typography.body_large.lineHeight
                  }}>
                    No prescription information has been recorded for this appointment yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};