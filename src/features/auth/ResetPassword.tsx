import { useState, useContext, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/landing-page.css';
import '../../styles/components/patient-login.styles.css';

export const ResetPassword = () => {
  const { resetPassword, authState } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!token) {
      setLocalError('Invalid or missing reset token');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setLocalError('Please enter and confirm your new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const res = await resetPassword(token, newPassword, confirmPassword);
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset successful. You can now log in.');
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
          <div className="hc-header__actions">
            <Link to="/patient/login" className="hc-btn hc-btn--text">Log In</Link>
            <Link to="/patient/register" className="hc-btn hc-btn--primary">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pl-page">
        <div className="pl-auth">
          <section className="pl-card" aria-labelledby="reset-password-title">
            <div className="pl-card__icon" aria-hidden="true">🔑</div>
            <h1 id="reset-password-title" className="pl-card__title">Reset Password</h1>
            <p className="pl-card__subtitle">Enter and confirm your new password to complete the reset.</p>

            <form className="pl-form" onSubmit={handleSubmit}>
              <div className="pl-form-group">
                <label htmlFor="newPassword">New Password</label>
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
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                  />
                </div>
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                  />
                </div>
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
                {submitting || authState.isLoading ? 'Resetting…' : 'Reset Password'}
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
