/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { LabTest } from '../../../types/lab-test/lab-test.types';
import { getLabTests } from '../../../services/admin/lab-tests.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditLabTestModal } from './components/EditLabTestModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { CreateLabTestModal } from './components/CreateLabTestModal';

const TableContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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

const StatusBadge = styled.span<{ status: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.status ? '#4CAF50' : '#FFC107'};
  color: ${props => props.status ? '#FFFFFF' : '#333333'};
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
  max-width: 500px;
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
  width: 120px;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #333333;
  flex: 1;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 16px 0;
  background-color: #FFEBEE;
  color: #D32F2F;
  border-radius: 4px;
  border: 1px solid #FFCDD2;
`;


interface LabTestListProps {
  refreshKey?: number;
  categories?: { categoryId: string; name: string }[];
}

export const LabTestList = ({ refreshKey = 0, categories = [] }: LabTestListProps) => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState<LabTest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingLabTest, setDeletingLabTest] = useState<LabTest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);


  const fetchLabTestsList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);

      const response = await getLabTests({
        page,
        limit: 10,
        isActive: true
      });

      // Sort lab tests by creation date (newest first)
      const sortedLabTests = response.data.tests.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setLabTests(sortedLabTests);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch lab tests list');
      }
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchLabTestsList(pagination.currentPage);
  }, [pagination.currentPage, fetchLabTestsList, refreshKey]);

  const handleViewDetails = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLabTest(null);
  };

  const handleEdit = (labTest: LabTest) => {
    setEditingLabTest(labTest);
    setShowEditModal(true);
  };

  const handleDelete = (labTest: LabTest) => {
    setDeletingLabTest(labTest);
    setShowDeleteDialog(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingLabTest(null);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingLabTest(null);
  };

  const handleLabTestUpdated = () => {
    closeEditModal();
    // Refresh the list
    fetchLabTestsList(pagination.currentPage);
  };

  const handleLabTestDeleted = () => {
    closeDeleteDialog();
    // Refresh the list
    fetchLabTestsList(pagination.currentPage);
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
                <Th>Description</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <LoadingOverlay>
                      <LoadingSpinner />
                      Loading lab tests...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : (
                labTests.map(labTest => (
                  <tr key={labTest.testId}>
                    <Td>{labTest.name}</Td>
                    <Td title={labTest.description}>
                      {labTest.description.length > 50
                        ? `${labTest.description.substring(0, 50)}...`
                        : labTest.description}
                    </Td>
                    <Td>
                      <StatusBadge status={labTest.isActive}>
                        {labTest.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {labTest.createdAt ? new Date(labTest.createdAt).toLocaleDateString() : '-'}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(labTest)}>
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(labTest)} style={{ marginLeft: '4px', marginRight: '4px' }}>
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(labTest)}
                        style={{
                          marginLeft: '4px',
                          backgroundColor: '#dc3545',
                          borderColor: '#dc3545',
                          color: '#fff'
                        }}
                      >
                        Delete
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
            Showing {labTests.length} of {pagination.totalCount} lab tests
          </PageInfo>
          <div>
            <PaginationButton
              disabled={loading || !pagination.hasPreviousPage}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </PaginationButton>
            <PaginationButton
              disabled={loading || !pagination.hasNextPage}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </PaginationButton>
          </div>
        </PaginationContainer>
      </TableContainer>

      {showModal && selectedLabTest && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Lab Test Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <DetailValue>{selectedLabTest.name}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Description:</DetailLabel>
              <DetailValue>{selectedLabTest.description}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusBadge status={selectedLabTest.isActive}>
                  {selectedLabTest.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {selectedLabTest.createdAt && new Date(selectedLabTest.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Last Updated:</DetailLabel>
              <DetailValue>
                {selectedLabTest.updatedAt && new Date(selectedLabTest.updatedAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}

      <EditLabTestModal
        open={showEditModal}
        labTest={editingLabTest}
        categories={categories}
        onClose={closeEditModal}
        onUpdated={handleLabTestUpdated}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        labTest={deletingLabTest}
        onClose={closeDeleteDialog}
        onDeleted={handleLabTestDeleted}
      />
    </div>
  );
};