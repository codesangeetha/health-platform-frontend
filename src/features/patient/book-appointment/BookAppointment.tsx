import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppointmentService } from '@/services/appointment/appointment.service';
import { DoctorService } from '@/services/doctor/doctor.service';
import type { AppointmentData } from '@/types/appointment/appointment.types';
import type { Doctor } from '@/types/doctor/doctor.types';
import { PatientLayout } from '@/components/layout/PatientLayout';
import '@/styles/components/patient-dashboard.styles.css';
import './BookAppointment.styles.css';

interface FieldErrors {
  date?: string;
  time?: string;
  reason?: string;
  symptoms?: string;
}

type Touched = {
  date: boolean;
  time: boolean;
  reason: boolean;
  symptoms: boolean;
};

export const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<AppointmentData>({
    doctorId: doctorId || '',
    date: '',
    time: '',
    isVideoCall: false,
    reason: '',
    symptoms: ''
  });

  // Validation state
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({
    date: false,
    time: false,
    reason: false,
    symptoms: false,
  });

  // Minimum date is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  // Generate time slots based on doctor's available time
  const generateTimeSlots = (availableTime: { start: string; end: string }): string[] => {
    const slots: string[] = [];
    
    // Parse start and end times (format: "HH:MM")
    const [startHour, startMinute] = availableTime.start.split(':').map(Number);
    const [endHour, endMinute] = availableTime.end.split(':').map(Number);
    
    // Convert to minutes from midnight
    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Generate 30-minute slots
    while (currentMinutes + 30 <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      
      // Convert to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      // Store in 24-hour format for value (HH:MM)
      const valueHours = hours.toString().padStart(2, '0');
      const valueMinutes = minutes.toString().padStart(2, '0');
      const timeValue = `${valueHours}:${valueMinutes}`;
      
      // Display in 12-hour format
      const timeDisplay = `${displayHours}:${displayMinutes} ${period}`;
      
      slots.push(timeValue + '|' + timeDisplay); // Store both value and display
      currentMinutes += 30;
    }
    
    return slots;
  };

  // Available time slots based on doctor's schedule
  const timeSlots = doctor?.availableTime
    ? generateTimeSlots(doctor.availableTime)
    : [];

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
    if (!v) return 'Time is required.';
    return undefined;
  };

  const validateReason = (v: string) => {
    if (!v.trim()) return 'Reason for visit is required.';
    return undefined;
  };

  const validateSymptoms = (v: string) => {
    if (!v.trim()) return 'Symptoms description is required.';
    return undefined;
  };

  const validateField = (name: keyof FieldErrors, value: string): string | undefined => {
    switch (name) {
      case 'date': return validateDate(value);
      case 'time': return validateTime(value);
      case 'reason': return validateReason(value);
      case 'symptoms': return validateSymptoms(value);
      default: return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      date: validateDate(formData.date || ''),
      time: validateTime(formData.time || ''),
      reason: validateReason(formData.reason || ''),
      symptoms: validateSymptoms(formData.symptoms || ''),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((m) => !m);
  };

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!doctorId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await DoctorService.getDoctorById(doctorId);
        setDoctor(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [doctorId]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Validate field on change if it's been touched
    if (name in touched) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all validation errors
    const allTouched = {
      date: true,
      time: true,
      reason: true,
      symptoms: true,
    };
    setTouched(allTouched);
    
    // Validate form with the updated touched state
    setTimeout(() => {
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
    }, 0);
  };
  
  const submitForm = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare data for API in the correct format
      const appointmentData = {
        ...formData,
        // Keep date and time as separate strings in the required format
        date: formData.date, // Already in YYYY-MM-DD format from date input
        time: formData.time, // Already in HH:MM format from dropdown
      };
      
      const response = await AppointmentService.bookAppointment(appointmentData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to appointments page after a short delay
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-container">
        <div className="pd-card">
          <p>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-container">
        <div className="pd-card" style={{ color: '#e63946' }}>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/patient/doctor-directory')}
            style={{ marginTop: '12px', padding: '8px 16px', background: 'var(--color-primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to Doctor Directory
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pd-container">
        <div className="pd-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-dark)' }}>Appointment Booked Successfully!</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-light)' }}>
            Your appointment has been scheduled. You will be redirected to your dashboard shortly.
          </p>
          <button 
            onClick={() => navigate('/patient/dashboard')}
            style={{ padding: '10px 20px', background: 'var(--color-primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="booking-container">
        <div className="booking-grid">
          {/* Booking Panel */}
          <div className="booking-panel">
            <div className="booking-header">
              <h2 className="booking-title">Book Appointment</h2>
              <p className="booking-subtitle">Schedule your visit with Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Loading...'}</p>
            </div>
            
            <div className="booking-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Select Date & Time</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      min={minDateString}
                      aria-invalid={Boolean(touched.date && errors.date)}
                      aria-describedby={touched.date && errors.date ? 'date-error' : undefined}
                    />
                    {touched.date && errors.date && (
                      <p className="form-error" id="date-error" role="alert">{errors.date}</p>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="time">Time *</label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(touched.time && errors.time)}
                      aria-describedby={touched.time && errors.time ? 'time-error' : undefined}
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(slot => {
                        const [value, display] = slot.split('|');
                        return (
                          <option key={value} value={value}>{display}</option>
                        );
                      })}
                    </select>
                    {touched.time && errors.time && (
                      <p className="form-error" id="time-error" role="alert">{errors.time}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Appointment Details</h3>
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isVideoCall"
                      name="isVideoCall"
                      checked={formData.isVideoCall}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isVideoCall">Video Consultation</label>
                  </div>
                  <p className="checkbox-description">
                    This will be a video call appointment via our secure platform
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Visit *</label>
                  <input
                    type="text"
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Please describe your symptoms, concerns, or reason for this appointment..."
                    aria-invalid={Boolean(touched.reason && errors.reason)}
                    aria-describedby={touched.reason && errors.reason ? 'reason-error' : undefined}
                  />
                  {touched.reason && errors.reason && (
                    <p className="form-error" id="reason-error" role="alert">{errors.reason}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="symptoms">Symptoms</label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Describe your symptoms or concerns"
                    rows={4}
                    aria-invalid={Boolean(touched.symptoms && errors.symptoms)}
                    aria-describedby={touched.symptoms && errors.symptoms ? 'symptoms-error' : undefined}
                  />
                  {touched.symptoms && errors.symptoms && (
                    <p className="form-error" id="symptoms-error" role="alert">{errors.symptoms}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
          </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="booking-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/patient/doctor-directory')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>

          {/* Sidebar with Summary and Help */}
          <div className="booking-sidebar">
            <div className="booking-summary-card">
              <div className="summary-header">
                <h3 className="summary-title">Booking Summary</h3>
              </div>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not selected'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">
                    {formData.time ? (() => {
                      const [hours, minutes] = formData.time.split(':').map(Number);
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                    })() : 'Not selected'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Type:</span>
                  <span className="summary-value">Consultation</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Cost:</span>
                  <span className="summary-value">$150</span>
                </div>
              </div>
            </div>

            <div className="help-section">
              <div className="help-header">
                <h3 className="help-title">Need Help?</h3>
              </div>
              <div className="help-content">
                <p>If you need assistance with booking or have questions, our support team is here to help.</p>
                <div className="contact-info">
                  <div className="contact-item">Call: (555) 123-4567</div>
                  <div className="contact-item">support@doctorbooker.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
  };