/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { updatePatient } from '../../../../services/admin/patients.service';
import { ApiError } from '../../../../services/auth/auth.service';
import type { Patient } from '../../../../services/admin/patients.service';

const Backdrop = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  align-items: center;
  justify-content: center;
  z-index: 1050;
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

const Textarea = styled.textarea`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  resize: vertical;
  min-height: 80px;
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

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

export function EditPatientModal({ 
  open, 
  onClose, 
  onUpdated, 
  patient 
}: { 
  open: boolean; 
  onClose: () => void; 
  onUpdated: () => void; 
  patient: Patient | null;
}) {
  const [form, setForm] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form with patient data when modal opens
  useEffect(() => {
    if (open && patient) {
      setForm({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: patient.bloodGroup || '',
        allergies: patient.allergies ? patient.allergies.join(', ') : '',
        chronicDiseases: patient.chronicDiseases ? patient.chronicDiseases.join(', ') : '',
        emergencyContactName: patient.emergencyContact?.name || '',
        emergencyContactRelationship: patient.emergencyContact?.relationship || '',
        emergencyContactPhone: patient.emergencyContact?.phone || '',
      });
      setError(null);
      setSuccess(null);
      setFieldErrors({});
      setTouched({});
    }
  }, [open, patient]);

  const setField = (key: keyof EditFormData, value: string) => {
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

  const validateEmergencyPhone = (v: string) => {
    const s = v.trim();
    if (s && !/^\d{10}$/.test(s)) return 'Enter a valid 10-digit phone number.';
    return undefined;
  };

  const validateField = (name: keyof EditFormData, value: string): string | undefined => {
    switch (name) {
      case 'email': return validateEmail(value);
      case 'firstName': return validateFirstName(value);
      case 'lastName': return validateLastName(value);
      case 'phone': return validatePhone(value);
      case 'emergencyContactPhone': return validateEmergencyPhone(value);
      default: return undefined;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      email: validateEmail(form.email) || '',
      firstName: validateFirstName(form.firstName) || '',
      lastName: validateLastName(form.lastName) || '',
      phone: validatePhone(form.phone) || '',
      emergencyContactPhone: validateEmergencyPhone(form.emergencyContactPhone) || '',
    };

    setFieldErrors(errors);
    return Object.values(errors).every((m) => !m);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!patient) {
      setError('No patient data found');
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
        emergencyContactPhone: true,
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
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
        ...(form.bloodGroup && { bloodGroup: form.bloodGroup }),
        ...(form.allergies.trim() && { allergies: form.allergies.split(',').map(s => s.trim()).filter(s => s) }),
        ...(form.chronicDiseases.trim() && { chronicDiseases: form.chronicDiseases.split(',').map(s => s.trim()).filter(s => s) }),
      };

      // Add emergency contact if any field is filled
      if (form.emergencyContactName.trim() || form.emergencyContactRelationship.trim() || form.emergencyContactPhone.trim()) {
        payload.emergencyContact = {
          name: form.emergencyContactName.trim(),
          relationship: form.emergencyContactRelationship.trim(),
          phone: form.emergencyContactPhone.trim(),
        };
      }

      await updatePatient(patient.id, payload);

      setSuccess('Patient updated successfully!');

      // Close modal after 2 seconds to show success message
      setTimeout(() => {
        onUpdated();
      }, 2000);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to update patient');
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

  if (!patient) {
    return (
      <Backdrop open={open}>
        <Modal role="dialog" aria-modal="true" aria-label="Edit Patient">
          <Header>Edit Patient</Header>
          <Content>
            <ErrorBox>No patient data found</ErrorBox>
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
      <Modal role="dialog" aria-modal="true" aria-label="Edit Patient">
        <Header>Edit Patient</Header>
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
                  placeholder="patient@example.com"
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
                Date of Birth
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="dateOfBirth"
                />
              </Label>
              <Label>
                Blood Group
                <Select
                  value={form.bloodGroup}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="bloodGroup"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Allergies
                <Textarea
                  value={form.allergies}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="allergies"
                  placeholder="Separate multiple allergies with commas"
                />
              </Label>
              <Label>
                Chronic Diseases
                <Textarea
                  value={form.chronicDiseases}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="chronicDiseases"
                  placeholder="Separate multiple diseases with commas"
                />
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Emergency Contact Name
                <Input
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="emergencyContactName"
                />
              </Label>
              <Label>
                Emergency Contact Relationship
                <Input
                  value={form.emergencyContactRelationship}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="emergencyContactRelationship"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Emergency Contact Phone
                <Input
                  aria-invalid={!!fieldErrors.emergencyContactPhone}
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="emergencyContactPhone"
                  pattern="^\d{10}$"
                  title="Enter a valid 10-digit phone number"
                />
                {fieldErrors.emergencyContactPhone && <ErrorText>{fieldErrors.emergencyContactPhone}</ErrorText>}
              </Label>
            </InputRow>
          </Content>
          <Actions>
            {success && <SuccessBox>{success}</SuccessBox>}
            <Button type="button" variant="secondary" onClick={resetAndClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Patient'}</Button>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  );
}