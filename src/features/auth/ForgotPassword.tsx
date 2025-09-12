
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/landing-page.css';
import '../../styles/components/patient-login.styles.css';

export const ForgotPassword = () => {
  const { forgotPassword, authState } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const validateEmail = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    // Basic RFC 5322-ish email check; aligns with typical frontend validation.
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(trimmed)) return 'Enter a valid email address.';
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setEmail(next);
    setSuccessMessage('');
    // Live-validate after first blur to reduce noise while typing.
    if (emailTouched) {
      setEmailError(validateEmail(next));
    }
  };

  const handleEmailBlur = () => {
    if (!emailTouched) setEmailTouched(true);
    setEmailError(validateEmail(email));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    //validate before submit
    const err = validateEmail(email);
    setEmailTouched(true);
    setEmailError(err);
    if (err) return;

    try {
      setSubmitting(true);
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMessage(
          res.message ||
          'If your email address is in our database, you will receive a password reset link shortly.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

 
  return (
    <div>
      {/* Header: same structure/styles as Landing Page */}
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

      {/* Page Content */}
      <main className="pl-page">
        <div className="pl-auth">
          <section className="pl-card" aria-labelledby="forgot-password-title">
            <div className="pl-card__icon" aria-hidden="true">🔒</div>
            <h1 id="forgot-password-title" className="pl-card__title">Forgot Password</h1>
            <p className="pl-card__subtitle">Enter your email to receive a password reset link.</p>

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
                    className="pl-input"
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="Enter your email"
                    autoComplete="username"
                    aria-invalid={emailTouched && !!emailError}
                    aria-describedby={emailError ? 'email-error' : undefined}
                  />
                </div>
                {emailTouched && emailError && (
                  <div id="email-error" className="error-message" style={{ color: '#dc2626' }}>
                    {emailError}
              </div>
                )}
                </div>

              {authState.error && (
                <div className="error-message" style={{ color: '#dc2626' }}>{authState.error}</div>
              )}
              {successMessage && (
                <div className="success-message" style={{ color: '#065f46' }}>{successMessage}</div>
              )}

              <button type="submit" className="pl-btn pl-btn--primary" disabled={submitting || authState.isLoading}>
                {submitting || authState.isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <div className="pl-divider"><span>or</span></div>

              <Link to="/patient/login" className="pl-btn pl-btn--secondary" role="button">Back to Login</Link>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};
