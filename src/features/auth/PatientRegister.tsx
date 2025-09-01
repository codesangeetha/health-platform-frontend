import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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
  dateOfBirth: string; // ISO date YYYY-MM-DD
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const PatientRegister = () => {
  const { register, authState } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState<PatientRegisterData>({
    userType: 'patient',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: [],
    chronicDiseases: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [diseaseInput, setDiseaseInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as any));
  };

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }));
  };

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
    const res = await register(form as unknown as any);
    if (res.success) {
      setSuccessMessage('Registration successful. Please login.');
    }
  };

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
                  <input id="firstName" name="firstName" className="pr-input" placeholder="Enter your first name" value={form.firstName} onChange={handleChange} required />
                </div>
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
                  <input id="lastName" name="lastName" className="pr-input" placeholder="Enter your last name" value={form.lastName} onChange={handleChange} required />
                </div>
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
                  <input id="email" name="email" type="email" className="pr-input" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                </div>
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
                  <input id="phone" name="phone" className="pr-input" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} required />
                </div>
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
                  <input id="dateOfBirth" name="dateOfBirth" type="date" className="pr-input" placeholder="dd / mm / yyyy" value={form.dateOfBirth} onChange={handleChange} required max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {/* Gender */}
              <div className="pr-field">
                <label htmlFor="gender">Gender *</label>
                <div className="pr-input-wrap">
                  <select id="gender" name="gender" className="pr-select" defaultValue="">
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
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
                  <input id="password" name="password" className="pr-input pr-input--password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                  <button type="button" className="pr-input-action" aria-label="Toggle password visibility" onClick={() => setShowPassword(s => !s)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
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
                  <input id="confirmPassword" name="confirmPassword" className="pr-input" type="password" placeholder="Confirm your password" />
                </div>
              </div>

              {/* Address (full width) */}
              <div className="pr-field" style={{ gridColumn: '1 / -1' }}>
                <h2 className="pr-section-title">Address</h2>
                <div className="pr-input-wrap">
                  <textarea id="address" name="address" className="pr-textarea" placeholder="Enter your address" />
                </div>
              </div>

              {/* Allergies (full width - chip list) */}
              <div className="pr-field" style={{ gridColumn: '1 / -1' }}>
                <label>Allergies</label>
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
                <label>Chronic Diseases</label>
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

            {/* Submit */}
            <button type="submit" className="pr-submit" disabled={authState.isLoading || !acceptedTerms}>
              {authState.isLoading ? 'Registering…' : 'Register as Patient'}
            </button>
          </form>
        </section>

        {/* Login prompt */}
        <div className="pr-login">
          Already have an account? <Link to="/patient/login">Login here</Link>
        </div>

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

      {/* Help floating icon */}
      <button className="pr-help" aria-label="Help">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19v-2" />
          <path d="M8 7a4 4 0 1 1 8 0c0 2-2 3-3 4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>
    </div>
  );
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
        <div className="hc-header__actions">
          <Link to="/patient/login" className="hc-btn hc-btn--text">Log In</Link>
          <Link to="/patient/register" className="hc-btn hc-btn--primary">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
