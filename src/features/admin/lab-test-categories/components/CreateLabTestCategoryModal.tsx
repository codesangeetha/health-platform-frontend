/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { createLabTestCategory } from '../../../../services/admin/lab-test-categories.service';
import type { CreateLabTestCategoryPayload } from '../../../../types/lab-test-category/lab-test-category.types';
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
  width: 500px;
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
  display: flex;
  flex-direction: column;
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

export function CreateLabTestCategoryModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void; }) {
    const [form, setForm] = useState<CreateLabTestCategoryPayload>({
        name: '',
        description: '',
        status: 'active',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const setField = (key: keyof typeof form, value: any) => {
        setForm((prev: CreateLabTestCategoryPayload) => ({ ...prev, [key]: value }));
        if (fieldErrors[key as string]) {
            setFieldErrors((prev: Record<string, string>) => {
                const { [key as string]: _omit, ...rest } = prev;
                return rest;
            });
        }
    };

    // Validation helpers
    const validateName = (v: string) => {
        const s = v.trim();
        if (!s) return 'Lab test category name is required.';
        if (s.length < 2) return 'Lab test category name must be at least 2 characters.';
        if (s.length > 50) return 'Lab test category name cannot exceed 50 characters.';
        return undefined;
    };

    const validateDescription = (v: string) => {
        const s = v.trim();
        if (!s) return 'Lab test category description is required.';
        if (s.length < 10) return 'Description must be at least 10 characters.';
        if (s.length > 200) return 'Description cannot exceed 200 characters.';
        return undefined;
    };

    const validateField = (name: keyof typeof form, value: string): string | undefined => {
        switch (name) {
            case 'name': return validateName(value);
            case 'description': return validateDescription(value);
            default: return undefined;
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {
            name: validateName(form.name) || '',
            description: validateDescription(form.description) || '',
        };

        setFieldErrors(errors);
        return Object.values(errors).every((m) => !m);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: CreateLabTestCategoryPayload) => ({ ...prev, [name]: value }));

        const key = name as keyof typeof form;
        if (touched[key as string]) {
            setFieldErrors((prev: Record<string, string>) => ({ ...prev, [key]: validateField(key, value) || '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

        const isValid = validateForm();
        if (!isValid) {
            // Mark all as touched so errors are visible
            setTouched({
                name: true,
                description: true,
                status: true,
            });
            setError('Please fix the highlighted fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateLabTestCategoryPayload = {
                name: form.name.trim(),
                description: form.description.trim(),
                status: form.status,
            };

            await createLabTestCategory(payload);
            onCreated();
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(err?.message || 'Failed to create lab test category');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setForm({
            name: '',
            description: '',
            status: 'active',
        });
        setError(null);
        setFieldErrors({});
        setTouched({});
        onClose();
    };

    return (
        <Backdrop open={open}>
            <Modal role="dialog" aria-modal="true" aria-label="Create Lab Test Category">
                <Header>Create Lab Test Category</Header>
                <Form onSubmit={handleSubmit}>
                    <Content>
                        {error && <ErrorBox>{error}</ErrorBox>}
                        <InputRow>
                            <Label>
                                Lab Test Category Name*
                                <Input
                                    aria-invalid={!!fieldErrors.name}
                                    value={form.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="name"
                                    placeholder="Blood Tests"
                                />
                                {fieldErrors.name && <ErrorText>{fieldErrors.name}</ErrorText>}
                            </Label>
                        </InputRow>

                        <InputRow>
                            <Label>
                                Lab Test Category Description*
                                <TextArea
                                    aria-invalid={!!fieldErrors.description}
                                    value={form.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="description"
                                    placeholder="Various blood analysis tests..."
                                />
                                {fieldErrors.description && <ErrorText>{fieldErrors.description}</ErrorText>}
                            </Label>
                        </InputRow>

                        <InputRow>
                            <Label>
                                Status
                                <Select
                                    value={form.status}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    name="status"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </Select>
                            </Label>
                        </InputRow>
                    </Content>
                    <Actions>
                        <Button type="button" variant="secondary" onClick={resetAndClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Lab Test Category'}</Button>
                    </Actions>
                </Form>
            </Modal>
        </Backdrop>
    );
}