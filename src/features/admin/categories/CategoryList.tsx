/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Category } from '../../../services/admin/pharmacy.service';
import { getCategories } from '../../../services/admin/pharmacy.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditCategoryModal } from './components/EditCategoryModal';
import { DeleteCategoryDialog } from './components/DeleteCategoryDialog';

interface CategoryFilters {
  name: string;
  description: string;
  status: string;
  fromDate: string;
  toDate: string;
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

export const CategoryList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<CategoryFilters>({
    name: '',
    description: '',
    status: '',
    fromDate: '',
    toDate: '',
    createdAt: ''
  });

  const fetchCategoriesList = useCallback(async (page: number = 1, currentFilters: CategoryFilters = filters) => {
    try {
      setLoading(true);
      const response = await getCategories({
        page,
        limit: pagination.limit,
        ...(currentFilters.name && { name: currentFilters.name }),
        ...(currentFilters.description && { description: currentFilters.description }),
        ...(currentFilters.status && { status: currentFilters.status as 'active' | 'inactive' }),
        ...(currentFilters.fromDate && { fromDate: currentFilters.fromDate }),
        ...(currentFilters.toDate && { toDate: currentFilters.toDate }),
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
        setError('Failed to fetch categories list');
      }
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const handleFilterChange = (field: keyof CategoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCategoriesList(1, filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      name: '',
      description: '',
      status: '',
      fromDate: '',
      toDate: '',
      createdAt: ''
    };
    setFilters(emptyFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCategoriesList(1, emptyFilters);
  };

  useEffect(() => {
    fetchCategoriesList(pagination.page);
  }, [pagination.page, fetchCategoriesList, refreshKey]);

  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedCategory(null);
  };

  const handleCategoryUpdated = () => {
    closeEditModal();
    // Refresh the list
    fetchCategoriesList(pagination.page);
  };

  const handleCategoryDeleted = () => {
    closeDeleteDialog();
    // Refresh the list
    fetchCategoriesList(pagination.page);
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
          <FilterLabel>From Date</FilterLabel>
          <FilterInput
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>To Date</FilterLabel>
          <FilterInput
            type="date"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
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
                      Loading medicine categories...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No medicine categories found.
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
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
                      <ActionButton onClick={(e) => handleEditCategory(category, e)}>
                        Edit
                      </ActionButton>
                      <ActionButton 
                        onClick={(e) => handleDeleteCategory(category, e)}
                        style={{ borderColor: '#dc3545', color: '#dc3545' }}
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
            Showing {categories.length} of {pagination.total} medicine categories
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

      {showModal && selectedCategory && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Medicine Category Details</ModalTitle>
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

      <EditCategoryModal
        open={showEditModal}
        category={selectedCategory}
        onClose={closeEditModal}
        onUpdated={handleCategoryUpdated}
      />

      <DeleteCategoryDialog
        open={showDeleteDialog}
        category={selectedCategory}
        onClose={closeDeleteDialog}
        onDeleted={handleCategoryDeleted}
      />
    </div>
  );
};