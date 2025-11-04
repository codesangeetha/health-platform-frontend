/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { LabTestCategory } from '../../../types/lab-test-category/lab-test-category.types';
import { getLabTestCategories } from '../../../services/admin/lab-test-categories.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditLabTestCategoryModal } from './components/EditLabTestCategoryModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

interface LabTestCategoryFilters {
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

const FilterContainer = styled.div`
  background: #F8F9FA;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  color: #333333;

  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  color: #333333;
  background: #FFFFFF;

  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 22px;
  height: 36px;
  
  &.primary {
    background-color: #4A90E2;
    color: #FFFFFF;
    
    &:hover {
      background-color: #3a78c3;
    }
  }
  
  &.secondary {
    background-color: #6C757D;
    color: #FFFFFF;
    
    &:hover {
      background-color: #5a6268;
    }
  }
`;

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

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? '#4CAF50' : '#FFC107'};
  color: ${props => props.status === 'active' ? '#FFFFFF' : '#333333'};
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

export const LabTestCategoryList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [categories, setCategories] = useState<LabTestCategory[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LabTestCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LabTestCategory | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<LabTestCategory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<LabTestCategoryFilters>({
    name: '',
    description: '',
    status: '',
    createdAt: ''
  });

  const fetchCategoriesList = useCallback(async (page: number = 1, currentFilters: LabTestCategoryFilters = filters) => {
    try {
      setLoading(true);
      const response = await getLabTestCategories({
        page,
        limit: 10,
        ...(currentFilters.name && { name: currentFilters.name }),
        ...(currentFilters.description && { description: currentFilters.description }),
        ...(currentFilters.status && { status: currentFilters.status as 'active' | 'inactive' }),
        ...(currentFilters.createdAt && { createdAt: currentFilters.createdAt })
      });

      // Sort categories by creation date (newest first)
      const sortedCategories = response.data.categories.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setCategories(sortedCategories);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch lab test categories list');
      }
      console.error('Error fetching lab test categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (field: keyof LabTestCategoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCategoriesList(1, filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      name: '',
      description: '',
      status: '',
      createdAt: ''
    };
    setFilters(emptyFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCategoriesList(1, emptyFilters);
  };

  useEffect(() => {
    fetchCategoriesList(pagination.currentPage);
  }, [pagination.currentPage, fetchCategoriesList, refreshKey]);

  const handleViewDetails = (category: LabTestCategory) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: LabTestCategory) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category: LabTestCategory) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingCategory(null);
  };

  const handleCategoryUpdated = () => {
    closeEditModal();
    // Refresh the list
    fetchCategoriesList(pagination.currentPage);
  };

  const handleCategoryDeleted = () => {
    closeDeleteDialog();
    // Refresh the list
    fetchCategoriesList(pagination.currentPage);
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
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Name</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Description</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Filter by description..."
            value={filters.description}
            onChange={(e) => handleFilterChange('description', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Created Date</FilterLabel>
          <FilterInput
            type="date"
            value={filters.createdAt}
            onChange={(e) => handleFilterChange('createdAt', e.target.value)}
          />
        </FilterGroup>

        <FilterButton className="primary" onClick={handleApplyFilters}>
          Apply Filters
        </FilterButton>
        
        <FilterButton className="secondary" onClick={handleClearFilters}>
          Clear Filters
        </FilterButton>
      </FilterContainer>

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
                      Loading lab test categories...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.categoryId}>
                    <Td>{category.name}</Td>
                    <Td title={category.description}>
                      {category.description.length > 50
                        ? `${category.description.substring(0, 50)}...`
                        : category.description}
                    </Td>
                    <Td>
                      <StatusBadge status={category.status}>
                        {category.status}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(category)}>
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(category)} style={{ marginLeft: '4px', marginRight: '4px' }}>
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(category)}
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
            Showing {categories.length} of {pagination.totalCount} lab test categories
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

      {showModal && selectedCategory && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Lab Test Category Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <DetailValue>{selectedCategory.name}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Description:</DetailLabel>
              <DetailValue>{selectedCategory.description}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusBadge status={selectedCategory.status}>
                  {selectedCategory.status}
                </StatusBadge>
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {selectedCategory.createdAt && new Date(selectedCategory.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Last Updated:</DetailLabel>
              <DetailValue>
                {selectedCategory.updatedAt && new Date(selectedCategory.updatedAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}

      <EditLabTestCategoryModal
        open={showEditModal}
        category={editingCategory}
        onClose={closeEditModal}
        onUpdated={handleCategoryUpdated}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        category={deletingCategory}
        onClose={closeDeleteDialog}
        onDeleted={handleCategoryDeleted}
      />
    </div>
  );
};