/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { updateDoctor } from '../../../../services/admin/doctors.service';
import { getSpecializations } from '../../../../services/admin/specializations.service';
import { ApiError } from '../../../../services/auth/auth.service';
import type { Doctor } from '../../../../services/admin/doctors.service';
import type { Specialization } from '../../../../types/specialization/specialization.types';

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

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleSwitch = styled.label<{ active: boolean }>`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span<{ active: boolean }>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ active }) => (active ? '#4A90E2' : '#ccc')};
  transition: 0.4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: ${({ active }) => (active ? '26px' : '3px')};
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleText = styled.span`
  font-size: 13px;
  color: #444;
  font-weight: 500;
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

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  hospital: string;
  experience: string;
  consultationFee: string;
  isActive: boolean;
}

export function EditDoctorModal({ 
  open, 
  onClose, 
  onUpdated, 
  doctor 
}: { 
  open: boolean; 
  onClose: () => void; 
  onUpdated: () => void; 
  doctor: Doctor | null;
}) {
  const [form, setForm] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    hospital: '',
    experience: '',
    consultationFee: '',
    isActive: true,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);

  // Initialize form with doctor data when modal opens
  useEffect(() => {
    if (open && doctor) {
      setForm({
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        hospital: doctor.hospital || '',
        experience: doctor.experience?.toString() || '',
        consultationFee: doctor.consultationFee?.toString() || '',
        isActive: doctor.isActive || false,
      });
      setError(null);
      setSuccess(null);
      setFieldErrors({});
      setTouched({});
    }
  }, [open, doctor]);

  // Fetch specializations when component opens
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setSpecializationsLoading(true);
        const response = await getSpecializations({ limit: 100 }); // Fetch all specializations
        // Sort specializations alphabetically
        const sortedSpecializations = response.data.specializations.sort((a, b) => a.name.localeCompare(b.name));
        setSpecializations(sortedSpecializations);
      } catch (err) {
        console.error('Error fetching specializations:', err);
        setError('Failed to load specializations');
      } finally {
        setSpecializationsLoading(false);
      }
    };

    if (open) {
      fetchSpecializations();
    }
  }, [open]);

  const setField = (key: keyof EditFormData, value: string | boolean) => {
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

  const validateField = (name: keyof EditFormData, value: string): string | undefined => {
    switch (name) {
      case 'email': return validateEmail(value);
      case 'firstName': return validateFirstName(value);
      case 'lastName': return validateLastName(value);
      case 'phone': return validatePhone(value);
      case 'specialization': return validateSpecialization(value);
      case 'qualification': return validateQualification(value);
      case 'hospital': return validateHospital(value);
      case 'experience': return validateExperience(value);
      case 'consultationFee': return validateConsultationFee(value);
      default: return undefined;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      email: validateEmail(form.email) || '',
      firstName: validateFirstName(form.firstName) || '',
      lastName: validateLastName(form.lastName) || '',
      phone: validatePhone(form.phone) || '',
      specialization: validateSpecialization(form.specialization) || '',
      qualification: validateQualification(form.qualification) || '',
      hospital: validateHospital(form.hospital) || '',
      experience: validateExperience(form.experience) || '',
      consultationFee: validateConsultationFee(form.consultationFee) || '',
    };

    setFieldErrors(errors);
    return Object.values(errors).every((m) => !m);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setField(name as keyof EditFormData, value);

    const key = name as keyof EditFormData;
    if (touched[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validateField(key, value) || '' }));
    }

    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setField('specialization', value);
    
    const key = 'specialization';
    if (touched[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validateField(key, value) || '' }));
    }

    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setField('isActive', checked);

    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof EditFormData;
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

    if (!doctor) {
      setError('No doctor data found');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      // Mark all as touched so errors are visible
      setTouched({
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        qualification: true,
        hospital: true,
        experience: true,
        consultationFee: true,
      });
      setError('Please fix the highlighted fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        hospital: form.hospital.trim(),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        isActive: form.isActive,
      };

      await updateDoctor(doctor.id, payload);

      setSuccess('Doctor updated successfully!');

      // Close modal after 2 seconds to show success message
      setTimeout(() => {
        onUpdated();
      }, 2000);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to update doctor');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setTouched({});
    onClose();
  };

  if (!doctor) {
    return (
      <Backdrop open={open}>
        <Modal role="dialog" aria-modal="true" aria-label="Edit Doctor">
          <Header>Edit Doctor</Header>
          <Content>
            <ErrorBox>No doctor data found</ErrorBox>
          </Content>
          <Actions>
            <Button type="button" variant="secondary" onClick={resetAndClose}>Close</Button>
          </Actions>
        </Modal>
      </Backdrop>
    );
  }

  return (
    <Backdrop open={open}>
      <Modal role="dialog" aria-modal="true" aria-label="Edit Doctor">
        <Header>Edit Doctor</Header>
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
            </InputRow>

<InputRow>
              <Label>
                Specialization*
                <Select
                  aria-invalid={!!fieldErrors.specialization}
                  value={form.specialization}
                  onChange={handleSpecializationChange}
                  onBlur={handleBlur}
                  name="specialization"
                >
                  <option value="">Select a specialization</option>
                  {specializationsLoading ? (
                    <option value="">Loading specializations...</option>
                  ) : (
                    specializations.map((spec) => (
                      <option key={spec.id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))
                  )}
                </Select>
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
            </InputRow>

            <InputRow>
              <Label>
                Consultation Fee*
                <Input
                  type="number"
                  min={0}
                  step={1}
                  aria-invalid={!!fieldErrors.consultationFee}
                  value={form.consultationFee}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="consultationFee"
                />
                {fieldErrors.consultationFee && <ErrorText>{fieldErrors.consultationFee}</ErrorText>}
              </Label>
              <Label>
                <Toggle>
                  <ToggleText>Account Active</ToggleText>
                  <ToggleSwitch active={form.isActive}>
                    <ToggleInput
                      type="checkbox"
                      checked={form.isActive}
                      onChange={handleToggleChange}
                    />
                    <ToggleSlider active={form.isActive} />
                  </ToggleSwitch>
                </Toggle>
              </Label>
            </InputRow>
          </Content>
          <Actions>
            {success && <SuccessBox>{success}</SuccessBox>}
            <Button type="button" variant="secondary" onClick={resetAndClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Doctor'}</Button>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  );
}