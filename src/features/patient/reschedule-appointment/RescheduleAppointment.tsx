import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import type { Appointment } from '../../../types/appointment/appointment.types';
import type { Doctor } from '../../../types/doctor/doctor.types';
import '../../../styles/components/patient-dashboard.styles.css';

interface FieldErrors {
  newDate?: string;
  newTime?: string;
  reason?: string;
}

type Touched = {
  newDate: boolean;
  newTime: boolean;
  reason: boolean;
};

export const RescheduleAppointment = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    newDate: '',
    newTime: '',
    reason: '',
  });

  // Validation state
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({
    newDate: false,
    newTime: false,
    reason: false,
  });

  // Minimum date is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];
  
  // Available time slots (for demo purposes)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AppointmentService.getAppointmentById(appointmentId || '');

      if (response.success && response.data) {
        setAppointment(response.data);

        // Fetch doctor details
        try {
          const doctorResponse = await DoctorService.getDoctorById(response.data.doctorId);
          if (doctorResponse.success) {
            setDoctorDetails(doctorResponse.data);
          }
        } catch (err) {
          console.error(`Failed to fetch doctor details for ${response.data.doctorId}:`, err);
        }

        // Convert time to 24-hour format if it's in 12-hour format
        let timeValue = response.data.time;
        if (timeValue && (timeValue.includes('AM') || timeValue.includes('PM'))) {
          // Convert 12-hour format to 24-hour format
          const [time, period] = timeValue.split(' ');
          const [hours, minutes] = time.split(':');
          let hour24 = parseInt(hours);
          if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
          } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
          }
          timeValue = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        }

        // Ensure the time value matches one of the available time slots
        if (timeValue && !timeSlots.includes(timeValue)) {
          // If the time doesn't match any available slot, try to find a close match
          const targetHour = timeValue.split(':')[0];
          const targetMinute = timeValue.split(':')[1];
          const matchingSlot = timeSlots.find(slot => {
            const slotHour = slot.split(':')[0];
            const slotMinute = slot.split(':')[1];
            return slotHour === targetHour && slotMinute === targetMinute;
          });
          timeValue = matchingSlot || '';
        }

        setFormData({
          newDate: response.data.date,
          newTime: timeValue || '',
          reason: '',
        });
      } else {
        throw new Error('Failed to fetch appointment details');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointment details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, fetchAppointmentDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change if it's been touched
    if (touched[name as keyof Touched]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name as keyof FieldErrors, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in touched) {
      setTouched(prev => ({ ...prev, [name]: true }));
      setErrors(prev => ({ ...prev, [name]: validateField(name as keyof FieldErrors, value) }));
    }
  };

  // Validation helpers
  const validateDate = (v: string) => {
    if (!v) return 'Date is required.';
    const selectedDate = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return 'Date cannot be in the past.';
    }
    return undefined;
  };

  const validateTime = (v: string) => {
    if (!v || v.trim() === '') return 'Time is required.';
    if (v === 'Select a time') return 'Time is required.';
    return undefined;
  };

  const validateReason = (v: string) => {
    if (!v.trim()) return 'Reason for rescheduling is required.';
    if (v.trim().length > 500) {
      return 'Reason must be less than 500 characters.';
    }
    return undefined;
  };

  const validateField = (name: keyof FieldErrors, value: string): string | undefined => {
    switch (name) {
      case 'newDate': return validateDate(value);
      case 'newTime': return validateTime(value);
      case 'reason': return validateReason(value);
      default: return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      newDate: validateDate(formData.newDate || ''),
      newTime: validateTime(formData.newTime || ''),
      reason: validateReason(formData.reason || ''),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((m) => !m);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentId) {
      setError('Appointment ID is required');
      return;
    }

    // Mark all fields as touched to show all validation errors
    const allTouched = {
      newDate: true,
      newTime: true,
      reason: true,
    };
    setTouched(allTouched);

    // Validate form immediately with the updated touched state
    const isValid = validateForm();
    if (!isValid) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.form-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // If validation passes, proceed with submission
    submitForm();
  };
  
  const submitForm = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!appointmentId) {
        setError('Appointment ID is required');
        return;
      }

      const response = await AppointmentService.rescheduleAppointment(appointmentId, {
        newDate: formData.newDate,
        newTime: formData.newTime,
        reason: formData.reason,
      });

      if (response.success) {
        setSuccess(true);
        // Redirect to appointments page after a short delay
        setTimeout(() => {
          navigate('/patient/my-appointments');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to reschedule appointment');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule appointment';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
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
              <Link to="/patient/dashboard">Dashboard</Link>
              <Link to="/patient/doctor-directory">Doctor Directory</Link>
              <Link to="/patient/my-appointments">My Appointments</Link>
              <Link to="/patient/profile">Profile</Link>
              <a href="#">Settings</a>
            </nav>
            <div className="pd-nav-right">
              <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
              <div className="pd-avatar" aria-label="Profile" />
              <button
                className="pd-logout-link"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/patient/login';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Container */}
        <main className="pd-container">
          <div className="pd-card">
            <p>Loading appointment details...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
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
              <Link to="/patient/dashboard">Dashboard</Link>
              <Link to="/patient/doctor-directory">Doctor Directory</Link>
              <Link to="/patient/my-appointments">My Appointments</Link>
              <Link to="/patient/profile">Profile</Link>
              <a href="#">Settings</a>
            </nav>
            <div className="pd-nav-right">
              <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
              <div className="pd-avatar" aria-label="Profile" />
              <button
                className="pd-logout-link"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/patient/login';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Container */}
        <main className="pd-container">
          <div className="pd-card" style={{ color: '#e63946' }}>
            <p>{error}</p>
            <button onClick={fetchAppointmentDetails} style={{ marginTop: '12px' }}>
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  if (success) {
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
              <Link to="/patient/dashboard">Dashboard</Link>
              <Link to="/patient/doctor-directory">Doctor Directory</Link>
              <Link to="/patient/my-appointments">My Appointments</Link>
              <Link to="/patient/profile">Profile</Link>
              <a href="#">Settings</a>
            </nav>
            <div className="pd-nav-right">
              <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
              <div className="pd-avatar" aria-label="Profile" />
              <button
                className="pd-logout-link"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/patient/login';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Container */}
        <main className="pd-container">
          <div className="pd-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-dark)' }}>Appointment Rescheduled Successfully!</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-light)' }}>
              Your appointment has been rescheduled. You will be redirected to your appointments page shortly.
            </p>
            <button
              onClick={() => navigate('/patient/my-appointments')}
              style={{ padding: '10px 20px', background: 'var(--color-primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Go to My Appointments
            </button>
          </div>
        </main>
      </>
    );
  }

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
            <Link to="/patient/dashboard">Dashboard</Link>
            <Link to="/patient/doctor-directory">Doctor Directory</Link>
            <Link to="/patient/my-appointments">My Appointments</Link>
            <Link to="/patient/profile">Profile</Link>
            <a href="#">Settings</a>
          </nav>
          <div className="pd-nav-right">
            <div className="pd-bell" title="Notifications" aria-label="Notifications">🔔</div>
            <div className="pd-avatar" aria-label="Profile" />
            <button
              className="pd-logout-link"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/patient/login';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        backgroundColor: '#F9FAFB',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back Link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            cursor: 'pointer',
            color: '#1F2937',
            textDecoration: 'none',
            width: 'fit-content'
          }} onClick={() => navigate('/patient/my-appointments')}>
            ← Reschedule Appointment
          </div>

          {/* Subtitle */}
          <div style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            marginBottom: '2rem'
          }}>
            Select a new date and time for your appointment
          </div>

          {/* Form Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '2rem',
            flex: 1
          }}>
          {/* Current Appointment Card */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            padding: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>Current Appointment</h2>
            {/* Doctor Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>👤</div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1F2937'
                }}>
                  {doctorDetails ?
                    `Dr. ${doctorDetails.firstName} ${doctorDetails.lastName}` :
                    `Doctor ID: ${appointment?.doctorId}`}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9CA3AF'
                }}>
                  {doctorDetails?.specialization || 'General Practice'}
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>📅</span>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  {formatDate(appointment?.date || '')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>🕐</span>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  {formatTime(appointment?.time || '')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>📍</span>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  {appointment?.isVideoCall ? 'Telemedicine' : 'In-Person'}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#9CA3AF',
                marginBottom: '0.25rem'
              }}>Reason:</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>
                {appointment?.reason && appointment.reason.includes('|')
                  ? appointment.reason.split('|').pop()?.trim()
                  : appointment?.reason || 'No reason provided'}
              </div>
            </div>
          </div>

          {/* Reschedule Form Card */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>

            {/* Date Picker */}
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>Select New Date</div>
              <input
                type="date"
                id="newDate"
                name="newDate"
                value={formData.newDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={minDateString}
                aria-invalid={Boolean(touched.newDate && errors.newDate)}
                aria-describedby={touched.newDate && errors.newDate ? 'newDate-error' : undefined}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.newDate ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              {touched.newDate && errors.newDate && (
                <p style={{
                  color: '#EF4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.newDate}
                </p>
              )}
            </div>

            {/* Time Slot Selector */}
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>Select Time Slot</div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, newTime: time }));
                      if (touched.newTime) {
                        setErrors(prev => ({ ...prev, newTime: validateTime(time) }));
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: `1px solid ${formData.newTime === time ? '#3B82F6' : '#E5E7EB'}`,
                      borderRadius: '0.375rem',
                      backgroundColor: formData.newTime === time ? '#3B82F6' : 'white',
                      color: formData.newTime === time ? 'white' : '#6B7280',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
              {touched.newTime && errors.newTime && (
                <p style={{
                  color: '#EF4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.newTime}
                </p>
              )}
            </div>

            {/* Reason Text Area */}
            <div>
              <label htmlFor="reason" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>
                Reason for Rescheduling
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Please let us know why you need to reschedule..."
                maxLength={500}
                aria-invalid={Boolean(touched.reason && errors.reason)}
                aria-describedby={touched.reason && errors.reason ? 'reason-error' : undefined}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.reason ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical'
                }}
              />
              {touched.reason && errors.reason && (
                <p style={{
                  color: '#EF4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {errors.reason}
                </p>
              )}
              <div style={{
                textAlign: 'right',
                fontSize: '0.75rem',
                color: '#9CA3AF',
                marginTop: '0.25rem'
              }}>
                {formData.reason.length}/500 characters
              </div>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              <button
                type="button"
                onClick={() => navigate('/patient/my-appointments')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#6B7280',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: submitting ? '#9CA3AF' : '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
        </div>
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

      {/* Help icon removed */}
    </>
  );
};