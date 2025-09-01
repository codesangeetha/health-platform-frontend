import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/components/shared.styles.css';

export const ForgotPassword = () => {
  const { forgotPassword, authState } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    const res = await forgotPassword(email);
    if (res.success) {
      setSuccessMessage(res.message || 'If your email address is in our database, you will receive a password reset link shortly.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {authState.error && <div className="error-message">{authState.error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          <button type="submit" className="submit-button" disabled={authState.isLoading}>
            {authState.isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/patient/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};
