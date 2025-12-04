import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/landing-page.css';
import docImg from '../assets/doctor.jpg';
import docProImg1 from '../assets/drProfile-1.jpg';
import docProImg2 from '../assets/drProfile2.avif';
import docProImg3 from '../assets/fm-dr-profile1.avif';
import patientPro1 from '../assets/patientProfile1.jpeg';
import patientPro2 from '../assets/patientProfile2.webp';
import patientPro3 from '../assets/patientProfile3.jpg';
import { ScrollAware, DeviceAware, DataRenderer } from '../components/render-props';

export const LandingPage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Mock services for dynamic data
  const doctorsService = {
    getData: async () => [
      {
        id: 1,
        name: 'Dr. Antony',
        specialization: 'Specialist',
        image: docProImg1,
        rating: 4.8,
        experience: '10 years'
      },
      {
        id: 2,
        name: 'Dr. Alex Morgan',
        specialization: 'Cardiologist',
        image: docProImg2,
        rating: 4.9,
        experience: '15 years'
      },
      {
        id: 3,
        name: 'Dr. Priya Singh',
        specialization: 'Neurologist',
        image: docProImg3,
        rating: 4.7,
        experience: '12 years'
      }
    ]
  };

  const testimonialsService = {
    getData: async () => [
      {
        id: 1,
        name: 'Sophia',
        image: patientPro1,
        quote: 'A brief, two to three line quote about their experience.',
        rating: 5
      },
      {
        id: 2,
        name: 'Rahul Mehta',
        image: patientPro2,
        quote: 'Booking an appointment was seamless and the doctors are top-notch!',
        rating: 5
      },
      {
        id: 3,
        name: 'James',
        image: patientPro3,
        quote: 'Loved the telemedicine feature. Quick consultation without travel.',
        rating: 5
      }
    ]
  };

  return (
    <DeviceAware>
      {device => (
        <ScrollAware threshold={8}>
          {scrolled => (
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
                    <Link to="/services">Services</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
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

              {/* Featured Doctors with DataRenderer */}
              <section className="hc-section">
                <div className="hc-container">
                  <div className="hc-section__header">
                    <h2>Featured Doctors</h2>
                  </div>
                  <DataRenderer service={doctorsService}>
                    {({ data, loading, error }) => {
                      if (loading) {
                        return (
                          <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div>Loading doctors...</div>
                          </div>
                        );
                      }

                      if (error) {
                        return (
                          <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                            <p>Error loading doctors: {error}</p>
                            <button onClick={() => window.location.reload()} className="hc-btn hc-btn--primary">
                              Retry
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="hc-card-grid">
                          {data?.slice(0, device === 'mobile' ? 2 : 3).map((doctor: any) => (
                            <article className="hc-card" key={doctor.id}>
                              <div className="hc-card__row">
                                <div className="hc-profile" role="img" aria-label={`Profile picture of ${doctor.name}`}>
                                  <img src={doctor.image} alt={`${doctor.name} profile`} />
                                </div>
                                <div>
                                  <h3>{doctor.name}</h3>
                                  <p className="hc-muted">{doctor.specialization}</p>
                                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <span>⭐ {doctor.rating}</span>
                                    <span className="hc-muted">{doctor.experience}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="hc-card__actions">
                                <Link to="/patient/login" className="hc-btn hc-btn--primary">Book Appointment</Link>
                              </div>
                            </article>
                          ))}
                        </div>
                      );
                    }}
                  </DataRenderer>
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

              {/* Testimonials with DataRenderer */}
              <section className="hc-section hc-testimonials" aria-labelledby="testimonials-heading">
                <div className="hc-container">
                  <div className="hc-section__header">
                    <h2 id="testimonials-heading">What Our Patients Say</h2>
                  </div>
                  <DataRenderer service={testimonialsService}>
                    {({ data, loading, error }) => {
                      if (loading) {
                        return (
                          <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div>Loading testimonials...</div>
                          </div>
                        );
                      }

                      if (error) {
                        return (
                          <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                            <p>Error loading testimonials: {error}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="hc-card-grid">
                          {data?.slice(0, device === 'mobile' ? 2 : 3).map((testimonial: any) => (
                            <article className="hc-card" key={testimonial.id}>
                              <div className="hc-card__row">
                                <div className="hc-profile" role="img" aria-label={`Profile picture of ${testimonial.name}`}>
                                  <img src={testimonial.image} alt={`${testimonial.name} profile`} />
                                </div>
                                <div>
                                  <h3>{testimonial.name}</h3>
                                  <div style={{ display: 'flex', gap: '2px', margin: '5px 0' }}>
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                      <span key={i} style={{ color: '#ffc107' }}>⭐</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="hc-quote">"{testimonial.quote}"</p>
                            </article>
                          ))}
                        </div>
                      );
                    }}
                  </DataRenderer>
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
                <li><Link to="/privacy">Privacy Policy</Link></li>
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
          )}
        </ScrollAware>
      )}
    </DeviceAware>
  );
};
