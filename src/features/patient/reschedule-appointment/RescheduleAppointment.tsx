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
      <main className="pd-container">
        <div className="pd-card">
          <p>Loading appointment details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pd-container">
        <div className="pd-card" style={{ color: '#e63946' }}>
          <p>{error}</p>
          <button onClick={fetchAppointmentDetails} style={{ marginTop: '12px' }}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (success) {
    return (
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
    );
  }

  return (
    <div className="reschedule-container">
      {/* Back Link */}
      <div className="back-link" onClick={() => navigate('/patient/my-appointments')}>
        ← Reschedule Appointment
      </div>

      {/* Subtitle */}
      <div className="reschedule-subtitle">
        Select a new date and time for your appointment
      </div>

      {/* Form Container */}
      <div className="reschedule-grid">
        {/* Current Appointment Card */}
        <div className="appointment-card">
          <h2 className="card-title">Current Appointment</h2>
          {/* Doctor Info */}
          <div className="doctor-info">
            <div className="doctor-avatar">👤</div>
            <div className="doctor-details">
              <div className="doctor-name">
                {doctorDetails ?
                  `Dr. ${doctorDetails.firstName} ${doctorDetails.lastName}` :
                  `Doctor ID: ${appointment?.doctorId}`}
              </div>
              <div className="doctor-specialty">
                {doctorDetails?.specialization || 'General Practice'}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="appointment-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span className="meta-text">
                {formatDate(appointment?.date || '')}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🕐</span>
              <span className="meta-text">
                {formatTime(appointment?.time || '')}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span className="meta-text">
                {appointment?.isVideoCall ? 'Telemedicine' : 'In-Person'}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="appointment-reason">
            <div className="reason-label">Reason:</div>
            <div className="reason-text">
              {appointment?.reason && appointment.reason.includes('|')
                ? appointment.reason.split('|').pop()?.trim()
                : appointment?.reason || 'No reason provided'}
            </div>
          </div>
        </div>

        {/* Reschedule Form Card */}
        <div className="form-card">
          {/* Date Picker */}
          <div className="form-group">
            <div className="form-label">Select New Date</div>
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
              className={`form-input ${errors.newDate ? 'error' : ''}`}
            />
            {touched.newDate && errors.newDate && (
              <p className="form-error">
                {errors.newDate}
              </p>
            )}
          </div>

          {/* Time Slot Selector */}
          <div className="form-group">
            <div className="form-label">Select Time Slot</div>
            <div className="time-slots">
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
                  className={`time-slot ${formData.newTime === time ? 'selected' : ''}`}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
            {touched.newTime && errors.newTime && (
              <p className="form-error">
                {errors.newTime}
              </p>
            )}
          </div>

          {/* Reason Text Area */}
          <div className="form-group">
            <label htmlFor="reason" className="form-label">
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
              className={`form-textarea ${errors.reason ? 'error' : ''}`}
            />
            {touched.reason && errors.reason && (
              <p className="form-error">
                {errors.reason}
              </p>
            )}
            <div className="char-count">
              {formData.reason.length}/500 characters
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/patient/my-appointments')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};