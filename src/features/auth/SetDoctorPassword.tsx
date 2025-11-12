import { useState, useContext, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/landing-page.css';
import '../../styles/components/patient-login.styles.css';

export const SetDoctorPassword = () => {
  const { doctorPasswordSet, authState } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Touched state
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Field errors
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Password validation 
  const validateNewPassword = (value: string): string | null => {
    const v = value || '';
    if (!v.trim()) return 'New password is required.';
    // At least 8 chars, 1 upper, 1 lower, 1 number, 1 special
    const lengthOk = v.length >= 8;
    /* const upperOk = /[A-Z]/.test(v);
    const lowerOk = /[a-z]/.test(v);
    const numberOk = /\d/.test(v);
    const specialOk = /[^A-Za-z0-9]/.test(v); */
    if (!lengthOk /* || !upperOk || !lowerOk || !numberOk || !specialOk */) {
      return 'Password must be 8 characters ';
    }
    return null;
  };

  const validateConfirmPassword = (value: string, base: string): string | null => {
    const v = value || '';
    if (!v.trim()) return 'Please confirm your new password.';
    if (v !== base) return 'Passwords do not match.';
    return null;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setNewPassword(next);
    setLocalError('');
    setSuccessMessage('');

    if (newPasswordTouched) {
      setNewPasswordError(validateNewPassword(next));
    }
    // Re-validate confirm field live because it depends on newPassword
    if (confirmPasswordTouched) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, next));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setConfirmPassword(next);
    setLocalError('');
    setSuccessMessage('');

    if (confirmPasswordTouched) {
      setConfirmPasswordError(validateConfirmPassword(next, newPassword));
    }
  };

  const handleNewPasswordBlur = () => {
    if (!newPasswordTouched) setNewPasswordTouched(true);
    setNewPasswordError(validateNewPassword(newPassword));
  };

  const handleConfirmPasswordBlur = () => {
    if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
    setConfirmPasswordError(validateConfirmPassword(confirmPassword, newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!token) {
      setLocalError('Invalid or missing setup token');
      return;
    }
    /*  if (!newPassword || !confirmPassword) {
       setLocalError('Please enter and confirm your new password');
       return;
     }
     if (newPassword !== confirmPassword) {
       setLocalError('Passwords do not match');
       return;
     }
  */
    // Validate fields before submit
    const pwErr = validateNewPassword(newPassword);
    const confErr = validateConfirmPassword(confirmPassword, newPassword);
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setNewPasswordError(pwErr);
    setConfirmPasswordError(confErr);
    if (pwErr || confErr) return;

    try {
      setSubmitting(true);
      const res = await doctorPasswordSet(token, newPassword, confirmPassword);
      if (res.success) {
        setSuccessMessage(res.message || 'Doctor password set up successful. You can now log in to your doctor portal.');
        // Redirect to doctor login after successful password setup
        setTimeout(() => {
          navigate('/doctor/login');
        }, 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };
  /*  const isFormValid =
     !!token &&
     !validateNewPassword(newPassword) &&
     !validateConfirmPassword(confirmPassword, newPassword); */

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
            <a href="#services">Services</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="pl-page">
        <div className="pl-auth">
          <section className="pl-card" aria-labelledby="set-doctor-password-title">
            <div className="pl-card__icon" aria-hidden="true">🔑</div>
            <h1 id="set-doctor-password-title" className="pl-card__title">Set Doctor Password</h1>
            <p className="pl-card__subtitle">Enter and confirm your password to complete your doctor account setup.</p>

            <form className="pl-form" onSubmit={handleSubmit}>
              <div className="pl-form-group">
                <label htmlFor="newPassword">Password</label>
                <div className="pl-input-wrapper">
                  <span className="pl-input-icon" aria-hidden="true">
                    {/* lock icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    className="pl-input"
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    onBlur={handleNewPasswordBlur}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    aria-invalid={newPasswordTouched && !!newPasswordError}
                    aria-describedby={newPasswordError ? 'newPassword-error' : undefined}
                  />
                </div>
                {newPasswordTouched && newPasswordError && (
                  <div id="newPassword-error" className="error-message" style={{ color: '#dc2626' }}>
                    {newPasswordError}
                  </div>
                )}
              </div>

              <div className="pl-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="pl-input-wrapper">
                  <span className="pl-input-icon" aria-hidden="true">
                    {/* lock icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    className="pl-input"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={handleConfirmPasswordBlur}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    aria-invalid={confirmPasswordTouched && !!confirmPasswordError}
                    aria-describedby={confirmPasswordError ? 'confirmPassword-error' : undefined}
                  />
                </div>
                {confirmPasswordTouched && confirmPasswordError && (
                  <div id="confirmPassword-error" className="error-message" style={{ color: '#dc2626' }}>
                    {confirmPasswordError}
                  </div>
                )}
              </div>

              {localError && (
                <div className="error-message" style={{ color: '#dc2626' }}>{localError}</div>
              )}
              {authState.error && (
                <div className="error-message" style={{ color: '#dc2626' }}>{authState.error}</div>
              )}
              {successMessage && (
                <div className="success-message" style={{ color: '#065f46' }}>{successMessage}</div>
              )}

              <button type="submit" className="pl-btn pl-btn--primary" disabled={submitting || authState.isLoading}>
                {submitting || authState.isLoading ? 'Setting up…' : 'Set Password'}
              </button>

              <div className="pl-divider"><span>or</span></div>

              <Link to="/doctor/login" className="pl-btn pl-btn--secondary" role="button">Back to Doctor Login</Link>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};