/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { updateMedicine, type UpdateMedicinePayload } from '../../../../services/admin/pharmacy.service';
import { ApiError } from '../../../../services/auth/auth.service';
import type { Medicine } from '../../../../types/medicine/medicine.types';

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
  width: 800px;
  max-width: calc(100% - 32px);
  max-height: 90vh;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const TextArea = styled.textarea`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  min-height: 80px;
  resize: vertical;
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

const ArrayInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const ArrayInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const AddButton = styled.button`
  padding: 8px 12px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #3a78c3;
  }
`;

const ArrayList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ArrayItem = styled.span`
  display: inline-flex;
  align-items: center;
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  gap: 4px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #1976D2;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #0D47A1;
  }
`;

export function EditMedicineModal({
  open,
  onClose,
  onUpdated,
  medicine
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  medicine: Medicine | null;
}) {
  const [form, setForm] = useState<UpdateMedicinePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Temporary state for array inputs
  const [tempSideEffect, setTempSideEffect] = useState('');
  const [tempInteraction, setTempInteraction] = useState('');
  const [tempIngredient, setTempIngredient] = useState('');

  // Initialize form when medicine changes
  useEffect(() => {
    if (medicine) {
      setForm({
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        price: medicine.price,
        stock: medicine.stock,
        description: medicine.description,
        dosage: medicine.dosage,
        sideEffects: medicine.sideEffects || [],
        interactions: medicine.interactions || [],
        ingredients: medicine.ingredients || [],
        storage: medicine.storage,
        expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
        status: medicine.status,
      });
      setError(null);
      setFieldErrors({});
      setTouched({});
    }
  }, [medicine]);

  const setField = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors(prev => {
        const { [key as string]: _omit, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validation helpers (same as CreateMedicineModal)
  const validateName = (v: string) => {
    const s = v.trim();
    if (!s) return 'Medicine name is required.';
    if (s.length < 2) return 'Medicine name must be at least 2 characters.';
    if (s.length > 100) return 'Medicine name cannot exceed 100 characters.';
    return undefined;
  };

  const validateGenericName = (v: string) => {
    const s = v.trim();
    if (!s) return 'Generic name is required.';
    if (s.length < 2) return 'Generic name must be at least 2 characters.';
    if (s.length > 100) return 'Generic name cannot exceed 100 characters.';
    return undefined;
  };

  const validatePrice = (v: number) => {
    if (v <= 0) return 'Price must be greater than 0.';
    if (v > 9999.99) return 'Price cannot exceed 9999.99.';
    return undefined;
  };

  const validateStock = (v: number) => {
    if (v < 0) return 'Stock cannot be negative.';
    if (v > 99999) return 'Stock cannot exceed 99999.';
    return undefined;
  };

  const validateDescription = (v: string) => {
    const s = v.trim();
    if (!s) return 'Description is required.';
    if (s.length < 10) return 'Description must be at least 10 characters.';
    if (s.length > 500) return 'Description cannot exceed 500 characters.';
    return undefined;
  };

  const validateDosage = (v: string) => {
    const s = v.trim();
    if (!s) return 'Dosage is required.';
    if (s.length > 200) return 'Dosage cannot exceed 200 characters.';
    return undefined;
  };

  const validateStorage = (v: string) => {
    const s = v.trim();
    if (!s) return 'Storage information is required.';
    if (s.length > 200) return 'Storage information cannot exceed 200 characters.';
    return undefined;
  };

  const validateField = (name: keyof typeof form, value: any): string | undefined => {
    switch (name) {
      case 'name': return validateName(value);
      case 'genericName': return validateGenericName(value);
      case 'price': return validatePrice(value);
      case 'stock': return validateStock(value);
      case 'description': return validateDescription(value);
      case 'dosage': return validateDosage(value);
      case 'storage': return validateStorage(value);
      default: return undefined;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      name: validateName(form.name || '') || '',
      genericName: validateGenericName(form.genericName || '') || '',
      price: validatePrice(form.price || 0) || '',
      stock: validateStock(form.stock || 0) || '',
      description: validateDescription(form.description || '') || '',
      dosage: validateDosage(form.dosage || '') || '',
      storage: validateStorage(form.storage || '') || '',
    };

    setFieldErrors(errors);
    return Object.values(errors).every((m) => !m);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'stock') {
      const numValue = parseFloat(value) || 0;
      setForm(prev => ({ ...prev, [name]: numValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    const key = name as keyof typeof form;
    if (touched[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: validateField(key, name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value) || '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof typeof form;

    let processedValue: any = value;
    if (name === 'price' || name === 'stock') {
      processedValue = parseFloat(value) || 0;
    }

    setTouched((t) => ({ ...t, [key]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [key]: validateField(key, processedValue) || '',
    }));
  };

  const addArrayItem = (field: 'sideEffects' | 'interactions' | 'ingredients', value: string) => {
    if (!value.trim()) return;

    const currentArray = form[field] || [];
    setForm(prev => ({
      ...prev,
      [field]: [...currentArray, value.trim()]
    }));

    // Clear the temp input
    if (field === 'sideEffects') setTempSideEffect('');
    if (field === 'interactions') setTempInteraction('');
    if (field === 'ingredients') setTempIngredient('');
  };

  const removeArrayItem = (field: 'sideEffects' | 'interactions' | 'ingredients', index: number) => {
    const currentArray = form[field] || [];
    setForm(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    setError(null);

    const isValid = validateForm();
    if (!isValid) {
      setTouched({
        name: true,
        genericName: true,
        price: true,
        stock: true,
        description: true,
        dosage: true,
        storage: true,
      });
      setError('Please fix the highlighted fields');
      return;
    }

    try {
      setSubmitting(true);
      await updateMedicine(medicine.id, form);
      onUpdated();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to update medicine');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFieldErrors({});
    setTouched({});
    setTempSideEffect('');
    setTempInteraction('');
    setTempIngredient('');
    onClose();
  };

  if (!medicine) return null;

  return (
    <Backdrop open={open}>
      <Modal role="dialog" aria-modal="true" aria-label="Edit Medicine">
        <Header>Edit Medicine</Header>
        <Form onSubmit={handleSubmit}>
          <Content>
            {error && <ErrorBox>{error}</ErrorBox>}

            <InputRow>
              <Label>
                Medicine Name*
                <Input
                  aria-invalid={!!fieldErrors.name}
                  value={form.name || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="name"
                  placeholder="Enter medicine name"
                />
                {fieldErrors.name && <ErrorText>{fieldErrors.name}</ErrorText>}
              </Label>
              <Label>
                Generic Name*
                <Input
                  aria-invalid={!!fieldErrors.genericName}
                  value={form.genericName || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="genericName"
                  placeholder="Enter generic name"
                />
                {fieldErrors.genericName && <ErrorText>{fieldErrors.genericName}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Category ID
                <Input
                  value={form.category || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="category"
                  placeholder="Enter category ID"
                />
              </Label>
              <Label>
                Manufacturer
                <Input
                  value={form.manufacturer || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="manufacturer"
                  placeholder="Enter manufacturer"
                />
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Price*
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!fieldErrors.price}
                  value={form.price || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="price"
                  placeholder="0.00"
                />
                {fieldErrors.price && <ErrorText>{fieldErrors.price}</ErrorText>}
              </Label>
              <Label>
                Stock*
                <Input
                  type="number"
                  min="0"
                  aria-invalid={!!fieldErrors.stock}
                  value={form.stock || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="stock"
                  placeholder="0"
                />
                {fieldErrors.stock && <ErrorText>{fieldErrors.stock}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Description*
                <TextArea
                  aria-invalid={!!fieldErrors.description}
                  value={form.description || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="description"
                  placeholder="Enter medicine description"
                />
                {fieldErrors.description && <ErrorText>{fieldErrors.description}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Dosage*
                <Input
                  aria-invalid={!!fieldErrors.dosage}
                  value={form.dosage || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="dosage"
                  placeholder="Enter dosage information"
                />
                {fieldErrors.dosage && <ErrorText>{fieldErrors.dosage}</ErrorText>}
              </Label>
              <Label>
                Storage*
                <Input
                  aria-invalid={!!fieldErrors.storage}
                  value={form.storage || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="storage"
                  placeholder="Enter storage information"
                />
                {fieldErrors.storage && <ErrorText>{fieldErrors.storage}</ErrorText>}
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Expiry Date
                <Input
                  type="date"
                  value={form.expiryDate || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="expiryDate"
                />
              </Label>
              <Label>
                Status
                <Select
                  value={form.status || 'active'}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Side Effects
                <ArrayInputContainer>
                  <ArrayInput
                    value={tempSideEffect}
                    onChange={(e) => setTempSideEffect(e.target.value)}
                    placeholder="Add side effect"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('sideEffects', tempSideEffect);
                      }
                    }}
                  />
                  <AddButton
                    type="button"
                    onClick={() => addArrayItem('sideEffects', tempSideEffect)}
                  >
                    Add
                  </AddButton>
                </ArrayInputContainer>
                <ArrayList>
                  {(form.sideEffects || []).map((effect, index) => (
                    <ArrayItem key={index}>
                      {effect}
                      <RemoveButton
                        type="button"
                        onClick={() => removeArrayItem('sideEffects', index)}
                      >
                        ×
                      </RemoveButton>
                    </ArrayItem>
                  ))}
                </ArrayList>
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Interactions
                <ArrayInputContainer>
                  <ArrayInput
                    value={tempInteraction}
                    onChange={(e) => setTempInteraction(e.target.value)}
                    placeholder="Add interaction"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('interactions', tempInteraction);
                      }
                    }}
                  />
                  <AddButton
                    type="button"
                    onClick={() => addArrayItem('interactions', tempInteraction)}
                  >
                    Add
                  </AddButton>
                </ArrayInputContainer>
                <ArrayList>
                  {(form.interactions || []).map((interaction, index) => (
                    <ArrayItem key={index}>
                      {interaction}
                      <RemoveButton
                        type="button"
                        onClick={() => removeArrayItem('interactions', index)}
                      >
                        ×
                      </RemoveButton>
                    </ArrayItem>
                  ))}
                </ArrayList>
              </Label>
            </InputRow>

            <InputRow>
              <Label>
                Ingredients
                <ArrayInputContainer>
                  <ArrayInput
                    value={tempIngredient}
                    onChange={(e) => setTempIngredient(e.target.value)}
                    placeholder="Add ingredient"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('ingredients', tempIngredient);
                      }
                    }}
                  />
                  <AddButton
                    type="button"
                    onClick={() => addArrayItem('ingredients', tempIngredient)}
                  >
                    Add
                  </AddButton>
                </ArrayInputContainer>
                <ArrayList>
                  {(form.ingredients || []).map((ingredient, index) => (
                    <ArrayItem key={index}>
                      {ingredient}
                      <RemoveButton
                        type="button"
                        onClick={() => removeArrayItem('ingredients', index)}
                      >
                        ×
                      </RemoveButton>
                    </ArrayItem>
                  ))}
                </ArrayList>
              </Label>
            </InputRow>
          </Content>
          <Actions>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Medicine'}</Button>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  );
}