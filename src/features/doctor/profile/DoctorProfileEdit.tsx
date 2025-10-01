import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { AuthService } from '../../../services/auth/auth.service';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import '../../../styles/components/patient-dashboard.styles.css';

interface DoctorProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string; // comma-separated string
  licenseNumber?: string;
  experience?: string | number;
  consultationFee?: number | string;
  qualification?: string;
  hospital?: string;
  availableDays?: string[];
  availableTime?: {
    start?: string;
    end?: string;
  };
}

type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'specialization'
  | 'licenseNumber'
  | 'experience'
  | 'consultationFee'
  | 'qualification'
  | 'hospital'
  | 'availableDays'
  | 'availableStart'
  | 'availableEnd';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorProfileEdit = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const token = useMemo(() => authState.token || AuthService.getToken() || '', [authState.token]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const [form, setForm] = useState<DoctorProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    consultationFee: '',
    qualification: '',
    hospital: '',
    availableDays: [],
    availableTime: { start: '', end: '' },
  });

  // Validation state
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    firstName: false,
    lastName: false,
    phone: false,
    specialization: false,
    licenseNumber: false,
    experience: false,
    consultationFee: false,
    qualification: false,
    hospital: false,
    availableDays: false,
    availableStart: false,
    availableEnd: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string | null>>({
    firstName: null,
    lastName: null,
    phone: null,
    specialization: null,
    licenseNumber: null,
    experience: null,
    consultationFee: null,
    qualification: null,
    hospital: null,
    availableDays: null,
    availableStart: null,
    availableEnd: null,
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // Prefill from navigation state if available
      const stateProfile: DoctorProfileData | undefined = location?.state?.profile;
      if (stateProfile) {
        if (!isMounted) return;
        setForm((prev) => ({
          ...prev,
          ...stateProfile,
          availableDays: stateProfile.availableDays || [],
          availableTime: stateProfile.availableTime || { start: '', end: '' },
        }));
        setLoading(false);
        // Reset validation on prefill
        setTouched({
          firstName: false,
          lastName: false,
          phone: false,
          specialization: false,
          licenseNumber: false,
          experience: false,
          consultationFee: false,
          qualification: false,
          hospital: false,
          availableDays: false,
          availableStart: false,
          availableEnd: false,
        });
        setFieldErrors({
          firstName: null,
          lastName: null,
          phone: null,
          specialization: null,
          licenseNumber: null,
          experience: null,
          consultationFee: null,
          qualification: null,
          hospital: null,
          availableDays: null,
          availableStart: null,
          availableEnd: null,
        });
        return;
      }

      if (!token) {
        setError('Missing authentication token');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let res = await fetch('http://localhost:3000/api/v1/doctors/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await fetch('http://localhost:3000/api/v1/doctors/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          });
        }

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = (body && (body.message || body.error)) || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        const data: DoctorProfileData = body?.data ?? body;
        if (!isMounted) return;
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || authState.user?.email || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          licenseNumber: data.licenseNumber || '',
          experience: data.experience || '',
          consultationFee: data.consultationFee ?? '',
          qualification: data.qualification || '',
          hospital: data.hospital || '',
          availableDays: Array.isArray(data.availableDays) ? data.availableDays : [],
          availableTime: { start: data.availableTime?.start || '', end: data.availableTime?.end || '' },
        });
        // Reset validation
        setTouched({
          firstName: false,
          lastName: false,
          phone: false,
          specialization: false,
          licenseNumber: false,
          experience: false,
          consultationFee: false,
          qualification: false,
          hospital: false,
          availableDays: false,
          availableStart: false,
          availableEnd: false,
        });
        setFieldErrors({
          firstName: null,
          lastName: null,
          phone: null,
          specialization: null,
          licenseNumber: null,
          experience: null,
          consultationFee: null,
          qualification: null,
          hospital: null,
          availableDays: null,
          availableStart: null,
          availableEnd: null,
        });
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrap();
    return () => { isMounted = false; };
  }, [token, authState.user?.email, location?.state]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Helpers for validation
  const trim = (v?: string) => (v ?? '').trim();
  const onlyDigits = (v?: string) => (v ?? '').replace(/\D/g, '');
  const nameOk = (v: string) => /^[A-Za-z][A-Za-z' -]{1,49}$/.test(v);
  const licenseOk = (v: string) => /^[A-Za-z0-9-]{4,20}$/.test(v);
  const qualOk = (v: string) => /^[A-Za-z.,\s]{2,100}$/.test(v);

  const validateField = (key: FieldKey, currentForm: DoctorProfileData = form): string | null => {
    const firstName = trim(currentForm.firstName);
    const lastName = trim(currentForm.lastName);
    const phone = trim(currentForm.phone);
    const phoneDigits = onlyDigits(phone);

    const specialization = trim(currentForm.specialization);
    const licenseNumber = trim(currentForm.licenseNumber);
    const qualification = trim(currentForm.qualification);
    const hospital = trim(currentForm.hospital);

    const expRaw = String(currentForm.experience ?? '').trim();
    const feeRaw = String(currentForm.consultationFee ?? '').trim();

    const start = currentForm.availableTime?.start ?? '';
    const end = currentForm.availableTime?.end ?? '';

    switch (key) {
      case 'firstName':
        if (!firstName) return 'First name is required.';
        if (!nameOk(firstName)) return 'Enter a valid first name.';
        return null;
      case 'lastName':
        if (!lastName) return 'Last name is required.';
        if (!nameOk(lastName)) return 'Enter a valid last name.';
        return null;
      case 'phone':
        if (!phone) return 'Phone is required.';
        if (phoneDigits.length !== 10) return 'Enter a valid phone number (10 digits).';
        return null;
      case 'specialization': {
        if (!specialization) return 'At least one specialization is required.';
        const tokens = specialization.split(',').map(s => s.trim()).filter(Boolean);
        if (!tokens.length) return 'At least one specialization is required.';
        const tokenOk = tokens.every(t => /^[A-Za-z][A-Za-z .-]{1,49}$/.test(t));
        if (!tokenOk) return 'Specializations must be words (letters, space, . or -), 2–50 chars each.';
        return null;
      }
      case 'licenseNumber':
        if (!licenseNumber) return 'License number is required.';
        if (!licenseOk(licenseNumber)) return 'License must be 4–20 chars (letters, numbers, hyphen).';
        return null;
      case 'experience': {
        if (expRaw === '') return 'Experience is required.';
        const n = Number(expRaw);
        if (!Number.isInteger(n) || n < 0) return 'Experience must be a non-negative integer.';
        if (n > 80) return 'Experience seems too high.';
        return null;
      }
      case 'consultationFee': {
        if (feeRaw === '') return 'Consultation fee is required.';
        const n = Number(feeRaw);
        if (Number.isNaN(n) || n < 0) return 'Fee must be a non-negative number.';
        if (n > 100000) return 'Fee is too high.';
        return null;
      }
      case 'qualification':
        if (!qualification) return 'Qualification is required.';
        if (!qualOk(qualification)) return 'Use letters, commas, periods; 2–100 characters.';
        return null;
      case 'hospital':
        if (!hospital) return 'Hospital/Clinic is required.';
        if (hospital.length < 2 || hospital.length > 100) return 'Hospital must be 2–100 characters.';
        return null;
      case 'availableDays': {
        const days = currentForm.availableDays || [];
        if (!days.length) return 'Select at least one available day.';
        return null;
      }
      case 'availableStart':
        if (!start) return 'Start time is required.';
        return null;
      case 'availableEnd': {
        if (!end) return 'End time is required.';
        if (start && end && end <= start) return 'End time must be after start time.';
        return null;
      }
      default:
        return null;
    }
  };

  const validateAll = (currentForm: DoctorProfileData = form) => {
    const nextErrors: Record<FieldKey, string | null> = {
      firstName: validateField('firstName', currentForm),
      lastName: validateField('lastName', currentForm),
      phone: validateField('phone', currentForm),
      specialization: validateField('specialization', currentForm),
      licenseNumber: validateField('licenseNumber', currentForm),
      experience: validateField('experience', currentForm),
      consultationFee: validateField('consultationFee', currentForm),
      qualification: validateField('qualification', currentForm),
      hospital: validateField('hospital', currentForm),
      availableDays: validateField('availableDays', currentForm),
      availableStart: validateField('availableStart', currentForm),
      availableEnd: validateField('availableEnd', currentForm),
    };
    return nextErrors;
  };

  const markAllTouched = () => {
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      specialization: true,
      licenseNumber: true,
      experience: true,
      consultationFee: true,
      qualification: true,
      hospital: true,
      availableDays: true,
      availableStart: true,
      availableEnd: true,
    });
  };

  const handleBlur = (key: FieldKey) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    setFieldErrors(prev => ({ ...prev, [key]: validateField(key) }));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof DoctorProfileData; value: string } as any;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as DoctorProfileData;
      // Live-validate if already touched
      (Object.keys(touched) as FieldKey[]).forEach((k) => {
        // Only re-validate the exact field changed
        if (k === (name as any)) {
          setFieldErrors(prevErr => ({ ...prevErr, [k]: validateField(k, next) }));
        }
      });
      return next;
    });
  };

  const onChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as any;
    const num = value === '' ? '' : Number(value);
    if (value !== '' && Number.isNaN(num)) return; // ignore invalid
    setForm((prev) => {
      const next = { ...prev, [name]: num as any } as DoctorProfileData;
      const k = name as FieldKey;
      if (touched[k]) setFieldErrors(prevErr => ({ ...prevErr, [k]: validateField(k, next) }));
      return next;
    });
  };

  const onToggleDay = (day: string) => {
    setForm((prev) => {
      const set = new Set(prev.availableDays || []);
      if (set.has(day)) set.delete(day); else set.add(day);
      const next = { ...prev, availableDays: Array.from(set) } as DoctorProfileData;
      setTouched(prevT => ({ ...prevT, availableDays: true }));
      setFieldErrors(prevE => ({ ...prevE, availableDays: validateField('availableDays', next) }));
      return next;
    });
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name: availableStart | availableEnd
    setForm((prev) => {
      const next: DoctorProfileData = {
        ...prev,
        availableTime: {
          ...(prev.availableTime || {}),
          [name === 'availableStart' ? 'start' : 'end']: value,
        },
      };
      const key: FieldKey = name === 'availableStart' ? 'availableStart' : 'availableEnd';
      setTouched(prevT => ({ ...prevT, [key]: true }));
      // Validate both to enforce ordering rule
      setFieldErrors(prevErr => ({
        ...prevErr,
        [key]: validateField(key, next),
        ...(key === 'availableStart' ? { availableEnd: validateField('availableEnd', next) } : {}),
      }));
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    // Validate all fields before submit
    const nextErrors = validateAll();
    setFieldErrors(nextErrors);
    markAllTouched();
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) { setError('Please fix the errors above.'); return; }

    if (!token) { setError('Missing authentication token'); return; }

    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        firstName: trim(form.firstName),
        lastName: trim(form.lastName),
        phone: trim(form.phone),
        specialization: trim(form.specialization), // comma-separated string per API
        licenseNumber: trim(form.licenseNumber),
        experience: form.experience,
        consultationFee: form.consultationFee === '' ? undefined : Number(form.consultationFee),
        qualification: trim(form.qualification),
        hospital: trim(form.hospital),
        availableDays: form.availableDays || [],
        availableTime: {
          start: form.availableTime?.start || '',
          end: form.availableTime?.end || '',
        },
      };

      const res = await fetch('http://localhost:3000/api/v1/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (body && (body.message || body.error)) || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess(body?.message || 'Profile updated successfully');
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds and then navigate
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccess(null);
        navigate('/doctor/profile', { replace: true, state: { updated: true, message: body?.message } });
      }, 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    const errs = validateAll();
    return !Object.values(errs).some(Boolean);
  };

  // Style helper
  const invalidInputStyle = (key: FieldKey): React.CSSProperties =>
    touched[key] && fieldErrors[key]
      ? { border: '1px solid #e63946', outline: 'none' }
      : { border: '1px solid var(--color-border)' };

  return (
    <DoctorLayout
      pageTitle="Edit Profile"
      pageSubtitle=""
      useDoctorContainer={false}
    >
      <section className="pd-grid">
        <div className="pd-col-8">
          <form className="pd-card" onSubmit={onSubmit} noValidate>
            <h6>Personal & Professional Details</h6>
            {error && <p className="pd-stat-label" style={{ color: '#e63946' }}>{error}</p>}

            {loading ? (
              <p className="pd-stat-label">Loading…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="pd-stat-label" htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    onBlur={() => handleBlur('firstName')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('firstName') }}
                    required
                    aria-invalid={touched.firstName && !!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                  />
                  {touched.firstName && fieldErrors.firstName && (
                    <div id="firstName-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.firstName}</div>
                  )}
                </div>

                <div>
                  <label className="pd-stat-label" htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    onBlur={() => handleBlur('lastName')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('lastName') }}
                    required
                    aria-invalid={touched.lastName && !!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                  />
                  {touched.lastName && fieldErrors.lastName && (
                    <div id="lastName-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.lastName}</div>
                  )}
                </div>

               {/*  <div>
                  <label className="pd-stat-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    style={{ width: '90%', padding: 10, borderRadius: 6, border: '1px solid var(--color-border)' }}
                    disabled
                  />
                </div> */}

                <div>
                  <label className="pd-stat-label" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    onBlur={() => handleBlur('phone')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('phone') }}
                    required
                    aria-invalid={touched.phone && !!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
                  />
                  {touched.phone && fieldErrors.phone ? (
                    <div id="phone-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.phone}</div>
                  ) : (
                    <div id="phone-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>Use 10 digits.</div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="pd-stat-label" htmlFor="specialization">Specialization (comma separated)</label>
                  <input
                    id="specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={onChange}
                    onBlur={() => handleBlur('specialization')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('specialization') }}
                    placeholder="Cardiologist,general"
                    aria-invalid={touched.specialization && !!fieldErrors.specialization}
                    aria-describedby={fieldErrors.specialization ? 'specialization-error' : 'specialization-hint'}
                  />
                  {touched.specialization && fieldErrors.specialization ? (
                    <div id="specialization-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.specialization}</div>
                  ) : (
                    <div id="specialization-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>Separate with commas, e.g., Cardiologist,general</div>
                  )}
                </div>

                <div>
                  <label className="pd-stat-label" htmlFor="licenseNumber">License Number</label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={onChange}
                    onBlur={() => handleBlur('licenseNumber')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('licenseNumber') }}
                    aria-invalid={touched.licenseNumber && !!fieldErrors.licenseNumber}
                    aria-describedby={fieldErrors.licenseNumber ? 'licenseNumber-error' : 'licenseNumber-hint'}
                  />
                  {touched.licenseNumber && fieldErrors.licenseNumber ? (
                    <div id="licenseNumber-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.licenseNumber}</div>
                  ) : (
                    <div id="licenseNumber-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>4–20 chars: letters, numbers, hyphen.</div>
                  )}
                </div>

                <div>
                  <label className="pd-stat-label" htmlFor="experience">Experience (years)</label>
                  <input
                    id="experience"
                    name="experience"
                    value={String(form.experience ?? '')}
                    onChange={onChange}
                    onBlur={() => handleBlur('experience')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('experience') }}
                    inputMode="numeric"
                    aria-invalid={touched.experience && !!fieldErrors.experience}
                    aria-describedby={fieldErrors.experience ? 'experience-error' : undefined}
                  />
                  {touched.experience && fieldErrors.experience && (
                    <div id="experience-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.experience}</div>
                  )}
                </div>

                <div>
                  <label className="pd-stat-label" htmlFor="consultationFee">Consultation Fee</label>
                  <input
                    id="consultationFee"
                    name="consultationFee"
                    value={String(form.consultationFee ?? '')}
                    onChange={onChangeNumber}
                    onBlur={() => handleBlur('consultationFee')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('consultationFee') }}
                    inputMode="numeric"
                    aria-invalid={touched.consultationFee && !!fieldErrors.consultationFee}
                    aria-describedby={fieldErrors.consultationFee ? 'fee-error' : undefined}
                  />
                  {touched.consultationFee && fieldErrors.consultationFee && (
                    <div id="fee-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.consultationFee}</div>
                  )}
                </div>

                <div>
                  <label className="pd-stat-label" htmlFor="qualification">Qualification</label>
                  <input
                    id="qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={onChange}
                    onBlur={() => handleBlur('qualification')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('qualification') }}
                    aria-invalid={touched.qualification && !!fieldErrors.qualification}
                    aria-describedby={fieldErrors.qualification ? 'qualification-error' : 'qualification-hint'}
                  />
                  {touched.qualification && fieldErrors.qualification ? (
                    <div id="qualification-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.qualification}</div>
                  ) : (
                    <div id="qualification-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>Use letters, commas, and periods; 2–100 characters.</div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="pd-stat-label" htmlFor="hospital">Hospital / Clinic</label>
                  <input
                    id="hospital"
                    name="hospital"
                    value={form.hospital}
                    onChange={onChange}
                    onBlur={() => handleBlur('hospital')}
                    style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('hospital') }}
                    aria-invalid={touched.hospital && !!fieldErrors.hospital}
                    aria-describedby={fieldErrors.hospital ? 'hospital-error' : undefined}
                  />
                  {touched.hospital && fieldErrors.hospital && (
                    <div id="hospital-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.hospital}</div>
                  )}
                </div>
              </div>
            )}

            {!loading && (
              <>
                <div style={{ marginTop: 16 }}>
                  <div className="pd-stat-label" style={{ marginBottom: 8 }}>Available Days</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {WEEK_DAYS.map((d) => (
                      <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={!!form.availableDays?.includes(d)}
                          onChange={() => onToggleDay(d)}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                  {touched.availableDays && fieldErrors.availableDays && (
                    <div style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.availableDays}</div>
                  )}
                </div>

                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="pd-stat-label" htmlFor="availableStart">Available Time (Start)</label>
                    <input
                      id="availableStart"
                      type="time"
                      name="availableStart"
                      value={form.availableTime?.start || ''}
                      onChange={onTimeChange}
                      onBlur={() => handleBlur('availableStart')}
                      style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('availableStart') }}
                      aria-invalid={touched.availableStart && !!fieldErrors.availableStart}
                      aria-describedby={fieldErrors.availableStart ? 'availableStart-error' : undefined}
                    />
                    {touched.availableStart && fieldErrors.availableStart && (
                      <div id="availableStart-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.availableStart}</div>
                    )}
                  </div>
                  <div>
                    <label className="pd-stat-label" htmlFor="availableEnd">Available Time (End)</label>
                    <input
                      id="availableEnd"
                      type="time"
                      name="availableEnd"
                      value={form.availableTime?.end || ''}
                      onChange={onTimeChange}
                      onBlur={() => handleBlur('availableEnd')}
                      style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('availableEnd') }}
                      aria-invalid={touched.availableEnd && !!fieldErrors.availableEnd}
                      aria-describedby={fieldErrors.availableEnd ? 'availableEnd-error' : undefined}
                    />
                    {touched.availableEnd && fieldErrors.availableEnd ? (
                      <div id="availableEnd-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>{fieldErrors.availableEnd}</div>
                    ) : (
                      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>End time must be after start time.</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="pd-btn pd-btn-primary-light" disabled={saving || loading || !isFormValid()}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" className="pd-btn pd-btn-outlined" onClick={() => navigate('/doctor/profile')} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                  {showSuccessMessage && success && (
                    <div style={{
                      color: '#2e7d32',
                      fontSize: '14px',
                      padding: '8px 12px',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '6px',
                      border: '1px solid #4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>✓</span>
                      <span>{success}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <aside className="pd-col-4">
          <div className="pd-card">
            <h6>Tips</h6>
            <div className="pd-tip-item">
              <p className="pd-tip-title">Keep your practice info updated</p>
              <p className="pd-tip-desc">Accurate details help patients find you and book appointments.</p>
            </div>
            <div className="pd-tip-item">
              <p className="pd-tip-title">Set availability</p>
              <p className="pd-tip-desc">Make sure your available days and time range reflect your current schedule.</p>
            </div>
          </div>
        </aside>
      </section>
    </DoctorLayout>
  );
};
