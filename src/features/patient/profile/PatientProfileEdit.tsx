import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthService } from '@/services/auth/auth.service';
import { Link, useNavigate } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { BASE_URL } from '@/config/constants';
import '@/styles/components/patient-dashboard.styles.css';

interface EmergencyContactForm {
  name: string;
  relationship: string;
  phone: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  bloodGroup: string;
  allergies: string; // comma-separated
  chronicDiseases: string; // comma-separated
  emergencyContact: EmergencyContactForm;
}

interface PatientProfileResponse {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: Partial<EmergencyContactForm>;
  [key: string]: any;
}

type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'bloodGroup'
  | 'ec.name'
  | 'ec.relationship'
  | 'ec.phone';

export const PatientProfileEdit = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = useMemo(() => authState.sessions.patient.token || AuthService.getToken('patient') || '', [authState.sessions.patient.token]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
  });

  // Validation state
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    whatsapp: false,
    bloodGroup: false,
    'ec.name': false,
    'ec.relationship': false,
    'ec.phone': false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string | null>>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    whatsapp: null,
    bloodGroup: null,
    'ec.name': null,
    'ec.relationship': null,
    'ec.phone': null,
  });

  const displayName = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name || authState.sessions.patient.user?.email?.split('@')[0] || 'Patient';
  }, [form.firstName, form.lastName, authState.sessions.patient.user?.email]);

  useEffect(() => {
    let isMounted = true;

    const prefill = (data: PatientProfileResponse) => {
      const allergies = Array.isArray(data.allergies) ? data.allergies.join(', ') : '';
      const chronic = Array.isArray(data.chronicDiseases) ? data.chronicDiseases.join(', ') : '';
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        bloodGroup: data.bloodGroup || '',
        allergies,
        chronicDiseases: chronic,
        emergencyContact: {
          name: data.emergencyContact?.name || '',
          relationship: data.emergencyContact?.relationship || '',
          phone: data.emergencyContact?.phone || '',
        },
      });
      // Clear any previous validation state on prefill
      setTouched({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        whatsapp: false,
        bloodGroup: false,
        'ec.name': false,
        'ec.relationship': false,
        'ec.phone': false,
      });
      setFieldErrors({
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        whatsapp: null,
        bloodGroup: null,
        'ec.name': null,
        'ec.relationship': null,
        'ec.phone': null,
      });
    };

    const fetchProfile = async () => {
      if (!token) {
        setError('Missing authentication token');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let res = await fetch(`${BASE_URL}/api/v1/patients/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await fetch(`${BASE_URL}/api/v1/patients/profile`, {
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
        const data: PatientProfileResponse = body?.data ?? body;
        if (isMounted) prefill(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [token]);

  const onChange = (field: keyof ProfileForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Live-validate on change if already touched
    if (field === 'firstName' && touched.firstName) {
      setFieldErrors(prev => ({ ...prev, firstName: validateField('firstName', { ...form, [field]: value }) }));
    }
    if (field === 'lastName' && touched.lastName) {
      setFieldErrors(prev => ({ ...prev, lastName: validateField('lastName', { ...form, [field]: value }) }));
    }
    if (field === 'email' && touched.email) {
      setFieldErrors(prev => ({ ...prev, email: validateField('email', { ...form, [field]: value }) }));
    }
    if (field === 'phone' && touched.phone) {
      setFieldErrors(prev => ({ ...prev, phone: validateField('phone', { ...form, [field]: value }) }));
    }
    if (field === 'whatsapp' && touched.whatsapp) {
      setFieldErrors(prev => ({ ...prev, whatsapp: validateField('whatsapp', { ...form, [field]: value }) }));
    }
    if (field === 'bloodGroup' && touched.bloodGroup) {
      setFieldErrors(prev => ({ ...prev, bloodGroup: validateField('bloodGroup', { ...form, [field]: value }) }));
    }
  };

  const onECChange = (field: keyof EmergencyContactForm, value: string) => {
    setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));

    // Because EC fields depend on each other, we re-validate all three when any changes (if any has been touched)
    const anyECTouched = touched['ec.name'] || touched['ec.relationship'] || touched['ec.phone'];
    if (anyECTouched) {
      const nextForm = { ...form, emergencyContact: { ...form.emergencyContact, [field]: value } };
      setFieldErrors(prev => ({
        ...prev,
        'ec.name': validateField('ec.name', nextForm),
        'ec.relationship': validateField('ec.relationship', nextForm),
        'ec.phone': validateField('ec.phone', nextForm),
      }));
    }
  };

  // Helpers
  const trim = (v: string) => (v ?? '').trim();
  const onlyDigits = (v: string) => (v ?? '').replace(/\D/g, '');

  const validateField = (key: FieldKey, currentForm: ProfileForm = form): string | null => {
    const firstName = trim(currentForm.firstName);
    const lastName = trim(currentForm.lastName);
    const email = trim(currentForm.email);
    const phone = trim(currentForm.phone);
    const whatsapp = trim(currentForm.whatsapp);
    const bloodGroup = trim(currentForm.bloodGroup);

    const ecName = trim(currentForm.emergencyContact.name);
    const ecRelationship = trim(currentForm.emergencyContact.relationship);
    const ecPhone = trim(currentForm.emergencyContact.phone);
    const hasEC = !!(ecName || ecRelationship || ecPhone);

    const nameOk = (v: string) => /^[A-Za-z][A-Za-z' -]{1,49}$/.test(v); // 2-50 chars, letters plus - and '
    const phoneDigits = onlyDigits(phone);
    const whatsappDigits = onlyDigits(whatsapp);
    const ecPhoneDigits = onlyDigits(ecPhone);
    const phoneOk = (d: string) => d.length == 10; // basic length check

    const validBloodGroups = new Set(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);

    switch (key) {
      case 'firstName':
        if (!firstName) return 'First name is required.';
        if (!nameOk(firstName)) return 'Enter a valid first name.';
        return null;
      case 'lastName':
        if (!lastName) return 'Last name is required.';
        if (!nameOk(lastName)) return 'Enter a valid last name.';
        return null;
      case 'email':
        if (!email) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Enter a valid email address.';
        return null;
      case 'phone':
        if (!phone) return 'Phone is required.';
        if (!phoneOk(phoneDigits)) return 'Enter a valid phone number (10 digits).';
        return null;
      case 'whatsapp':
        if (!whatsapp) return 'WhatsApp is required.';
        if (!phoneOk(whatsappDigits)) return 'Enter a valid WhatsApp number (10 digits).';
        return null;
      case 'bloodGroup':
        if (!bloodGroup) return 'Blood group is required'; // optional
        if (!validBloodGroups.has(bloodGroup.toUpperCase())) {
          return 'Blood group must be one of O±, A±, B±, AB±.';
        }
        return null;
      case 'ec.name':
        if (!hasEC) return null;
        if (!ecName) return 'Emergency contact name is required.';
        if (!nameOk(ecName)) return 'Enter a valid emergency contact name.';
        return null;
      case 'ec.relationship':
        if (!hasEC) return null;
        if (!ecRelationship) return 'Emergency contact relationship is required.';
        if (ecRelationship.length < 2) return 'Enter a valid relationship.';
        return null;
      case 'ec.phone':
        if (!hasEC) return null;
        if (!ecPhone) return 'Emergency contact phone is required.';
        if (!phoneOk(ecPhoneDigits)) return 'Enter a valid emergency contact phone (10–15 digits).';
        return null;
      default:
        return null;
    }
  };

  const validateAll = (currentForm: ProfileForm = form) => {
    const nextErrors: Record<FieldKey, string | null> = {
      firstName: validateField('firstName', currentForm),
      lastName: validateField('lastName', currentForm),
      email: validateField('email', currentForm),
      phone: validateField('phone', currentForm),
      whatsapp: validateField('whatsapp', currentForm),
      bloodGroup: validateField('bloodGroup', currentForm),
      'ec.name': validateField('ec.name', currentForm),
      'ec.relationship': validateField('ec.relationship', currentForm),
      'ec.phone': validateField('ec.phone', currentForm),
    };
    return nextErrors;
  };

  const markAllTouched = () => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      whatsapp: true,
      bloodGroup: true,
      'ec.name': true,
      'ec.relationship': true,
      'ec.phone': true,
    });
  };

  const handleBlur = (key: FieldKey) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    setFieldErrors(prev => ({ ...prev, [key]: validateField(key) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing authentication token');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Client-side validation like registration page
    const nextErrors = validateAll();
    setFieldErrors(nextErrors);
    markAllTouched();

    const hasError = Object.values(nextErrors).some(v => !!v);
    if (hasError) {
      setSaving(false);
      return;
    }

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        bloodGroup: form.bloodGroup.trim(),
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicDiseases: form.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact: {
          name: form.emergencyContact.name.trim(),
          relationship: form.emergencyContact.relationship.trim(),
          phone: form.emergencyContact.phone.trim(),
        },
      };

      const res = await fetch(`${BASE_URL}/api/v1/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (body && (body.message || body.error)) || `Update failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess('Profile updated successfully!');

      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/patient/profile');
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

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Common style helpers
  const invalidInputStyle = (key: FieldKey): React.CSSProperties =>
    touched[key] && fieldErrors[key]
      ? { border: '1px solid #e63946', outline: 'none' }
      : { border: '1px solid var(--color-border)' };

  return (

    <section className="pd-grid">
      <div className="pd-col-8">
        <form className="pd-card" onSubmit={handleSubmit} noValidate>
          <h6>Personal Information</h6>
          {error && <div className="pd-stat-label" style={{ color: '#e63946', marginBottom: 8 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="pd-stat-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={e => onChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('firstName') }}
                required
                aria-invalid={touched.firstName && !!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
              />
              {touched.firstName && fieldErrors.firstName && (
                <div id="firstName-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.firstName}
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={e => onChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('lastName') }}
                required
                aria-invalid={touched.lastName && !!fieldErrors.lastName}
                aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
              />
              {touched.lastName && fieldErrors.lastName && (
                <div id="lastName-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.lastName}
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => onChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('email') }}
                required
                aria-invalid={touched.email && !!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : 'email-hint'}
              />
              {touched.email && fieldErrors.email ? (
                <div id="email-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.email}
                </div>
              ) : (
                <div id="email-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Enter a valid email address.
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={e => onChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('phone') }}
                required
                aria-invalid={touched.phone && !!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
              />
              {touched.phone && fieldErrors.phone ? (
                <div id="phone-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.phone}
                </div>
              ) : (
                <div id="phone-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Use 10 digits.
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={e => onChange('whatsapp', e.target.value)}
                onBlur={() => handleBlur('whatsapp')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('whatsapp') }}
                required
                aria-invalid={touched.whatsapp && !!fieldErrors.whatsapp}
                aria-describedby={fieldErrors.whatsapp ? 'whatsapp-error' : 'whatsapp-hint'}
              />
              {touched.whatsapp && fieldErrors.whatsapp ? (
                <div id="whatsapp-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.whatsapp}
                </div>
              ) : (
                <div id="whatsapp-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Use 10 digits.
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="bloodGroup">Blood Group</label>
              <input
                id="bloodGroup"
                type="text"
                placeholder="e.g., O-, A+, B+"
                value={form.bloodGroup}
                onChange={e => onChange('bloodGroup', e.target.value)}
                onBlur={() => handleBlur('bloodGroup')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('bloodGroup') }}
                aria-invalid={touched.bloodGroup && !!fieldErrors.bloodGroup}
                aria-describedby={fieldErrors.bloodGroup ? 'bloodGroup-error' : 'bloodGroup-hint'}
              />
              {touched.bloodGroup && fieldErrors.bloodGroup ? (
                <div id="bloodGroup-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors.bloodGroup}
                </div>
              ) : (
                <div id="bloodGroup-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Allowed values: O+, O-, A+, A-, B+, B-, AB+, AB-.
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="pd-stat-label" htmlFor="allergies">Allergies (optional)</label>
            <input
              id="allergies"
              type="text"
              placeholder="Dust mites, Pollen"
              value={form.allergies}
              onChange={e => onChange('allergies', e.target.value)}
              style={{ width: '90%', padding: 10, borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <div id="allergies-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
              Comma separated.
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="pd-stat-label" htmlFor="chronicDiseases">Chronic Diseases (optional)</label>
            <input
              id="chronicDiseases"
              type="text"
              placeholder="Hypertension, Diabetes"
              value={form.chronicDiseases}
              onChange={e => onChange('chronicDiseases', e.target.value)}
              style={{ width: '90%', padding: 10, borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <div id="chronicDiseases-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
              Comma separated.
            </div>
          </div>

          <h6 style={{ marginTop: 24 }}>Emergency Contact</h6>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="pd-stat-label" htmlFor="ec-name">Name</label>
              <input
                id="ec-name"
                type="text"
                value={form.emergencyContact.name}
                onChange={e => onECChange('name', e.target.value)}
                onBlur={() => handleBlur('ec.name')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('ec.name') }}
                aria-invalid={touched['ec.name'] && !!fieldErrors['ec.name']}
                aria-describedby={fieldErrors['ec.name'] ? 'ec-name-error' : undefined}
              />
              {touched['ec.name'] && fieldErrors['ec.name'] && (
                <div id="ec-name-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors['ec.name']}
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="ec-relationship">Relationship</label>
              <input
                id="ec-relationship"
                type="text"
                value={form.emergencyContact.relationship}
                onChange={e => onECChange('relationship', e.target.value)}
                onBlur={() => handleBlur('ec.relationship')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('ec.relationship') }}
                aria-invalid={touched['ec.relationship'] && !!fieldErrors['ec.relationship']}
                aria-describedby={fieldErrors['ec.relationship'] ? 'ec-relationship-error' : undefined}
              />
              {touched['ec.relationship'] && fieldErrors['ec.relationship'] && (
                <div id="ec-relationship-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors['ec.relationship']}
                </div>
              )}
            </div>

            <div>
              <label className="pd-stat-label" htmlFor="ec-phone">Phone</label>
              <input
                id="ec-phone"
                type="tel"
                value={form.emergencyContact.phone}
                onChange={e => onECChange('phone', e.target.value)}
                onBlur={() => handleBlur('ec.phone')}
                style={{ width: '90%', padding: 10, borderRadius: 6, ...invalidInputStyle('ec.phone') }}
                aria-invalid={touched['ec.phone'] && !!fieldErrors['ec.phone']}
                aria-describedby={fieldErrors['ec.phone'] ? 'ec-phone-error' : 'ec-phone-hint'}
              />
              {touched['ec.phone'] && fieldErrors['ec.phone'] ? (
                <div id="ec-phone-error" style={{ color: '#e63946', fontSize: 12, marginTop: 6 }}>
                  {fieldErrors['ec.phone']}
                </div>
              ) : (
                <div id="ec-phone-hint" style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Use 10 digits.
                </div>
              )}
            </div>
          </div>

          {success && (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <div className="pd-stat-label" style={{ color: '#2e7d32', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                {success}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              className="pd-btn pd-btn-primary-light"
              disabled={saving || loading || !isFormValid()}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link to="/patient/profile" className="pd-btn pd-btn-outlined" style={{ textAlign: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <aside className="pd-col-4">
        <div className="pd-card">
          <h6>Tips</h6>
          <div className="pd-tip-item">
            <p className="pd-tip-title">Keep your info updated</p>
            <p className="pd-tip-desc">Accurate information helps doctors provide better care.</p>
          </div>
          <div className="pd-tip-item">
            <p className="pd-tip-title">Emergency contact</p>
            <p className="pd-tip-desc">Ensure your emergency contact can be reached anytime.</p>
          </div>
        </div>
      </aside>
    </section>

  );
}