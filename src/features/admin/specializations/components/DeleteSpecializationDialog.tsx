/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { deleteSpecialization } from '../../../../services/admin/specializations.service';
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

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  background: #fff;
`;

const WarningText = styled.div`
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const ErrorText = styled.div`
  background: #ffeff0;
  color: #b00020;
  border: 1px solid #ffcbd0;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SpecializationName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid ${({ variant }) => 
    variant === 'danger' ? '#dc3545' : 
    variant === 'secondary' ? '#ccc' : '#4A90E2'
  };
  background: ${({ variant }) => 
    variant === 'danger' ? '#dc3545' : 
    variant === 'secondary' ? '#fff' : '#4A90E2'
  };
  color: ${({ variant }) => 
    variant === 'danger' || variant === 'secondary' ? '#333' : '#fff'
  };
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ variant }) => 
      variant === 'danger' ? '#c82333' : 
      variant === 'secondary' ? '#f5f5f5' : '#3a78c3'
    };
    border-color: ${({ variant }) => 
      variant === 'danger' ? '#bd2130' : 
      variant === 'secondary' ? '#bbb' : '#3a78c3'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export function DeleteSpecializationDialog({ 
  open, 
  onClose, 
  onDeleted,
  specialization 
}: { 
  open: boolean; 
  onClose: () => void; 
  onDeleted: () => void;
  specialization: Specialization | null;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!specialization) {
      setError('No specialization selected');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await deleteSpecialization(specialization.id);
      onDeleted();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to delete specialization');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setError(null);
      onClose();
    }
  };

  if (!specialization) return null;

  return (
    <Backdrop open={open}>
      <Modal role="dialog" aria-modal="true" aria-label="Delete Specialization">
        <Header>Delete Specialization</Header>
        <Content>
          <WarningText>
            <strong>Warning:</strong> This action cannot be undone.
          </WarningText>
          
          <p>Are you sure you want to delete the following specialization?</p>
          
          <SpecializationName>"{specialization.name}"</SpecializationName>
          
          {error && <ErrorText>{error}</ErrorText>}
        </Content>
        <Actions>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose} 
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Specialization'}
          </Button>
        </Actions>
      </Modal>
    </Backdrop>
  );
}