/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { createDoctor, type CreateDoctorPayload } from '../../../../services/admin/doctors.service';
import { ApiError } from '../../../../services/auth/auth.service';

const Backdrop = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  width: 720px;
  max-width: calc(100% - 32px);
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 16px;
  background: #F8F9FA;
`;

const Content = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  background: #fff;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 13px;
  color: #444;
  gap: 6px;
`;

const ErrorBox = styled.div`
  background: #ffeff0;
  color: #b00020;
  border: 1px solid #ffcbd0;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
`;

const ErrorText = styled.div`
  color: #b00020;
  font-size: 12px;
`;

const SuccessBox = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
`;

const SuccessText = styled.div`
  color: #2e7d32;
  font-size: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid ${({ variant }) => (variant === 'secondary' ? '#ccc' : '#4A90E2')};
  background: ${({ variant }) => (variant === 'secondary' ? '#fff' : '#4A90E2')};
  color: ${({ variant }) => (variant === 'secondary' ? '#333' : '#fff')};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ variant }) => (variant === 'secondary' ? '#f5f5f5' : '#3a78c3')};
    border-color: ${({ variant }) => (variant === 'secondary' ? '#bbb' : '#3a78c3')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export function CreateDoctorModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void; }) {
  const [form, setForm] = useState<CreateDoctorPayload & { confirmPassword?: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    dateOfBirth: '',
    specialization: '',
    qualification: '',
    hospital: '',
    licenseNumber: '',
    experience: '',
    consultationFee: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const todayStr = new Date().toISOString().slice(0, 10);

  const setField = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors(prev => {
        const { [key as string]: _omit, ...rest } = prev;
        return rest;
      });
    }
    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  // ---------- Validation helpers ----------
  const validateEmail = (v: string) => {
    const s = v.trim();
    if (!s) return 'Email is required.';
    const emailRe = /.+@.+\..+/;
    if (!emailRe.test(s)) return 'Enter a valid email address.';
    return undefined;
  };

  const validatePassword = (v: string) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return undefined;
  };

  const validateConfirmPassword = (v: string, password: string) => {
    if (!v) return 'Please confirm your password.';
    if (v !== password) return 'Passwords do not match.';
    return undefined;
  };

  const validateFirstName = (v: string) => {
    const s = v.trim();
    if (!s) return 'First name is required.';
    if (/\d/.test(s)) return 'First name cannot contain numbers.';
    return undefined;
  };

  const validateLastName = (v: string) => {
    const s = v.trim();
    if (!s) return 'Last name is required.';
    if (/\d/.test(s)) return 'Last name cannot contain numbers.';
    return undefined;
  };

  const validatePhone = (v: string) => {
    const s = v.trim();
    if (!s) return 'Phone number is required.';
    const phoneRe = /^\d{10}$/;
    if (!phoneRe.test(s)) return 'Enter a valid 10-digit phone number.';
    return undefined;
  };

  const validateWhatsapp = (v: string) => {
    const s = v.trim();
    if (!s) return 'WhatsApp number is required.';
    const whatsappRe = /^\d{10}$/;
    if (!whatsappRe.test(s)) return 'Enter a valid 10-digit WhatsApp number.';
    return undefined;
  };

  const validateDOB = (v: string) => {
    if (!v) return 'Date of birth is required.';
    if (v > todayStr) return 'Date of birth cannot be in the future.';
    return undefined;
  };

  const validateSpecialization = (v: string) => {
    const s = v.trim();
    if (!s) return 'Specialization is required.';
    return undefined;
  };

  const validateQualification = (v: string) => {
    const s = v.trim();
    if (!s) return 'Qualification is required.';
    if (/\d/.test(s)) return 'Qualification cannot contain numbers.';
    return undefined;
  };

  const validateHospital = (v: string) => {
    const s = v.trim();
    if (!s) return 'Hospital is required.';
    if (/\d/.test(s)) return 'Hospital name cannot contain numbers.';
    return undefined;
  };

  const validateLicenseNumber = (v: string) => {
    const s = v.trim();
    if (!s) return 'License number is required.';
    if (!/^[A-Za-z0-9]+$/.test(s)) return 'License number can only contain letters and numbers.';
    return undefined;
  };

  const validateExperience = (v: string) => {
    if (!v) return 'Experience is required.';
    if (isNaN(Number(v))) return 'Experience must be a number.';
    if (Number(v) < 0) return 'Experience cannot be negative.';
    return undefined;
  };

  const validateConsultationFee = (v: string) => {
    if (!v) return 'Consultation fee is required.';
    if (isNaN(Number(v))) return 'Consultation fee must be a number.';
    if (Number(v) < 0) return 'Consultation fee cannot be negative.';
    return undefined;
  };

  const validateField = (name: keyof typeof form, value: string): string | undefined => {
    switch (name) {
      case 'email': return validateEmail(value);
      case 'password': return validatePassword(value);
      case 'confirmPassword': return validateConfirmPassword(value, form.password);
      case 'firstName': return validateFirstName(value);
      case 'lastName': return validateLastName(value);
      case 'phone': return validatePhone(value);
      case 'whatsapp': return validateWhatsapp(value);
      case 'dateOfBirth': return validateDOB(value);
      case 'specialization': return validateSpecialization(value);
      case 'qualification': return validateQualification(value);
      case 'hospital': return validateHospital(value);
      case 'licenseNumber': return validateLicenseNumber(value);
      case 'experience': return validateExperience(value);
      case 'consultationFee': return validateConsultationFee(value);
      default: return undefined;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      email: validateEmail(form.email) || '',
      password: validatePassword(form.password) || '',
      confirmPassword: validateConfirmPassword(form.confirmPassword || '', form.password) || '',
      firstName: validateFirstName(form.firstName) || '',
      lastName: validateLastName(form.lastName) || '',
      phone: validatePhone(form.phone) || '',
      whatsapp: validateWhatsapp(form.whatsapp || '') || '',
      dateOfBirth: validateDOB(form.dateOfBirth) || '',
      specialization: validateSpecialization(form.specialization) || '',
      qualification: validateQualification(form.qualification || '') || '',
      hospital: validateHospital(form.hospital || '') || '',
      licenseNumber: validateLicenseNumber(form.licenseNumber || '') || '',
      experience: validateExperience(form.experience?.toString() || '') || '',
      consultationFee: validateConsultationFee(form.consultationFee?.toString() || '') || '',
    };

    setFieldErrors(errors);
    return Object.values(errors).every((m) => !m);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const emailRe = /.+@.+\..+/;
    if (!form.email) errors.email = 'Email is required';
    else if (!emailRe.test(form.email)) errors.email = 'Enter a valid email';

    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (!form.firstName) errors.firstName = 'First name is required';
    if (!form.lastName) errors.lastName = 'Last name is required';

    const phoneRe = /^[0-9+][0-9\s\-()]{6,14}$/;
    if (!form.phone) errors.phone = 'Phone is required';
    else if (!phoneRe.test(form.phone)) errors.phone = 'Enter a valid phone number';

    if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    else if (form.dateOfBirth > todayStr) errors.dateOfBirth = 'Date of birth cannot be in the future';

    if (!form.specialization) errors.specialization = 'Specialization is required';

    if (form.experience !== '' && Number(form.experience) < 0) errors.experience = 'Experience cannot be negative';
    if (typeof form.consultationFee === 'number' && form.consultationFee < 0) errors.consultationFee = 'Consultation fee cannot be negative';

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const key = name as keyof typeof form;
    if (touched[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validateField(key, value) || '' }));
    }

    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof typeof form;
    setTouched((t) => ({ ...t, [key]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [key]: validateField(key, value) || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isValid = validateForm();
    if (!isValid) {
      // Mark all as touched so errors are visible
      setTouched({
        email: true,
        password: true,
        confirmPassword: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsapp: true,
        dateOfBirth: true,
        specialization: true,
        qualification: true,
        hospital: true,
        licenseNumber: true,
        experience: true,
        consultationFee: true,
      });
      setError('Please fix the highlighted fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateDoctorPayload = {
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp?.trim() || undefined,
        dateOfBirth: form.dateOfBirth, // YYYY-MM-DD
        specialization: form.specialization.trim(),
        qualification: form.qualification?.trim() || undefined,
        hospital: form.hospital?.trim() || undefined,
        licenseNumber: form.licenseNumber?.trim() || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
      };

      await createDoctor(payload);

      // Clear form on successful submission
      setForm({
        email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', whatsapp: '', dateOfBirth: '', specialization: '', qualification: '', hospital: '', licenseNumber: '', experience: '', consultationFee: undefined,
      });
      setFieldErrors({});
      setTouched({});
      setSuccess('Doctor created successfully!');

      // Keep modal open for 2 seconds to show success message, then close
      setTimeout(() => {
        onCreated();
      }, 2000);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to create doctor');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setForm({
      email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', whatsapp: '', dateOfBirth: '', specialization: '', qualification: '', hospital: '', licenseNumber: '', experience: '', consultationFee: undefined,
    });
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Backdrop open={open}>
      <Modal role="dialog" aria-modal="true" aria-label="Create Doctor">
        <Header>Create Doctor</Header>
        <Form onSubmit={handleSubmit}>
          <Content>
            {error && <ErrorBox>{error}</ErrorBox>}
            <InputRow>
              <Label>
                First Name*
                <Input
                  aria-invalid={!!fieldErrors.firstName}
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="firstName"
                />
                {fieldErrors.firstName && <ErrorText>{fieldErrors.firstName}</ErrorText>}
              </Label>
              <Label>
                Last Name*
                <Input
                  aria-invalid={!!fieldErrors.lastName}
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="lastName"
                />
                {fieldErrors.lastName && <ErrorText>{fieldErrors.lastName}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Email*
                <Input
                  type="email"
                  aria-invalid={!!fieldErrors.email}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="email"
                  placeholder="doctor@example.com"
                />
                {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
              </Label>
              <Label>
                Password*
                <Input
                  type="password"
                  aria-invalid={!!fieldErrors.password}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="password"
                  placeholder="••••••••"
                />
                {fieldErrors.password && <ErrorText>{fieldErrors.password}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Confirm Password*
                <Input
                  type="password"
                  aria-invalid={!!fieldErrors.confirmPassword}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="confirmPassword"
                  placeholder="••••••••"
                />
                {fieldErrors.confirmPassword && <ErrorText>{fieldErrors.confirmPassword}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Phone*
                <Input
                  aria-invalid={!!fieldErrors.phone}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="phone"
                  pattern="^\d{10}$"
                  title="Enter a valid 10-digit phone number"
                />
                {fieldErrors.phone && <ErrorText>{fieldErrors.phone}</ErrorText>}
              </Label>
              <Label>
                WhatsApp*
                <Input
                  aria-invalid={!!fieldErrors.whatsapp}
                  value={form.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="whatsapp"
                  pattern="^\d{10}$"
                  title="Enter a valid 10-digit WhatsApp number"
                  placeholder="Enter WhatsApp number"
                />
                {fieldErrors.whatsapp && <ErrorText>{fieldErrors.whatsapp}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Date of Birth* (YYYY-MM-DD)
                <Input
                  type="date"
                  aria-invalid={!!fieldErrors.dateOfBirth}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="dateOfBirth"
                  max={todayStr}
                />
                {fieldErrors.dateOfBirth && <ErrorText>{fieldErrors.dateOfBirth}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Specialization*
                <Input
                  aria-invalid={!!fieldErrors.specialization}
                  value={form.specialization}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="specialization"
                  placeholder="Cardiology"
                />
                {fieldErrors.specialization && <ErrorText>{fieldErrors.specialization}</ErrorText>}
              </Label>
              <Label>
                Qualification*
                <Input
                  aria-invalid={!!fieldErrors.qualification}
                  value={form.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="qualification"
                  placeholder="MBBS, MD"
                />
                {fieldErrors.qualification && <ErrorText>{fieldErrors.qualification}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Hospital*
                <Input
                  aria-invalid={!!fieldErrors.hospital}
                  value={form.hospital}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="hospital"
                  placeholder="General Hospital"
                />
                {fieldErrors.hospital && <ErrorText>{fieldErrors.hospital}</ErrorText>}
              </Label>
              <Label>
                License Number*
                <Input
                  aria-invalid={!!fieldErrors.licenseNumber}
                  value={form.licenseNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="licenseNumber"
                  placeholder="MD123456"
                />
                {fieldErrors.licenseNumber && <ErrorText>{fieldErrors.licenseNumber}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Experience (years)*
                <Input
                  type="number"
                  min={0}
                  step={1}
                  aria-invalid={!!fieldErrors.experience}
                  value={form.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="experience"
                />
                {fieldErrors.experience && <ErrorText>{fieldErrors.experience}</ErrorText>}
              </Label>
              <Label>
                Consultation Fee*
                <Input
                  type="number"
                  min={0}
                  step={1}
                  aria-invalid={!!fieldErrors.consultationFee}
                  value={form.consultationFee ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="consultationFee"
                />
                {fieldErrors.consultationFee && <ErrorText>{fieldErrors.consultationFee}</ErrorText>}
              </Label>
            </InputRow>
          </Content>
          <Actions>
            {success && <SuccessBox>{success}</SuccessBox>}
            <Button type="button" variant="secondary" onClick={resetAndClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Doctor'}</Button>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  );
}
