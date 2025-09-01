import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/components/shared.styles.css';

interface PatientRegisterData {
  userType: 'patient';
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // ISO date YYYY-MM-DD
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const PatientRegister = () => {
  const navigate = useNavigate();
  const { register, authState } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [form, setForm] = useState<PatientRegisterData>({
    userType: 'patient',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: [],
    chronicDiseases: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [diseaseInput, setDiseaseInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as any));
  };

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }));
  };

  const addAllergy = () => {
    const v = allergyInput.trim();
    if (v) setForm(prev => ({ ...prev, allergies: [...prev.allergies, v] }));
    setAllergyInput('');
  };

  const removeAllergy = (idx: number) => {
    setForm(prev => ({ ...prev, allergies: prev.allergies.filter((_, i) => i !== idx) }));
  };

  const addDisease = () => {
    const v = diseaseInput.trim();
    if (v) setForm(prev => ({ ...prev, chronicDiseases: [...prev.chronicDiseases, v] }));
    setDiseaseInput('');
  };

  const removeDisease = (idx: number) => {
    setForm(prev => ({ ...prev, chronicDiseases: prev.chronicDiseases.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    const res = await register(form as unknown as any);
    if (res.success) {
      setSuccessMessage('Registration successful. Please try logging in.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Patient Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <input id="bloodGroup" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Allergies</label>
            <div className="chip-input">
              <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="Add an allergy" />
              <button type="button" className="secondary-button" onClick={addAllergy}>Add</button>
            </div>
            <div className="chip-list">
              {form.allergies.map((a, i) => (
                <span className="chip" key={i}>
                  {a}
                  <button type="button" onClick={() => removeAllergy(i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Chronic Diseases</label>
            <div className="chip-input">
              <input value={diseaseInput} onChange={e => setDiseaseInput(e.target.value)} placeholder="Add a disease" />
              <button type="button" className="secondary-button" onClick={addDisease}>Add</button>
            </div>
            <div className="chip-list">
              {form.chronicDiseases.map((d, i) => (
                <span className="chip" key={i}>
                  {d}
                  <button type="button" onClick={() => removeDisease(i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <fieldset className="form-group">
            <legend>Emergency Contact</legend>
            <div className="form-group">
              <label htmlFor="ec-name">Name</label>
              <input id="ec-name" name="name" value={form.emergencyContact.name} onChange={handleEmergencyChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ec-relationship">Relationship</label>
              <input id="ec-relationship" name="relationship" value={form.emergencyContact.relationship} onChange={handleEmergencyChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ec-phone">Phone</label>
              <input id="ec-phone" name="phone" value={form.emergencyContact.phone} onChange={handleEmergencyChange} required />
            </div>
          </fieldset>

          {authState.error && <div className="error-message">{authState.error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          <button type="submit" className="submit-button" disabled={authState.isLoading}>
            {authState.isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/patient/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
