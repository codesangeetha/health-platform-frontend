import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/landing-page.css';
import '../../styles/components/patient-login.styles.css';

type FieldErrors = {
  email?: string;
  password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState, clearError, getCurrentSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Validation helpers
  const validateEmail = (value: string): string | undefined => {
    const v = value.trim();
    if (!v) return 'Email is required.';
    if (!emailRegex.test(v)) return 'Enter a valid email address.';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return undefined;
  };

  const validateField = (name: 'email' | 'password', value: string): string | undefined => {
    if (name === 'email') return validateEmail(value);
    if (name === 'password') return validatePassword(value);
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const extractAuthError = (input: unknown): { code?: string; message?: string } | null => {
    if (!input) return null;

    // If an exception was thrown
    if (input instanceof Error) {
      const message = input.message || 'Unable to sign in with the provided credentials.';
       
      // Try to determine if this is an inactive account error
      const isInactiveAccount = /account is inactive|account inactive/i.test(message);
       
      return {
        code: isInactiveAccount ? 'ACCOUNT_INACTIVE' : 'LOGIN_FAILED',
        message: message
      };
    }

    // If it's a direct response object
    if (typeof input === 'object' && input !== null) {
      const res = input as any;
      const message = res?.message || res?.error?.message || 'Login failed';
      const code = res?.code || res?.error?.code;
       
      // Check if this is an inactive account error
      const isInactiveAccount = /account is inactive|account inactive/i.test(message);
       
      return {
        code: isInactiveAccount ? 'ACCOUNT_INACTIVE' : (code || 'LOGIN_FAILED'),
        message: message
      };
    }

    return null;
  };

  const handleInvalidCredentials = (message?: string) => {
    const msg = message || 'Invalid email or password';
    setErrors({
      email: msg,
      password: msg,
    });
    setTouched({ email: true, password: true });
    setFormError(msg);
  };

  // Events
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const name = id as 'email' | 'password';
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'email') {
      setEmail(value);
      if (touched.email) {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      }
    }
    if (id === 'password') {
      setPassword(value);
      if (touched.password) {
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
      }
    }
    // Clear form-level error if user starts editing again
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all previous errors before new attempt
    setFormError(null);
    setErrors({});
    clearError();

    // Client-side validation
    const isValid = validateForm();
    if (!isValid) {
      setTouched({ email: true, password: true });
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, 'doctor');

      // If we get here, login was successful
      // No need to check authState.error here since successful login sets isAuthenticated to true
    } catch (error) {
      const authErr = extractAuthError(error);
      const errorMessage = authErr?.message || '';
      
      // Check for inactive account specifically - show as form error
      if (authErr?.code === 'ACCOUNT_INACTIVE' || /account is inactive/i.test(errorMessage)) {
        setFormError(errorMessage);
        return;
      }
      
      // For invalid credentials, show field-level errors
      if (authErr?.code === 'INVALID_CREDENTIALS' || /invalid email or password/i.test(errorMessage)) {
        handleInvalidCredentials(authErr?.message);
      } else {
        setFormError(authErr?.message || 'Unable to sign in with the provided credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentSession = getCurrentSession();
  const isDoctorAuthenticated = authState.sessions.doctor?.isAuthenticated;

  useEffect(() => {
    if (isDoctorAuthenticated && !authState.isLoading) {
      // Get the redirect location from state or default to doctor dashboard
      const from = location.state?.from?.pathname || '/doctor/dashboard';
      navigate(from, { replace: true });
    }
  }, [isDoctorAuthenticated, authState.isLoading, navigate, location]);
  
  // Show loading while checking authentication
  if (authState.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Don't show login form if doctor user is already authenticated
  if (isDoctorAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Redirecting to dashboard...
      </div>
    );
  }

  return (
    <div>

      <header className={`hc-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="hc-container hc-header__inner">
          <Link to="/" className="hc-logo" aria-label="HealthCare+ Home">
            <span className="hc-logo__mark">+</span>
            <span>HealthCare+</span>
          </Link>
          <nav className="hc-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </nav>

        </div>
      </header>

      {/* Page Content */}
      <main className="pl-page">
        <div className="pl-auth">
          <section className="pl-card" aria-labelledby="doctor-login-title">
            <div className="pl-card__icon" aria-hidden="true">🩺</div>
            <h1 id="doctor-login-title" className="pl-card__title">Doctor Login</h1>
            <p className="pl-card__subtitle">Manage your schedule, patients, and consultations.</p>

            {formError && (
              <div className="pl-form-error" role="alert" aria-live="assertive" style={{ marginBottom: 12 }}>
                {formError}
              </div>
            )}
            {/* Also show any authState.error if you want it visible */}
            {!formError && authState?.error && (
              <div className="pl-form-error" role="alert" aria-live="polite" style={{ marginBottom: 12 }}>
                {String(authState.error)}
              </div>
            )}

            <form className="pl-form" onSubmit={handleSubmit}>
              <div className="pl-form-group">
                <label htmlFor="email">Email</label>
                <div className="pl-input-wrapper">
                  <span className="pl-input-icon" aria-hidden="true">
                    {/* mail icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                      <polyline points="3,7 12,13 21,7"></polyline>
                    </svg>
                  </span>
                  <input
                    className={`pl-input ${touched.email && errors.email ? 'pl-input--invalid' : ''}`}
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    autoComplete="username"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                    inputMode="email"
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="pl-input-error" id="email-error" role="alert" >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="pl-form-group">
                <label htmlFor="password">Password</label>
                <div className="pl-input-wrapper">
                  <span className="pl-input-icon" aria-hidden="true">
                    {/* lock icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    className={`pl-input ${touched.password && errors.password ? 'pl-input--invalid' : ''}`}
                    type="password"
                    id="password"
                    value={password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(touched.password && errors.password)}
                    aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                    minLength={8}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="pl-input-error" id="password-error" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="pl-form-row">
                <label className="pl-checkbox">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="pl-link">Forgot password?</Link>
              </div>

              <button type="submit" className="pl-btn pl-btn--primary" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>

            </form>
          </section>
        </div>
      </main>
    </div>
  );
};
