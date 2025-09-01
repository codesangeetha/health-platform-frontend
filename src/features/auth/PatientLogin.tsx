import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import '../../styles/components/shared.styles.css';

export const PatientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      navigate('/patient/dashboard');
    }
  }, [authState.isAuthenticated, authState.isLoading, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Patient Login</h2>
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
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
        </form>
        <div className="auth-links">
          <a href="/patient/register">New patient? Register here</a>
          <a href="/patient/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};
