/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { deleteLabTestCategory } from '../../../../services/admin/lab-test-categories.service';
import { ApiError } from '../../../../services/auth/auth.service';
import type { LabTestCategory } from '../../../../types/lab-test-category/lab-test-category.types';

const Backdrop = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: #fff;
  width: 400px;
  max-width: calc(100% - 32px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 16px;
  background: #F8F9FA;
  color: #dc3545;
`;

const Content = styled.div`
  padding: 20px;
  text-align: center;
`;

const Text = styled.p`
  margin: 0 0 20px 0;
  color: #333;
  line-height: 1.5;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid ${({ variant }) => {
    switch (variant) {
      case 'secondary': return '#ccc';
      case 'danger': return '#dc3545';
      default: return '#4A90E2';
    }
  }};
  background: ${({ variant }) => {
    switch (variant) {
      case 'secondary': return '#fff';
      case 'danger': return '#dc3545';
      default: return '#4A90E2';
    }
  }};
  color: ${({ variant }) => {
    switch (variant) {
      case 'secondary': return '#333';
      case 'danger': return '#fff';
      default: return '#fff';
    }
  }};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ variant }) => {
      switch (variant) {
        case 'secondary': return '#f5f5f5';
        case 'danger': return '#c82333';
        default: return '#3a78c3';
      }
    }};
    border-color: ${({ variant }) => {
      switch (variant) {
        case 'secondary': return '#bbb';
        case 'danger': return '#c82333';
        default: return '#3a78c3';
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

interface DeleteConfirmDialogProps {
  open: boolean;
  category: LabTestCategory | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmDialog({ open, category, onClose, onDeleted }: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!category) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteLabTestCategory(category.categoryId);
      onDeleted();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to delete lab test category');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!category) return null;

  return (
    <Backdrop open={open}>
      <Dialog>
        <Header>Delete Lab Test Category</Header>
        <Content>
          {error && (
            <div style={{
              background: '#ffeff0',
              color: '#b00020',
              border: '1px solid #ffcbd0',
              padding: '10px 12px',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              {error}
            </div>
          )}
          <Text>
            Are you sure you want to delete "{category.name}"? This action cannot be undone.
          </Text>
          <Actions>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Actions>
        </Content>
      </Dialog>
    </Backdrop>
  );
}