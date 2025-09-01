import { useState, useContext, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/components/shared.styles.css';

export const ResetPassword = () => {
  const { resetPassword, authState } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    const res = await resetPassword(token, newPassword, confirmPassword);
    if (res.success) {
      setSuccessMessage(res.message || 'Password reset successful. You can now log in.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {localError && <div className="error-message">{localError}</div>}
          {authState.error && <div className="error-message">{authState.error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="submit-button" disabled={authState.isLoading}>
            {authState.isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/patient/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};
