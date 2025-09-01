import { Link } from 'react-router-dom';
import '../styles/global.css';

export const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Welcome to Health Platform</h1>
        <p>Your trusted healthcare companion</p>
        
        <div className="login-options">
          <Link to="/patient/login" className="login-card">
            <h2>Patient Portal</h2>
            <p>Access your health records, book appointments, and more</p>
            <button className="login-button">Login as Patient</button>
          </Link>
          
          <Link to="/doctor/login" className="login-card">
            <h2>Doctor Portal</h2>
            <p>Manage your schedule, patient records, and consultations</p>
            <button className="login-button">Login as Doctor</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
