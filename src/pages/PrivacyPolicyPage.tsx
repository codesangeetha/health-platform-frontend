import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

export const PrivacyPolicyPage = () => {
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
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </nav>
        </div>
      </header>

      {/* Privacy Policy Content */}
      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-section__header">
            <h1>Privacy Policy</h1>
            <p className="hc-muted">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="hc-muted">
              <small>Last updated: November 22, 2025</small>
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>1. Introduction</h2>
              <p>
                HealthCare+ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our healthcare 
                platform and services.
              </p>
              <p>
                By accessing or using our services, you agree to the collection and use of information in accordance 
                with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Personal Information</h3>
              <p>We may collect personal information that you provide directly to us, including:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Identity Data:</strong> Name, date of birth, gender, profile picture</li>
                <li><strong>Contact Data:</strong> Email address, phone number, postal address</li>
                <li><strong>Medical Data:</strong> Medical history, current health conditions, medications, allergies</li>
                <li><strong>Appointment Data:</strong> Appointment preferences, scheduling information</li>
                <li><strong>Authentication Data:</strong> Login credentials, account information</li>
              </ul>

              <h3>2.2 Health Information</h3>
              <p>As a healthcare platform, we may collect and process:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Medical records and health history</li>
                <li>Prescription information</li>
                <li>Lab test results</li>
                <li>Treatment plans and progress notes</li>
                <li>Video consultation recordings (with consent)</li>
              </ul>

              <h3>2.3 Automatically Collected Information</h3>
              <p>When you use our services, we automatically collect certain information:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Device Information:</strong> IP address, browser type, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                <li><strong>Location Data:</strong> General location (for service provision)</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              
              <h3>3.1 Service Provision</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Facilitate appointments between patients and healthcare providers</li>
                <li>Enable video consultations and telemedicine services</li>
                <li>Process prescriptions and pharmacy orders</li>
                <li>Coordinate lab tests and results sharing</li>
                <li>Provide personalized healthcare recommendations</li>
              </ul>

              <h3>3.2 Platform Improvement</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Improve our services and user experience</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Develop new features and functionalities</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h3>3.3 Communication</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Send appointment reminders and notifications</li>
                <li>Provide customer support</li>
                <li>Share important service updates</li>
                <li>Respond to inquiries and feedback</li>
              </ul>

              <h3>3.4 Legal and Compliance</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Comply with healthcare regulations (HIPAA compliance)</li>
                <li>Meet legal obligations and court orders</li>
                <li>Protect against fraud and security threats</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>4. Information Sharing and Disclosure</h2>
              
              <h3>4.1 Healthcare Providers</h3>
              <p>We share relevant medical information with healthcare providers involved in your care, including:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Your attending physicians and specialists</li>
                <li>Pharmacies for prescription fulfillment</li>
                <li>Laboratory services for test processing</li>
                <li>Other healthcare professionals in your care team</li>
              </ul>

              <h3>4.2 Service Providers</h3>
              <p>We may share information with trusted third-party service providers who assist us in:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Platform hosting and maintenance</li>
                <li>Payment processing</li>
                <li>Video conferencing services</li>
                <li>Analytics and marketing</li>
                <li>Cloud storage and backup</li>
              </ul>

              <h3>4.3 Legal Requirements</h3>
              <p>We may disclose your information when required by law or to:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Comply with legal processes and court orders</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate potential violations of our terms</li>
                <li>Prevent fraud or security breaches</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>5. Data Security</h2>
              <p>We implement comprehensive security measures to protect your information:</p>
              
              <h3>5.1 Technical Safeguards</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Encryption:</strong> End-to-end encryption for all sensitive data transmission</li>
                <li><strong>Secure Storage:</strong> Encrypted databases with access controls</li>
                <li><strong>Authentication:</strong> Multi-factor authentication for user accounts</li>
                <li><strong>Network Security:</strong> Firewalls and intrusion detection systems</li>
              </ul>

              <h3>5.2 Administrative Safeguards</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Access Controls:</strong> Role-based access to patient information</li>
                <li><strong>Staff Training:</strong> Regular privacy and security training for employees</li>
                <li><strong>Audit Trails:</strong> Comprehensive logging of data access and modifications</li>
                <li><strong>Background Checks:</strong> Screening for personnel with data access</li>
              </ul>

              <h3>5.3 Physical Safeguards</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Secure data centers with restricted access</li>
                <li>Environmental controls and monitoring</li>
                <li>Device security and remote access policies</li>
              </ul>

              <p><strong>Important:</strong> While we implement robust security measures, no method of transmission 
              over the internet is 100% secure. We encourage users to keep their login credentials confidential.</p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>6. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              
              <h3>6.1 Access and Portability</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Request access to your personal and medical information</li>
                <li>Obtain copies of your data in a portable format</li>
                <li>Review how your information is being used</li>
              </ul>

              <h3>6.2 Correction and Updates</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Request correction of inaccurate information</li>
                <li>Update your personal and contact details</li>
                <li>Modify your communication preferences</li>
              </ul>

              <h3>6.3 Deletion and Restriction</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Request deletion of your account and associated data</li>
                <li>Restrict processing of your information in certain circumstances</li>
                <li>Withdraw consent for data processing where applicable</li>
              </ul>

              <h3>6.4 Communication Preferences</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Opt out of non-essential communications</li>
                <li>Manage notification settings</li>
                <li>Control marketing communications</li>
              </ul>

              <p>To exercise these rights, please contact us using the information provided in Section 10.</p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to enhance your experience on our platform:</p>
              
              <h3>7.1 Types of Cookies</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us analyze usage and improve performance</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Targeting Cookies:</strong> Used for personalized content and recommendations</li>
              </ul>

              <h3>7.2 Managing Cookies</h3>
              <p>You can control cookies through your browser settings. However, disabling certain cookies 
              may limit platform functionality. We provide cookie preference management tools within your account settings.</p>

              <h3>7.3 Third-Party Analytics</h3>
              <p>We use third-party analytics services (e.g., Google Analytics) to understand how users 
              interact with our platform. These services may collect information about your visits to other websites.</p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>8. Data Retention</h2>
              <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
              
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period thereafter</li>
                <li><strong>Medical Records:</strong> Retained in accordance with healthcare regulations and legal requirements</li>
                <li><strong>Transaction Data:</strong> Retained for financial record-keeping purposes</li>
                <li><strong>Communication Logs:</strong> Retained for customer service and quality assurance</li>
              </ul>

              <p>When we no longer need your information, we securely delete or anonymize it in accordance with our data retention policies.</p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>9. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers, including:</p>
              
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Adequacy decisions where applicable</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Other lawful transfer mechanisms</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>10. Children's Privacy</h2>
              <p>Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have collected 
              personal information from a child under 13, we will take steps to delete such information promptly.</p>
              
              <p>For children between 13-18, we require parental consent before collecting personal information.</p>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>11. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices 
              or applicable laws. When we make material changes:</p>
              
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>We will notify you via email or prominent platform notice</li>
                <li>We will update the "Last updated" date at the top of this policy</li>
                <li>Your continued use of our services constitutes acceptance of the updated policy</li>
              </ul>
            </div>

            <div className="hc-card" style={{ marginBottom: '2rem' }}>
              <h2>12. Contact Information</h2>
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <p><strong>HealthCare+ Privacy Team</strong></p>
                <p>📧 Email: privacy@healthcareplus.com</p>
                <p>📞 Phone: 1-800-HEALTH-CARE (1-800-432-5842)</p>
                <p>📍 Address: 123 Healthcare Avenue, Medical District, HC 12345</p>
                <p>🕒 Response Time: We aim to respond within 48 hours</p>
              </div>

              <p style={{ marginTop: '1rem' }}>
                For data protection inquiries, you may also contact our Data Protection Officer at: dpo@healthcareplus.com
              </p>
            </div>

            <div className="hc-card">
              <h2>13. Compliance and Certifications</h2>
              <p>We are committed to maintaining the highest standards of privacy protection and compliance:</p>
              
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>HIPAA Compliance:</strong> Compliant with Health Insurance Portability and Accountability Act</li>
                <li><strong>SOC 2 Type II:</strong> Audited for security, availability, and confidentiality</li>
                <li><strong>ISO 27001:</strong> Information security management certification</li>
                <li><strong>GDPR Compliance:</strong> Compliant with European data protection regulations</li>
                <li><strong>Regular Audits:</strong> Conducted by independent third-party security firms</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/contact" className="hc-btn hc-btn--primary">
              Contact Us
            </Link>
            <Link to="/about" className="hc-btn hc-btn--secondary" style={{ marginLeft: '1rem' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hc-footer" role="contentinfo">
        <div className="hc-container">
          <div className="hc-footer__top">
            <div>
              <div className="hc-logo" aria-label="HealthCare+">
                <span className="hc-logo__mark">+</span>
                <span>HealthCare+</span>
              </div>
              <p className="hc-muted" style={{ marginTop: '1rem' }}>
                Your trusted partner in comprehensive healthcare services.
              </p>
            </div>
            <div>
              <h4>About Us</h4>
              <ul>
                <li><Link to="/about">Company</Link></li>
                <li><Link to="/about">Careers</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><Link to="/services">Appointment</Link></li>
                <li><Link to="/services">Medicines</Link></li>
                <li><Link to="/services">Lab Packages</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><Link to="/contact">Email</Link></li>
                <li><Link to="/contact">Phone</Link></li>
                <li><Link to="/contact">Socials</Link></li>
              </ul>
            </div>
          </div>
          <div className="hc-footer__bottom">© 2025 HealthCare+. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};