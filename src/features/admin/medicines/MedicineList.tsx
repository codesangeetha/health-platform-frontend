/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Medicine } from '../../../types/medicine/medicine.types';
import { getMedicines, deleteMedicine, advancedSearchMedicines } from '../../../services/admin/pharmacy.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditMedicineModal } from './components/EditMedicineModal';

const TableContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  
  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

const Th = styled.th`
  background: #F8F9FA;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #333333;
  border-bottom: 1px solid #E0E0E0;
  white-space: nowrap;
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
  color: #666666;
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 12px;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? '#4CAF50' : '#FFC107'};
  color: ${props => props.status === 'active' ? '#FFFFFF' : '#333333'};
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 3px 6px;
  }
`;

const StockBadge = styled.span<{ stock: number }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.stock > 50 ? '#4CAF50' : props.stock > 10 ? '#FF9800' : '#F44336'};
  color: #FFFFFF;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 3px 6px;
  }
`;

const ActionButtonsContainer = styled.td`
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
  
  @media (max-width: 768px) {
    padding: 12px 8px;
  }
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${props => props.variant === 'danger' ? '#dc3545' : '#4A90E2'};
  background: ${props => props.variant === 'danger' ? '#dc3545' : 'transparent'};
  color: ${props => props.variant === 'danger' ? '#fff' : '#4A90E2'};
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 60px;
  
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 13px;
    flex: none;
    width: 100%;
    text-align: center;
  }

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : '#4A90E2'};
    color: #FFFFFF;
  }

  &:focus {
    outline: 2px solid rgba(74, 144, 226, 0.3);
    outline-offset: 1px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  flex-wrap: wrap;
  gap: 12px;
  
  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const PageInfo = styled.span`
  color: #666666;
  font-size: 14px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 768px) {
    order: -1;
  }
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.disabled ? '#E0E0E0' : '#4A90E2'};
  background: ${props => props.disabled ? '#F8F9FA' : '#FFFFFF'};
  color: ${props => props.disabled ? '#666666' : '#4A90E2'};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
    flex: 1;
  }

  &:hover:not(:disabled) {
    background: #4A90E2;
    color: #FFFFFF;
  }
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  
  @media (max-width: 768px) {
    -webkit-overflow-scrolling: touch;
  }
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
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 16px;
    margin: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  padding: 4px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  &:hover {
    color: #333333;
  }
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  flex-direction: column;
  
  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666666;
  margin-bottom: 4px;
  
  @media (min-width: 480px) {
    width: 140px;
    flex-shrink: 0;
    margin-bottom: 0;
    margin-right: 16px;
  }
`;

const DetailValue = styled.span`
  color: #333333;
  word-wrap: break-word;
  
  @media (min-width: 480px) {
    flex: 1;
  }
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

const FilterContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  background: #FFFFFF;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.variant === 'primary' ? '#4A90E2' : '#E0E0E0'};
  background: ${props => props.variant === 'primary' ? '#4A90E2' : '#FFFFFF'};
  color: ${props => props.variant === 'primary' ? '#FFFFFF' : '#4A90E2'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#3a78c3' : '#F8F9FA'};
    border-color: ${props => props.variant === 'primary' ? '#3a78c3' : '#CCCCCC'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface FilterState {
  name: string;
  genericName: string;
  priceMin: string;
  priceMax: string;
  fromDate: string;
  toDate: string;
}

export const MedicineList = ({ refreshKey = 0, showActions = true }: { refreshKey?: number; showActions?: boolean }) => {
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
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    name: '',
    genericName: '',
    priceMin: '',
    priceMax: '',
    fromDate: '',
    toDate: ''
  });

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

  const fetchFilteredMedicines = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setIsLoadingFiltered(true);
      
      // Convert filter values, only include non-empty ones
      const searchParams: any = {
        page,
        limit: pagination.limit
      };

      if (filters.name) searchParams.name = filters.name;
      if (filters.genericName) searchParams.genericName = filters.genericName;
      if (filters.priceMin) searchParams.priceMin = parseFloat(filters.priceMin);
      if (filters.priceMax) searchParams.priceMax = parseFloat(filters.priceMax);
      if (filters.fromDate) searchParams.fromDate = filters.fromDate;
      if (filters.toDate) searchParams.toDate = filters.toDate;

      const response = await advancedSearchMedicines(searchParams);

      setMedicines(response.data.medicines);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch filtered medicines list');
      }
      console.error('Error fetching filtered medicines:', err);
    } finally {
      setLoading(false);
      setIsLoadingFiltered(false);
    }
  }, [pagination.limit, filters]);

  // Check if any filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => value !== '');

  useEffect(() => {
    if (hasActiveFilters) {
      fetchFilteredMedicines(pagination.page);
    } else {
      fetchMedicinesList(pagination.page);
    }
  }, [pagination.page, fetchMedicinesList, fetchFilteredMedicines, refreshKey, hasActiveFilters]);

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
    if (hasActiveFilters) {
      fetchFilteredMedicines(pagination.page);
    } else {
      fetchMedicinesList(pagination.page);
    }
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
      if (hasActiveFilters) {
        await fetchFilteredMedicines(pagination.page);
      } else {
        await fetchMedicinesList(pagination.page);
      }
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

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    // Component will auto-detect through useEffect
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      genericName: '',
      priceMin: '',
      priceMax: '',
      fromDate: '',
      toDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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
        <FilterRow>
          <FilterGroup>
            <FilterLabel htmlFor="name">Name</FilterLabel>
            <FilterInput
              id="name"
              type="text"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="genericName">Generic Name</FilterLabel>
            <FilterInput
              id="genericName"
              type="text"
              placeholder="Search by generic name..."
              value={filters.genericName}
              onChange={(e) => handleFilterChange('genericName', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="priceMin">Min Price (₹)</FilterLabel>
            <FilterInput
              id="priceMin"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="priceMax">Max Price (₹)</FilterLabel>
            <FilterInput
              id="priceMax"
              type="number"
              step="0.01"
              min="0"
              placeholder="999.99"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="fromDate">From Date</FilterLabel>
            <FilterInput
              id="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="toDate">To Date</FilterLabel>
            <FilterInput
              id="toDate"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </FilterGroup>
        </FilterRow>

        <FilterActions>
          {hasActiveFilters && (
            <FilterButton variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </FilterButton>
          )}
          <FilterButton variant="primary" onClick={handleFilterSearch}>
            {isLoadingFiltered ? 'Filtering...' : 'Search'}
          </FilterButton>
        </FilterActions>
      </FilterContainer>

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
                {showActions && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6}>
                    <LoadingOverlay>
                      <LoadingSpinner />
                      {isLoadingFiltered ? 'Filtering medicines...' : 'Loading medicines...'}
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
                    <Td>₹{medicine.price.toFixed(2)}</Td>
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
                    {showActions && (
                      <ActionButtonsContainer>
                        <ActionButtonsWrapper>
                          <ActionButton onClick={() => handleViewDetails(medicine)}>
                            View
                          </ActionButton>
                          <ActionButton onClick={() => handleEditMedicine(medicine)}>
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => handleDeleteMedicine(medicine)}
                            disabled={deletingId === medicine.id}
                          >
                            {deletingId === medicine.id ? 'Deleting...' : 'Delete'}
                          </ActionButton>
                        </ActionButtonsWrapper>
                      </ActionButtonsContainer>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ScrollContainer>

        <PaginationContainer>
          <PageInfo>
            Showing {medicines.length} of {pagination.total} medicines{hasActiveFilters ? ' (filtered)' : ''}
          </PageInfo>
          <PaginationControls>
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
          </PaginationControls>
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
              <DetailValue>₹{selectedMedicine.price.toFixed(2)}</DetailValue>
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