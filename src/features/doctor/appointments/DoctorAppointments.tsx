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
    text_dark: "#1F2937",
    text_light: "#6B7280",
    background_light: "#F9FAFB",
    border: "#E5E7EB",
    status_confirmed: "#10B981",
    status_pending: "#F59E0B",
    status_cancelled: "#EF4444",
    status_completed: "#6B7280",
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
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'confirmed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'completed':
        return '#6c757d';
      default:
        return '#6c757d';
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

                            {/* View Prescription Button */}
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={closePrescriptionModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: DESIGN_SYSTEM.typography.headings.h1.fontSize,
                fontWeight: DESIGN_SYSTEM.typography.headings.h1.fontWeight,
                color: DESIGN_SYSTEM.colors.text_dark,
                margin: 0
              }}>
                Prescription Details
              </h2>
              <button
                onClick={closePrescriptionModal}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: DESIGN_SYSTEM.colors.text_light
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.border;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Prescription Info */}
              {selectedPrescription.prescription && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1rem'
                  }}>
                    Prescription Information
                  </h3>
                  
                  <div style={{
                    backgroundColor: DESIGN_SYSTEM.colors.background_light,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <strong>Diagnosis:</strong>
                        <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                          {selectedPrescription.prescription.diagnosis}
                        </span>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: getStatusColor(selectedPrescription.prescription.status),
                          color: selectedPrescription.prescription.status === 'Created' ? '#065F46' : DESIGN_SYSTEM.colors.text_light
                        }}>
                          {selectedPrescription.prescription.status}
                        </span>
                      </div>
                    </div>
                    
                    {selectedPrescription.prescription.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          color: DESIGN_SYSTEM.colors.text_light,
                          fontStyle: 'italic'
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
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1rem'
                  }}>
                    Medicines ({selectedPrescription.prescription.medicines.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedPrescription.prescription.medicines.map((medicine: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'white',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '0.5rem',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: DESIGN_SYSTEM.colors.text_dark,
                            margin: 0
                          }}>
                            {medicine.name}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            color: DESIGN_SYSTEM.colors.text_light
                          }}>
                            {medicine.dosage}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <div>
                            <strong>Timing:</strong>
                            <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                              {medicine.timing?.join(', ') || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <strong>Duration:</strong>
                            <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                              {medicine.duration} day(s)
                            </span>
                          </div>
                          <div>
                            <strong>Meal Time:</strong>
                            <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                              {medicine.mealTime || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Test Orders */}
              {selectedPrescription.labTestOrders && selectedPrescription.labTestOrders.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1rem'
                  }}>
                    Lab Test Orders ({selectedPrescription.labTestOrders.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedPrescription.labTestOrders.map((order: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'white',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '0.5rem',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: DESIGN_SYSTEM.colors.text_dark,
                              margin: 0
                            }}>
                              Order ID: {order.orderId}
                            </h4>
                            <span style={{
                              fontSize: '0.75rem',
                              color: DESIGN_SYSTEM.colors.text_light
                            }}>
                              Total: ${order.totalAmount}
                            </span>
                          </div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(order.status),
                            color: order.status === 'completed' ? '#065F46' : DESIGN_SYSTEM.colors.text_light
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Tests:</strong>
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {order.items?.map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                style={{
                                  backgroundColor: DESIGN_SYSTEM.colors.background_light,
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                                  <span style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                    ${item.price} x {item.quantity}
                                  </span>
                                </div>
                                {item.result && (
                                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    <strong>Result:</strong>
                                    <span style={{ marginLeft: '0.5rem' }}>{item.result}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.deliveryAddress && (
                          <div>
                            <strong>Collection Method:</strong>
                            <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                              {order.collectionMethod?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicine Orders */}
              {selectedPrescription.medicineOrders && selectedPrescription.medicineOrders.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{
                    fontSize: DESIGN_SYSTEM.typography.headings.h2.fontSize,
                    fontWeight: DESIGN_SYSTEM.typography.headings.h2.fontWeight,
                    color: DESIGN_SYSTEM.colors.text_dark,
                    marginBottom: '1rem'
                  }}>
                    Medicine Orders ({selectedPrescription.medicineOrders.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedPrescription.medicineOrders.map((order: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'white',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '0.5rem',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: DESIGN_SYSTEM.colors.text_dark,
                              margin: 0
                            }}>
                              Order ID: {order.orderId}
                            </h4>
                            <span style={{
                              fontSize: '0.75rem',
                              color: DESIGN_SYSTEM.colors.text_light
                            }}>
                              Total: ${order.totalAmount}
                            </span>
                          </div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(order.status),
                            color: order.status === 'completed' ? '#065F46' : DESIGN_SYSTEM.colors.text_light
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Medicines:</strong>
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {order.items?.map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                style={{
                                  backgroundColor: DESIGN_SYSTEM.colors.background_light,
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                                  <span style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                    ${item.price} x {item.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                          <div>
                            <strong>Delivery Method:</strong>
                            <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                              {order.deliveryMethod?.toUpperCase()}
                            </span>
                          </div>
                          {order.estimatedDelivery && (
                            <div>
                              <strong>Estimated Delivery:</strong>
                              <span style={{ marginLeft: '0.5rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                {new Date(order.estimatedDelivery).toLocaleDateString()}
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
                  padding: '2rem',
                  color: DESIGN_SYSTEM.colors.text_light
                }}>
                  <p>No prescription details available for this appointment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};