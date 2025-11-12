/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { createDoctor, type CreateDoctorPayload } from '../../../../services/admin/doctors.service';
import { getSpecializations } from '../../../../services/admin/specializations.service';
import { ApiError } from '../../../../services/auth/auth.service';
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
  const [form, setForm] = useState<CreateDoctorPayload>({
    userType: 'doctor',
    email: '',
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
    availableDays: [],
    availableTime: {
      start: '',
      end: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Fetch specializations when component mounts
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

  const validateAvailableDays = (v: string[]) => {
    if (!v || v.length === 0) return 'At least one available day must be selected.';
    return undefined;
  };

  const validateAvailableTimeStart = (v: string) => {
    if (!v) return 'Start time is required.';
    const timeRe = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRe.test(v)) return 'Start time must be in HH:MM format (24-hour).';
    return undefined;
  };

  const validateAvailableTimeEnd = (v: string) => {
    if (!v) return 'End time is required.';
    const timeRe = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRe.test(v)) return 'End time must be in HH:MM format (24-hour).';
    return undefined;
  };

const validateField = (name: keyof typeof form, value: string | string[] | { start: string; end: string }): string | undefined => {
    switch (name) {
      case 'email': return validateEmail(value as string);
      case 'firstName': return validateFirstName(value as string);
      case 'lastName': return validateLastName(value as string);
      case 'phone': return validatePhone(value as string);
      case 'whatsapp': return validateWhatsapp(value as string);
      case 'dateOfBirth': return validateDOB(value as string);
      case 'specialization': return validateSpecialization(value as string);
      case 'qualification': return validateQualification(value as string);
      case 'hospital': return validateHospital(value as string);
      case 'licenseNumber': return validateLicenseNumber(value as string);
      case 'experience': return validateExperience(value as string);
      case 'consultationFee': return validateConsultationFee(value as string);
      case 'availableDays': return validateAvailableDays(value as string[]);
      case 'availableTime': {
        if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
          const startError = validateAvailableTimeStart(value.start);
          const endError = validateAvailableTimeEnd(value.end);
          return startError || endError;
        }
        return 'Available time is required.';
      }
      default: return undefined;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      email: validateEmail(form.email) || '',
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
      availableDays: validateAvailableDays(form.availableDays || []) || '',
      availableTime: validateField('availableTime', form.availableTime || '') || '',
    };

    setFieldErrors(errors);
    return Object.values(errors).every((m) => !m);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const key = name as keyof typeof form;
    if (touched[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validateField(key, value) || '' }));
    }

    // If phone number changes and "same as phone" is checked, update WhatsApp
    if (name === 'phone' && sameAsPhone) {
      setForm(prev => ({ ...prev, whatsapp: value }));
      if (touched.whatsapp) {
        setFieldErrors((prev) => ({ ...prev, whatsapp: validateField('whatsapp', value) || '' }));
      }
    }

    // Clear success message when user starts editing
    if (success) {
      setSuccess(null);
    }
  };

  const handleSameAsPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    
    if (checked) {
      // Copy phone number to WhatsApp field
      setForm(prev => ({ ...prev, whatsapp: prev.phone }));
      // Clear WhatsApp field error if phone is valid
      if (form.phone) {
        const phoneError = validatePhone(form.phone);
        if (!phoneError) {
          setFieldErrors(prev => ({ ...prev, whatsapp: '' }));
        }
      }
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
        availableDays: true,
        availableTime: true,
      });
      setError('Please fix the highlighted fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateDoctorPayload = {
        userType: 'doctor',
        email: form.email.trim(),
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
        availableDays: form.availableDays || [],
        availableTime: form.availableTime,
      };

      await createDoctor(payload);

      // Clear form on successful submission
      setForm({
        userType: 'doctor',
        email: '',
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
        availableDays: [],
        availableTime: {
          start: '',
          end: '',
        },
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
      userType: 'doctor',
      email: '',
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
      availableDays: [],
      availableTime: {
        start: '',
        end: '',
      },
    });
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setTouched({});
    setSameAsPhone(false);
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
                  disabled={sameAsPhone}
                />
                {fieldErrors.whatsapp && <ErrorText>{fieldErrors.whatsapp}</ErrorText>}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={handleSameAsPhoneChange}
                    style={{ cursor: 'pointer' }}
                  />
                  Same as phone number
                </label>
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
                <Select
                  aria-invalid={!!fieldErrors.specialization}
                  value={form.specialization}
                  onChange={(e) => {
                    setField('specialization', e.target.value);
                    const key = 'specialization' as keyof typeof form;
                    setFieldErrors(prev => ({ ...prev, [key]: validateField(key, e.target.value) || '' }));
                  }}
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

            <InputRow>
              <Label>
                Available Days*
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: form.availableDays?.includes(day) ? '#e3f2fd' : '#fff',
                        fontSize: '12px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.availableDays?.includes(day) || false}
                        onChange={(e) => {
                          const currentDays = form.availableDays || [];
                          const updatedDays = e.target.checked
                            ? [...currentDays, day]
                            : currentDays.filter((d) => d !== day);
                          setField('availableDays', updatedDays);
                          if (touched.availableDays) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              availableDays: validateAvailableDays(updatedDays) || '',
                            }));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
                {fieldErrors.availableDays && <ErrorText>{fieldErrors.availableDays}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Available Time - Start*
                <Input
                  type="time"
                  aria-invalid={!!fieldErrors.availableTime}
                  value={form.availableTime?.start || ''}
                  onChange={(e) => {
                    setField('availableTime', { ...form.availableTime, start: e.target.value });
                    if (touched.availableTime) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        availableTime: validateField('availableTime', { start: e.target.value, end: form.availableTime?.end || '' }) || '',
                      }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, availableTime: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      availableTime: validateField('availableTime', form.availableTime || '') || '',
                    }));
                  }}
                  name="availableTimeStart"
                />
                {fieldErrors.availableTime && <ErrorText>{fieldErrors.availableTime}</ErrorText>}
              </Label>
              <Label>
                Available Time - End*
                <Input
                  type="time"
                  aria-invalid={!!fieldErrors.availableTime}
                  value={form.availableTime?.end || ''}
                  onChange={(e) => {
                    setField('availableTime', { ...form.availableTime, end: e.target.value });
                    if (touched.availableTime) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        availableTime: validateField('availableTime', { start: form.availableTime?.start || '', end: e.target.value }) || '',
                      }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, availableTime: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      availableTime: validateField('availableTime', form.availableTime || '') || '',
                    }));
                  }}
                  name="availableTimeEnd"
                />
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
