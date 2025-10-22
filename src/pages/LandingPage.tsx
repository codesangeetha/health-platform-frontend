import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';
import docImg from '../assets/doctor.jpg';
import docProImg1 from '../assets/drProfile-1.jpg';
import docProImg2 from '../assets/drProfile2.avif';
import docProImg3 from '../assets/fm-dr-profile1.avif';
import patientPro1 from '../assets/patientProfile1.jpeg';
import patientPro2 from '../assets/patientProfile2.webp';
import patientPro3 from '../assets/patientProfile3.jpg';
export const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* Header */}
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

      {/* Hero Section */}
      <section className="hc-hero">
        <div className="hc-container hc-hero__wrap">
          <div>
            <h1>Your Health, Our Priority</h1>
            <p>
              Book appointments with top doctors, order medicines, and access lab tests - all in one place.
            </p>
            <div>
              <Link to="/patient/login" className="hc-btn hc-btn--primary" aria-label="Book Appointment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M7 2v3M17 2v3M4 10h16M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Book Appointment
              </Link>
            </div>
          </div>
          <div className="hc-hero__image" role="img" aria-label="Illustration of doctors">
             <img src={docImg} alt="dr img" />
          </div>
        
        </div>
      </section>

      {/* Quick Login */}
      <section id="login" className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2>Login</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card" aria-label="Patient Login">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">👤</span>
                <div>
                  <h3>Patient Portal</h3>
                  <p className="hc-muted">Manage appointments, records, and lab tests.</p>
                </div>
              </div>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Login as Patient</Link>
              </div>
            </article>
            <article className="hc-card" aria-label="Doctor Login">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🩺</span>
                <div>
                  <h3>Doctor Portal</h3>
                  <p className="hc-muted">Manage schedules, patients, and consultations.</p>
                </div>
              </div>
              <div className="hc-card__actions">
                <Link to="/doctor/login" className="hc-btn hc-btn--primary">Login as Doctor</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Top Specializations */}
      <section id="services" className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2>Top Specializations</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card" aria-label="Cardiology">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">❤</span>
                <div>
                  <h3>Cardiology</h3>
                  <p>Heart health diagnostics and treatments.</p>
                </div>
              </div>
            </article>
            <article className="hc-card" aria-label="Neurology">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🧠</span>
                <div>
                  <h3>Neurology</h3>
                  <p>Comprehensive brain and nerve care.</p>
                </div>
              </div>
            </article>
            <article className="hc-card" aria-label="Orthopedics">
              <div className="hc-card__row">
                <span className="hc-icon-circle" aria-hidden="true">🦴</span>
                <div>
                  <h3>Orthopedics</h3>
                  <p>Bone, joint, and muscle treatments.</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2>Featured Doctors</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a doctor">
                  <img src={docProImg1} alt="drProfile1" />
                </div>
                <div>
                  <h3>Dr. Antony</h3>
                  <p className="hc-muted">Specialist</p>
                </div>
              </div>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Appointment</Link>
              </div>
            </article>
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a doctor">
                   <img src={docProImg2} alt="drProfile2" />
                  </div> 
                <div>
                  <h3>Dr. Alex Morgan</h3>
                  <p className="hc-muted">Cardiologist</p>
                </div>
              </div>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Appointment</Link>
              </div>
            </article>
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a doctor">
                  <img src={docProImg3} alt="drProfile2" />
                  </div> 
                <div>
                  <h3>Dr. Priya Singh</h3>
                  <p className="hc-muted">Neurologist</p>
                </div>
              </div>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Appointment</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Pharmacy Deals */}
      <section className="hc-section" aria-labelledby="pharmacy-heading">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2 id="pharmacy-heading">Pharmacy Deals</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card">
              <h3>Deal Title</h3>
              <p>Description of the pharmacy deal.</p>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--text">Shop Now</Link>
              </div>
            </article>
            <article className="hc-card">
              <h3>Seasonal Discount</h3>
              <p>Up to 20% off on selected medicines.</p>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--text">Shop Now</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Lab Test Packages */}
      <section className="hc-section" aria-labelledby="labtests-heading">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2 id="labtests-heading">Lab Test Packages</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card">
              <h3>Package Title</h3>
              <p>Short description of the lab test package.</p>
              <p className="hc-price">$XX</p>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Test</Link>
              </div>
            </article>
            <article className="hc-card">
              <h3>Comprehensive Health</h3>
              <p>Full-body check-up with 80+ parameters.</p>
              <p className="hc-price">$149</p>
              <div className="hc-card__actions">
                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Test</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="hc-section hc-testimonials" aria-labelledby="testimonials-heading">
        <div className="hc-container">
          <div className="hc-section__header">
            <h2 id="testimonials-heading">What Our Patients Say</h2>
          </div>
          <div className="hc-card-grid">
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a patient">
                  <img src={patientPro1} alt="patient1-pro" />
                  </div> 
                <div>
                  <h3>Sophia</h3>
                </div>
              </div>
              <p className="hc-quote">"A brief, two to three line quote about their experience."</p>
            </article>
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a patient">
                   <img src={patientPro2} alt="patient1-pro" />
                </div>
                <div>
                  <h3>Rahul Mehta</h3>
                </div>
              </div>
              <p className="hc-quote">"Booking an appointment was seamless and the doctors are top-notch!"</p>
            </article>
            <article className="hc-card">
              <div className="hc-card__row">
                <div className="hc-profile" role="img" aria-label="Profile picture of a patient" >
                   <img src={patientPro3} alt="patient1-pro" />
                </div>
                <div>
                  <h3> James</h3>
                </div>
              </div>
              <p className="hc-quote">"Loved the telemedicine feature. Quick consultation without travel."</p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="hc-footer" role="contentinfo">
        <div className="hc-container">
          <div className="hc-footer__top">
            <div>
              <div className="hc-logo" aria-label="HealthCare+">
                <span className="hc-logo__mark">+</span>
                <span>HealthCare+</span>
              </div>
              <p className="hc-muted" style={{ marginTop: '1rem' }}>
                Short description of the company.
              </p>
            </div>
            <div>
              <h4>About Us</h4>
              <ul>
                <li><a href="#">Company</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><a href="#services">Appointment</a></li>
                <li><a href="#">Medicines</a></li>
                <li><a href="#">Lab Packages</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="#contact">Email</a></li>
                <li><a href="#contact">Phone</a></li>
                <li><a href="#contact">Socials</a></li>
              </ul>
            </div>
          </div>
          <div className="hc-footer__bottom">© 2025 HealthCare+. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
