/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Medicine } from '../../../types/medicine/medicine.types';
import { getMedicines, deleteMedicine } from '../../../services/admin/pharmacy.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditMedicineModal } from './components/EditMedicineModal';

const TableContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const Th = styled.th`
  background: #F8F9FA;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #333333;
  border-bottom: 1px solid #E0E0E0;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
  color: #666666;
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? '#4CAF50' : '#FFC107'};
  color: ${props => props.status === 'active' ? '#FFFFFF' : '#333333'};
`;

const StockBadge = styled.span<{ stock: number }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.stock > 50 ? '#4CAF50' : props.stock > 10 ? '#FF9800' : '#F44336'};
  color: #FFFFFF;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #4A90E2;
  background: transparent;
  color: #4A90E2;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;

  &:hover {
    background: #4A90E2;
    color: #FFFFFF;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #FFFFFF;
  border-top: 1px solid #E0E0E0;
`;

const PageInfo = styled.span`
  color: #666666;
  font-size: 14px;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.disabled ? '#E0E0E0' : '#4A90E2'};
  background: ${props => props.disabled ? '#F8F9FA' : '#FFFFFF'};
  color: ${props => props.disabled ? '#666666' : '#4A90E2'};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin: 0 4px;

  &:hover:not(:disabled) {
    background: #4A90E2;
    color: #FFFFFF;
  }
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  color: #666666;
  min-height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;

  &:hover {
    color: #333333;
  }
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666666;
  width: 140px;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #333333;
  flex: 1;
`;

const ArrayList = styled.div`
  margin-top: 4px;
`;

const ArrayItem = styled.span`
  display: inline-block;
  background: #F0F0F0;
  color: #333333;
  padding: 2px 6px;
  margin: 2px 4px 2px 0;
  border-radius: 3px;
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 16px 0;
  background-color: #FFEBEE;
  color: #D32F2F;
  border-radius: 4px;
  border: 1px solid #FFCDD2;
`;

export const MedicineList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedicinesList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getMedicines({
        page,
        limit: pagination.limit
      });

      // Sort medicines by creation date (newest first)
      const sortedMedicines = response.data.medicines.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setMedicines(sortedMedicines);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch medicines list');
      }
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchMedicinesList(pagination.page);
  }, [pagination.page, fetchMedicinesList, refreshKey]);

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMedicine(null);
  };

  const handleMedicineUpdated = () => {
    closeEditModal();
    fetchMedicinesList(pagination.page);
  };

  const handleDeleteMedicine = (medicine: Medicine) => {
    setDeletingMedicine(medicine);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingMedicine) return;

    try {
      setDeletingId(deletingMedicine.id);
      await deleteMedicine(deletingMedicine.id);
      await fetchMedicinesList(pagination.page);
      closeDeleteModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete medicine');
      }
      console.error('Error deleting medicine:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingMedicine(null);
  };

  if (error) {
    return (
      <ErrorMessage>
        <strong>Error:</strong> {error}
      </ErrorMessage>
    );
  }

  return (
    <div>
      <TableContainer>
        <ScrollContainer>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Generic Name</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingOverlay>
                      <LoadingSpinner />
                      Loading medicines...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : (
                medicines.map(medicine => (
                  <tr key={medicine.id}>
                    <Td>
                      <strong>{medicine.name}</strong>
                      <br />
                      <small style={{ color: '#999' }}>{medicine.manufacturer}</small>
                    </Td>
                    <Td>{medicine.genericName}</Td>
                    <Td>${medicine.price.toFixed(2)}</Td>
                    <Td>
                      <StockBadge stock={medicine.stock}>
                        {medicine.stock} units
                      </StockBadge>
                    </Td>
                    <Td>
                      <StatusBadge status={medicine.status}>
                        {medicine.status}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {medicine.createdAt ? new Date(medicine.createdAt).toLocaleDateString() : '-'}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(medicine)}>
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleEditMedicine(medicine)}>
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteMedicine(medicine)}
                        disabled={deletingId === medicine.id}
                        style={{
                          backgroundColor: deletingId === medicine.id ? '#ccc' : '#dc3545',
                          borderColor: deletingId === medicine.id ? '#ccc' : '#dc3545',
                          color: 'white'
                        }}
                      >
                        {deletingId === medicine.id ? 'Deleting...' : 'Delete'}
                      </ActionButton>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ScrollContainer>

        <PaginationContainer>
          <PageInfo>
            Showing {medicines.length} of {pagination.total} medicines
          </PageInfo>
          <div>
            <PaginationButton
              disabled={loading || pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </PaginationButton>
            <PaginationButton
              disabled={loading || pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </PaginationButton>
          </div>
        </PaginationContainer>
      </TableContainer>

      {showModal && selectedMedicine && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Medicine Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <DetailValue>{selectedMedicine.name}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Generic Name:</DetailLabel>
              <DetailValue>{selectedMedicine.genericName}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Manufacturer:</DetailLabel>
              <DetailValue>{selectedMedicine.manufacturer}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Description:</DetailLabel>
              <DetailValue>{selectedMedicine.description}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Price:</DetailLabel>
              <DetailValue>${selectedMedicine.price.toFixed(2)}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Stock:</DetailLabel>
              <DetailValue>
                <StockBadge stock={selectedMedicine.stock}>
                  {selectedMedicine.stock} units
                </StockBadge>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Dosage:</DetailLabel>
              <DetailValue>{selectedMedicine.dosage}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Storage:</DetailLabel>
              <DetailValue>{selectedMedicine.storage}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusBadge status={selectedMedicine.status}>
                  {selectedMedicine.status}
                </StatusBadge>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Expiry Date:</DetailLabel>
              <DetailValue>
                {selectedMedicine.expiryDate && new Date(selectedMedicine.expiryDate).toLocaleDateString()}
              </DetailValue>
            </DetailRow>

            {selectedMedicine.sideEffects && selectedMedicine.sideEffects.length > 0 && (
              <DetailRow>
                <DetailLabel>Side Effects:</DetailLabel>
                <DetailValue>
                  <ArrayList>
                    {selectedMedicine.sideEffects.map((effect, index) => (
                      <ArrayItem key={index}>{effect}</ArrayItem>
                    ))}
                  </ArrayList>
                </DetailValue>
              </DetailRow>
            )}

            {selectedMedicine.interactions && selectedMedicine.interactions.length > 0 && (
              <DetailRow>
                <DetailLabel>Interactions:</DetailLabel>
                <DetailValue>
                  <ArrayList>
                    {selectedMedicine.interactions.map((interaction, index) => (
                      <ArrayItem key={index}>{interaction}</ArrayItem>
                    ))}
                  </ArrayList>
                </DetailValue>
              </DetailRow>
            )}

            {selectedMedicine.ingredients && selectedMedicine.ingredients.length > 0 && (
              <DetailRow>
                <DetailLabel>Ingredients:</DetailLabel>
                <DetailValue>
                  <ArrayList>
                    {selectedMedicine.ingredients.map((ingredient, index) => (
                      <ArrayItem key={index}>{ingredient}</ArrayItem>
                    ))}
                  </ArrayList>
                </DetailValue>
              </DetailRow>
            )}

            <DetailRow>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {selectedMedicine.createdAt && new Date(selectedMedicine.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Last Updated:</DetailLabel>
              <DetailValue>
                {selectedMedicine.updatedAt && new Date(selectedMedicine.updatedAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}

      <EditMedicineModal
        open={showEditModal}
        onClose={closeEditModal}
        onUpdated={handleMedicineUpdated}
        medicine={editingMedicine}
      />

      {showDeleteModal && deletingMedicine && (
        <ModalOverlay onClick={closeDeleteModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Confirm Deletion</ModalTitle>
              <CloseButton onClick={closeDeleteModal}>&times;</CloseButton>
            </ModalHeader>

            <DetailRow style={{ marginBottom: '20px' }}>
              <DetailLabel></DetailLabel>
              <DetailValue>
                Are you sure you want to delete <strong>{deletingMedicine.name}</strong>?
                <br />
                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                  This action cannot be undone.
                </span>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <ActionButton
                onClick={confirmDelete}
                disabled={deletingId === deletingMedicine.id}
                style={{
                  backgroundColor: deletingId === deletingMedicine.id ? '#ccc' : '#dc3545',
                  borderColor: deletingId === deletingMedicine.id ? '#ccc' : '#dc3545',
                  color: 'white',
                  marginRight: '8px'
                }}
              >
                {deletingId === deletingMedicine.id ? 'Deleting...' : 'Delete Medicine'}
              </ActionButton>
              <ActionButton onClick={closeDeleteModal}>
                Cancel
              </ActionButton>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};