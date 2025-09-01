import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <h2>Welcome {user?.firstName}!</h2>
        <p>Your comprehensive healthcare management dashboard</p>
      </section>

      <section className="features-section">
        <h3>Quick Actions</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Doctor Appointments</h4>
            <p>Book and manage your medical appointments</p>
            <button>Book Appointment</button>
          </div>
          <div className="feature-card">
            <h4>Telemedicine</h4>
            <p>Virtual consultations from the comfort of your home</p>
            <button>Start Consultation</button>
          </div>
          <div className="feature-card">
            <h4>Online Pharmacy</h4>
            <p>Order medicines with valid prescriptions</p>
            <button>Order Medicine</button>
          </div>
          <div className="feature-card">
            <h4>Lab Tests</h4>
            <p>Book tests and view reports online</p>
            <button>Book Test</button>
          </div>
        </div>
      </section>
    </div>
  );
}
