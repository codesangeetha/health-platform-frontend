import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/components/patient-registration.styles.css';
import '../../styles/landing-page.css';

interface PatientRegisterData {
  userType: 'patient';
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  dateOfBirth: string; // ISO date YYYY-MM-DD
  gender: string;
  bloodGroup: string;
  confirmPassword: string;
  address: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'dateOfBirth'
  | 'gender'
  | 'bloodGroup'
  | 'password'
  | 'confirmPassword'
  | 'address';


type FieldErrors = Partial<Record<FieldKey, string>>;
type Touched = Partial<Record<FieldKey, boolean>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z\s'.-]+$/;
//const phoneRegex = /^[0-9()+\-\s]{7,20}$/;
const phoneRegex = /^\d{10}$/;

const bloodGroups = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
//const gender = new Set(['Male', 'Female', 'Other']);



export const PatientRegister = () => {
  const { register, authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState<PatientRegisterData>({
    userType: 'patient',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    dateOfBirth: '',
    bloodGroup: '',
    confirmPassword: '',
    gender: '',
    address: '',
    allergies: [],
    chronicDiseases: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [diseaseInput, setDiseaseInput] = useState('');

  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});


  // ---------- Validation helpers ----------
  const validateFirstName = (v: string) => {
    const s = v.trim();
    if (!s) return 'First name is required.';
    if (!nameRegex.test(s)) return 'First name should contain only characters, no numbers allowed.';
    return undefined;
  };
  const validateLastName = (v: string) => {
    const s = v.trim();
    if (!s) return 'Last name is required.';
    if (!nameRegex.test(s)) return 'Last name should contain only characters, no numbers allowed.';
    return undefined;
  };
  const validateEmail = (v: string) => {
    const s = v.trim();
    if (!s) return 'Email is required.';
    if (!emailRegex.test(s)) return 'Enter a valid email address.';
    return undefined;
  };
  const validatePhone = (v: string) => {
    const s = v.trim();
    if (!s) return 'Phone number is required.';
    if (!phoneRegex.test(s)) return 'Enter a valid phone number.';
    return undefined;
  };
  const validateWhatsapp = (v: string) => {
    const s = v.trim();
    if (!s) return 'WhatsApp number is required.';
    if (!phoneRegex.test(s)) return 'Enter a valid WhatsApp number.';
    return undefined;
  };
  const validateDOB = (v: string) => {
    if (!v) return 'Date of birth is required.';
    const today = new Date();
    const d = new Date(v + 'T00:00:00');
    if (isNaN(d.getTime())) return 'Enter a valid date.';
    if (d > today) return 'Date of birth cannot be in the future.';
    return undefined;
  };
  const validateGender = (v: string) => {
    if (!v) return 'Gender is required.';
    return undefined;
  };
  const validateBloodGroup = (v: string) => {
    if (!v) return 'Blood group is required.';
    if (!bloodGroups.has(v)) return 'Select a valid blood group.';
    return undefined;
  };
  const validatePassword = (v: string) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return undefined;
  };
  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm) return 'Please confirm your password.';
    if (pass !== confirm) return 'Passwords do not match.';
    return undefined;
  };
  const validateAddress = (v: string) => {
    if (!v) return 'Address is required.';
    return undefined;
  };

  const validateField = (name: FieldKey, value: string): string | undefined => {
    switch (name) {
      case 'firstName': return validateFirstName(value);
      case 'lastName': return validateLastName(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'whatsapp': return validateWhatsapp(value);
      case 'dateOfBirth': return validateDOB(value);
      case 'gender': return validateGender(value);
      case 'bloodGroup': return validateBloodGroup(value);
      case 'password': return validatePassword(value);
      case 'confirmPassword': return validateConfirmPassword(form.password, value);
      case 'address': return validateAddress(value);
      default: return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      firstName: validateFirstName(form.firstName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      whatsapp: validateWhatsapp(form.whatsapp),
      dateOfBirth: validateDOB(form.dateOfBirth),
      gender: validateGender(form.gender),
      bloodGroup: validateBloodGroup(form.bloodGroup),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, confirmPassword),
      address: validateAddress(form.address),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((m) => !m);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (touched.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(form.password, value) }));
      }
      return;
    }


    setForm(prev => ({ ...prev, [name]: value } as PatientRegisterData));

    const key = name as FieldKey;
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const key = name as FieldKey;
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, key === 'confirmPassword' ? confirmPassword : value),
    }));
  };



  /*  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }));
   }; */

  const addAllergy = () => {
    const v = allergyInput.trim();
    if (v) setForm(prev => ({ ...prev, allergies: [...prev.allergies, v] }));
    setAllergyInput('');
  };

  const removeAllergy = (idx: number) => {
    setForm(prev => ({ ...prev, allergies: prev.allergies.filter((_, i) => i !== idx) }));
  };

  const addDisease = () => {
    const v = diseaseInput.trim();
    if (v) setForm(prev => ({ ...prev, chronicDiseases: [...prev.chronicDiseases, v] }));
    setDiseaseInput('');
  };

  const removeDisease = (idx: number) => {
    setForm(prev => ({ ...prev, chronicDiseases: prev.chronicDiseases.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!acceptedTerms) return; // basic terms enforcement

    const isValid = validateForm();
    if (!isValid) {
      // Mark all as touched so errors are visible
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        whatsapp: true,
        dateOfBirth: true,
        gender: true,
        bloodGroup: true,
        password: true,
        confirmPassword: true,
        address: true,
      });
      return;
    }

    // Build payload (trim some fields)
    const payload: PatientRegisterData = {
      ...form,
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      address: form.address.trim(),
      // If API supports address, include it here.
      // address,
    };

    const res = await register(payload as unknown as any);
    if (res.success) {
      // Show success modal
      setShowSuccessModal(true);
    }
  };

  /* // Button enablement
  const requiredFilled =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.dateOfBirth.length > 0 &&
    form.gender.length > 0 &&
    form.bloodGroup.length > 0 &&
    form.password.length >= 1 &&
    form.address.length >= 1 &&
    confirmPassword.length >= 1;

  const hasErrors = Boolean(
    errors.firstName ||
    errors.lastName ||
    errors.email ||
    errors.phone ||
    errors.dateOfBirth ||
    errors.gender ||
    errors.bloodGroup ||
    errors.password ||
    errors.confirmPassword ||
    errors.address
  ); */
  //const canSubmit = !authState.isLoading && acceptedTerms && requiredFilled && !hasErrors;

  return (
    <div className="pr pr--offset">
      <SiteHeader />
      <div className="pr-container">
        {/* Header Section */}
        <section className="pr-header" aria-labelledby="pr-title">
          <div className="pr-header__icon" aria-hidden>
            {/* Placeholder Healthcare icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h1 id="pr-title" className="pr-header__title">HealthCare Portal</h1>
          <p className="pr-header__subtitle">Create Your Account</p>
        </section>


        {/* Card/Form */}
        <section className="pr-card" aria-label="Patient Registration Form">
          {/* Hidden section headers for a11y - reflect JSON */}
          <h2 className="pr-section-title pr-visually-hidden">Personal Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="pr-grid">
              {/* First Name */}
              <div className="pr-field">
                <label htmlFor="firstName">First Name *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                    </svg>
                  </span>
                  <input id="firstName" name="firstName" className="pr-input" placeholder="Enter your first name" value={form.firstName} onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={Boolean(touched.firstName && errors.firstName)}
                    aria-describedby={touched.firstName && errors.firstName ? 'firstName-error' : undefined} />
                </div>
                {touched.firstName && errors.firstName && (
                  <p className="pr-input-error" id="firstName-error" role="alert">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="pr-field">
                <label htmlFor="lastName">Last Name *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                    </svg>
                  </span>
                  <input id="lastName" name="lastName" className="pr-input" placeholder="Enter your last name" value={form.lastName} onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={Boolean(touched.lastName && errors.lastName)}
                    aria-describedby={touched.lastName && errors.lastName ? 'lastName-error' : undefined} />
                </div>
                {touched.lastName && errors.lastName && (
                  <p className="pr-input-error" id="lastName-error" role="alert">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="pr-field">
                <label htmlFor="email">Email Address *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                      <polyline points="3,7 12,13 21,7"></polyline>
                    </svg>
                  </span>
                  <input id="email" name="email" type="email" className="pr-input" placeholder="Enter your email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined} />
                </div>
                {touched.email && errors.email && (
                  <p className="pr-input-error" id="email-error" role="alert">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="pr-field">
                <label htmlFor="phone">Phone Number *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.22a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input id="phone" name="phone" className="pr-input" placeholder="Enter your phone number" value={form.phone} onChange={handleChange}
                    onBlur={handleBlur}
                    inputMode="tel"
                    aria-invalid={Boolean(touched.phone && errors.phone)}
                    aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined} />
                </div>
                {touched.phone && errors.phone && (
                  <p className="pr-input-error" id="phone-error" role="alert">{errors.phone}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="pr-field">
                <label htmlFor="whatsapp">WhatsApp Number *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M16 8h.01" />
                      <path d="M12 8h.01" />
                      <path d="M8 8h.01" />
                      <path d="M16 12h.01" />
                      <path d="M12 12h.01" />
                      <path d="M8 12h.01" />
                      <path d="M16 16h.01" />
                      <path d="M12 16h.01" />
                      <path d="M8 16h.01" />
                    </svg>
                  </span>
                  <input id="whatsapp" name="whatsapp" className="pr-input" placeholder="Enter your WhatsApp number" value={form.whatsapp} onChange={handleChange}
                    onBlur={handleBlur}
                    inputMode="tel"
                    aria-invalid={Boolean(touched.whatsapp && errors.whatsapp)}
                    aria-describedby={touched.whatsapp && errors.whatsapp ? 'whatsapp-error' : undefined} />
                </div>
                {touched.whatsapp && errors.whatsapp && (
                  <p className="pr-input-error" id="whatsapp-error" role="alert">{errors.whatsapp}</p>
                )}
              </div>

              {/* DOB */}
              <div className="pr-field">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 2v3M17 2v3M4 10h16M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    </svg>
                  </span>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" className="pr-input" placeholder="dd / mm / yyyy" value={form.dateOfBirth} onChange={handleChange}
                    onBlur={handleBlur}
                    max={new Date().toISOString().split('T')[0]}
                    aria-invalid={Boolean(touched.dateOfBirth && errors.dateOfBirth)}
                    aria-describedby={touched.dateOfBirth && errors.dateOfBirth ? 'dob-error' : undefined} />
                </div>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p className="pr-input-error" id="dob-error" role="alert">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Gender */}
              <div className="pr-field">
                <label htmlFor="gender">Gender *</label>
                <div className="pr-input-wrap">
                  <select id="gender" name="gender" className="pr-select" value={form.gender}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    aria-invalid={Boolean(touched.gender && errors.gender)}
                    aria-describedby={touched.gender && errors.gender ? 'gender-error' : undefined}>
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {touched.gender && errors.gender && (
                  <p className="pr-input-error" id="gender-error" role="alert">{errors.gender}</p>
                )}
              </div>

              {/* Blood Group */}
              <div className="pr-field">
                <label htmlFor="bloodGroup">Blood Group *</label>
                <div className="pr-input-wrap">
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    className="pr-select"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.bloodGroup && errors.bloodGroup)}
                    aria-describedby={touched.bloodGroup && errors.bloodGroup ? 'bloodGroup-error' : undefined}
                  >
                    <option value="" disabled>Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                {touched.bloodGroup && errors.bloodGroup && (
                  <p className="pr-input-error" id="bloodGroup-error" role="alert">{errors.bloodGroup}</p>
                )}
              </div>

              {/* Password */}
              <div className="pr-field">
                <label htmlFor="password">Password *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input id="password" name="password" className="pr-input pr-input--password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={handleChange} onBlur={handleBlur}
                    minLength={8}
                    autoComplete="new-password"
                    aria-invalid={Boolean(touched.password && errors.password)}
                    aria-describedby={touched.password && errors.password ? 'password-error' : undefined} />

                  <button type="button" className="pr-input-action" aria-label="Toggle password visibility" onClick={() => setShowPassword(s => !s)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="pr-input-error" id="password-error" role="alert">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="pr-field">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="pr-input-wrap">
                  <span className="pr-input-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input id="confirmPassword" name="confirmPassword" className="pr-input" type="password" placeholder="Confirm your password" value={confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                    aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'confirmPassword-error' : undefined} />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="pr-input-error" id="confirmPassword-error" role="alert">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Address (full width) */}
              <div className="pr-field" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <div className="pr-input-wrap">
                  <textarea id="address" name="address" className="pr-textarea" placeholder="Enter your address" value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-label="Address"
                    aria-invalid={Boolean(touched.address && errors.address)}
                    aria-describedby={touched.address && errors.address ? 'address-error' : undefined}
                  />
                </div>
                {touched.address && errors.address && (
                  <p className="pr-input-error" id="address-error" role="alert">{errors.address}</p>
                )}
              </div>

              {/* Allergies (full width - chip list) */}
              <div className="pr-field" style={{ gridColumn: '1 / -1' }}>
                <label>Allergies (optional)</label>
                <div className="pr-input-wrap" style={{ display: 'flex', gap: '8px' }}>
                  <input className="pr-input" style={{ paddingLeft: 12 }} value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="Add an allergy" />
                  <button type="button" className="pr-role__btn" onClick={addAllergy}>Add</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 8 }}>
                  {form.allergies.map((a, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#1f2937' }}>
                      {a}
                      <button type="button" onClick={() => removeAllergy(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Diseases (full width - chip list) */}
              <div className="pr-field" style={{ gridColumn: '1 / -1' }}>
                <label>Chronic Diseases (optional)</label>
                <div className="pr-input-wrap" style={{ display: 'flex', gap: '8px' }}>
                  <input className="pr-input" style={{ paddingLeft: 12 }} value={diseaseInput} onChange={e => setDiseaseInput(e.target.value)} placeholder="Add a disease" />
                  <button type="button" className="pr-role__btn" onClick={addDisease}>Add</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 8 }}>
                  {form.chronicDiseases.map((d, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#1f2937' }}>
                      {d}
                      <button type="button" onClick={() => removeDisease(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <label className="pr-terms">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              <span>
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </span>
            </label>

            {/* Error / Success */}
            {authState.error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: '0.9rem' }}>{authState.error}</div>}
            {successMessage && <div style={{ color: '#065f46', marginTop: 8, fontSize: '0.9rem' }}>{successMessage}</div>}

            {/* Success Modal */}
            {showSuccessModal && (
              <div className="pr-modal-overlay">
                <div className="pr-modal">
                  <div className="pr-modal-header">
                    <h2>Registration Successful!</h2>
                  </div>
                  <div className="pr-modal-body">
                    <p>Your account has been created successfully. Please login to continue.</p>
                  </div>
                  <div className="pr-modal-footer">
                    <button
                      className="pr-button pr-button--primary"
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate('/patient/login');
                      }}
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="pr-submit" disabled={authState.isLoading || !acceptedTerms}>
              {authState.isLoading ? 'Registering…' : 'Register as Patient'}
            </button>
          </form>
        </section>

        {/* Footer navigation */}
        <footer className="pr-footer">
          <div className="pr-footer__links">
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="pr-footer__copy">© 2024 HealthCare Portal. All rights reserved.</div>
        </footer>
      </div>

      {/* Help icon removed */}
    </div>
  );
}

// Modal styles
const modalStyles = `
  .pr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .pr-modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .pr-modal-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
  }

  .pr-modal-header h2 {
    margin: 0;
    color: #10b981;
    font-size: 1.5rem;
  }

  .pr-modal-body {
    padding: 20px;
    text-align: center;
  }

  .pr-modal-body p {
    margin: 0;
    color: #374151;
    line-height: 1.5;
  }

  .pr-modal-footer {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .pr-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .pr-button--primary {
    background-color: #3b82f6;
    color: white;
  }

  .pr-button--primary:hover {
    background-color: #2563eb;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = modalStyles;
  document.head.appendChild(styleElement);
}

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`hc-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="hc-container hc-header__inner">
        <Link to="/" className="hc-logo" aria-label="HealthCare+ Home">
          <span className="hc-logo__mark">+</span>
          <span>HealthCare+</span>
        </Link>
        <nav className="hc-nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <a href="#services">Services</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}
