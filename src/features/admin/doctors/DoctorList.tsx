/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Doctor } from '../../../services/admin/doctors.service';
import { getDoctors, updateDoctorStatus } from '../../../services/admin/doctors.service';
import { ApiError } from '../../../services/auth/auth.service';
import { EditDoctorModal } from './components/EditDoctorModal';
import { DeleteDoctorDialog } from './components/DeleteDoctorDialog';

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

const StatusBadge = styled.span<{ isVerified: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.isVerified ? '#4CAF50' : '#FFC107'};
  color: ${props => props.isVerified ? '#FFFFFF' : '#333333'};
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

const SearchContainer = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SearchLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

const SearchInput = styled.input`
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

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #4A90E2;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: #357ABD;
  }

  &:disabled {
    background-color: #CCCCCC;
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  background-color: #6C757D;
  color: #FFFFFF;
  border: 1px solid #6C757D;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: #5A6268;
    border-color: #5A6268;
  }
`;

const EmptyStateMessage = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #FFFFFF;
  color: #666666;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
`;

const EmptyStateText = styled.p`
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #333333;
`;

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  margin: 0;
  color: #666666;
`;

export const DoctorList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    experience: '',
    createdAt: ''
  });

  const fetchDoctorsList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getDoctors({
        page,
        limit: pagination.limit,
        firstName: filters.firstName || undefined,
        lastName: filters.lastName || undefined,
        email: filters.email || undefined,
        specialization: filters.specialization || undefined,
        experience: filters.experience ? parseInt(filters.experience) : undefined,
        createdAt: filters.createdAt || undefined
      });

      // Sort doctors by creation date (oldest first)
      const sortedDoctors = response.data.users.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Ascending order (oldest first)
      });

      setDoctors(sortedDoctors);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch doctors list');
      }
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoctorsList(1);
  };

  const handleReset = () => {
    setFilters({
      firstName: '',
      lastName: '',
      email: '',
      specialization: '',
      experience: '',
      createdAt: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoctorsList(1);
  };

  const handleFilterChange = (field: string, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchDoctorsList(pagination.page);
  }, [pagination.page, fetchDoctorsList, refreshKey]);

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setDeletingDoctor(doctor);
    setShowDeleteDialog(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDoctor(null);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingDoctor(null);
  };

  const handleUpdated = () => {
    closeEditModal();
    fetchDoctorsList(pagination.page);
  };

  const handleDoctorDeleted = () => {
    closeDeleteDialog();
    fetchDoctorsList(pagination.page);
  };

  return (
    <div>
      <SearchContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#333333', fontSize: '18px', fontWeight: '600' }}>Filter Doctors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', marginBottom: '16px' }}>
          <SearchField>
            <SearchLabel htmlFor="firstName">First Name</SearchLabel>
            <SearchInput
              id="firstName"
              type="text"
              placeholder="Enter first name"
              value={filters.firstName}
              onChange={(e) => handleFilterChange('firstName', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="lastName">Last Name</SearchLabel>
            <SearchInput
              id="lastName"
              type="text"
              placeholder="Enter last name"
              value={filters.lastName}
              onChange={(e) => handleFilterChange('lastName', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="email">Email</SearchLabel>
            <SearchInput
              id="email"
              type="email"
              placeholder="Enter email address"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="specialization">Specialization</SearchLabel>
            <SearchInput
              id="specialization"
              type="text"
              placeholder="e.g., Cardiologist"
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="experience">Experience (Years)</SearchLabel>
            <SearchInput
              id="experience"
              type="number"
              min="0"
              max="50"
              placeholder="e.g., 15"
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="createdAt">Created After</SearchLabel>
            <SearchInput
              id="createdAt"
              type="date"
              value={filters.createdAt}
              onChange={(e) => handleFilterChange('createdAt', e.target.value)}
            />
          </SearchField>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SearchButton onClick={handleSearch}>
            Apply Filters
          </SearchButton>
          <ResetButton onClick={handleReset}>
            Reset Filters
          </ResetButton>
        </div>
      </SearchContainer>

      <TableContainer>
        <ScrollContainer>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Specialization</Th>
                <Th>Experience</Th>
                <Th>Contact</Th>
                <Th>Created</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingOverlay>
                      <LoadingSpinner />
                      Loading doctors...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyStateMessage>
                      <EmptyStateText>No doctors found</EmptyStateText>
                      <EmptyStateSubtext>
                        {Object.values(filters).some(filter => filter !== '')
                          ? 'Try adjusting your filters to see more results'
                          : 'No doctors have been added to the system yet'}
                      </EmptyStateSubtext>
                    </EmptyStateMessage>
                  </td>
                </tr>
              ) : (
                doctors.map(doctor => (
                  <tr key={doctor.id}>
                    <Td>
                      {doctor.firstName && doctor.lastName
                        ? `${doctor.firstName} ${doctor.lastName}`
                        : doctor.email}
                    </Td>
                    <Td>{doctor.specialization}</Td>
                    <Td>{doctor.experience} years</Td>
                    <Td>
                      {doctor.email}<br />
                      {doctor.phone}
                    </Td>
                    <Td>
                      {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : '-'}
                    </Td>
                    <Td>
                      <StatusBadge isVerified={doctor.isVerified}>
                        {doctor.isVerified ? 'Verified' : 'Pending'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(doctor)}>
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(doctor)}>
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(doctor)}
                        style={{
                          borderColor: '#dc3545',
                          color: '#dc3545'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dc3545';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#dc3545';
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
            Showing {doctors.length} of {pagination.total} doctors
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
      
      {showModal && selectedDoctor && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Doctor Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <DetailValue>
                {selectedDoctor.firstName && selectedDoctor.lastName
                  ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                  : 'N/A'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Email:</DetailLabel>
              <DetailValue>{selectedDoctor.email}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Phone:</DetailLabel>
              <DetailValue>{selectedDoctor.phone}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Specialization:</DetailLabel>
              <DetailValue>{selectedDoctor.specialization}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Experience:</DetailLabel>
              <DetailValue>{selectedDoctor.experience} years</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Consultation Fee:</DetailLabel>
              <DetailValue>${selectedDoctor.consultationFee}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusBadge isVerified={selectedDoctor.isVerified}>
                  {selectedDoctor.isVerified ? 'Verified' : 'Pending'}
                </StatusBadge>
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Rating:</DetailLabel>
              <DetailValue>{selectedDoctor.rating}/5</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Total Patients:</DetailLabel>
              <DetailValue>{selectedDoctor.totalPatients}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Available Days:</DetailLabel>
              <DetailValue>
                {selectedDoctor.availableDays && selectedDoctor.availableDays.length > 0
                  ? selectedDoctor.availableDays.join(', ')
                  : 'Not specified'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {selectedDoctor.createdAt && new Date(selectedDoctor.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Last Updated:</DetailLabel>
              <DetailValue>
                {selectedDoctor.updatedAt && new Date(selectedDoctor.updatedAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}
      
      <EditDoctorModal
        open={showEditModal}
        onClose={closeEditModal}
        onUpdated={handleUpdated}
        doctor={editingDoctor}
      />

      <DeleteDoctorDialog
        open={showDeleteDialog}
        doctor={deletingDoctor}
        onClose={closeDeleteDialog}
        onDeleted={handleDoctorDeleted}
      />
    </div>
  );
};