/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Patient } from '../../../../services/admin/patients.service';
import { getPatients } from '../../../../services/admin/patients.service';
import { ApiError } from '../../../../services/auth/auth.service';
import { EditPatientModal } from './EditPatientModal';
import { DeletePatientDialog } from './DeletePatientDialog';

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

export const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bloodGroup: '',
    fromDate: '',
    toDate: ''
  });

  const fetchPatientsList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getPatients({
        page,
        limit: pagination.limit,
        firstName: filters.firstName || undefined,
        lastName: filters.lastName || undefined,
        email: filters.email || undefined,
        bloodGroup: filters.bloodGroup || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined
      });

      // Sort patients by creation date (newest first)
      const sortedPatients = response.data.users.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setPatients(sortedPatients);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch patients list');
      }
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPatientsList(1);
  };

  const handleReset = () => {
    setFilters({
      firstName: '',
      lastName: '',
      email: '',
      bloodGroup: '',
      fromDate: '',
      toDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPatientsList(1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchPatientsList(pagination.page);
  }, [pagination.page, fetchPatientsList]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPatient(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedPatient(null);
  };

  const handleRefresh = () => {
    fetchPatientsList(pagination.page);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  if (error) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#FFEBEE', color: '#D32F2F', borderRadius: '4px', border: '1px solid #FFCDD2' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div>
      <SearchContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#333333', fontSize: '18px', fontWeight: '600' }}>Filter Patients</h3>
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
            <SearchLabel htmlFor="bloodGroup">Blood Group</SearchLabel>
            <SearchInput
              id="bloodGroup"
              type="text"
              placeholder="e.g., O+, A-, B+"
              value={filters.bloodGroup}
              onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="fromDate">From Date</SearchLabel>
            <SearchInput
              id="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="toDate">To Date</SearchLabel>
            <SearchInput
              id="toDate"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
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
                <Th>Blood Group</Th>
                <Th>Contact</Th>
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
                      Loading patients...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyStateMessage>
                      <EmptyStateText>No patients found</EmptyStateText>
                      <EmptyStateSubtext>
                        {Object.values(filters).some(filter => filter !== '')
                          ? 'Try adjusting your filters to see more results'
                          : 'No patients have been added to the system yet'}
                      </EmptyStateSubtext>
                    </EmptyStateMessage>
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id}>
                    <Td>
                      {patient.firstName && patient.lastName
                        ? `${patient.firstName} ${patient.lastName}`
                        : patient.email}
                    </Td>
                    <Td>{patient.bloodGroup || '-'}</Td>
                    <Td>
                      {patient.email}<br />
                      {patient.phone && patient.phone !== '0000000000' ? patient.phone : ''}
                    </Td>
                    <Td>
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(patient)}>
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleEditPatient(patient)}>
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeletePatient(patient)}
                        style={{ borderColor: '#dc3545', color: '#dc3545' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
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
            Showing {patients.length} of {pagination.total} patients
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
      
      {showModal && selectedPatient && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Patient Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <DetailValue>
                {selectedPatient?.firstName && selectedPatient?.lastName
                  ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                  : 'N/A'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Email:</DetailLabel>
              <DetailValue>{selectedPatient?.email || 'N/A'}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Phone:</DetailLabel>
              <DetailValue>
                {selectedPatient?.phone && selectedPatient.phone !== '0000000000'
                  ? selectedPatient.phone
                  : ''}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Blood Group:</DetailLabel>
              <DetailValue>{selectedPatient?.bloodGroup || 'Not specified'}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Date of Birth:</DetailLabel>
              <DetailValue>
                {selectedPatient?.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Gender:</DetailLabel>
              <DetailValue>Not available</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Address:</DetailLabel>
              <DetailValue>Not available</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Allergies:</DetailLabel>
              <DetailValue>
                {selectedPatient?.allergies && selectedPatient.allergies.length > 0
                  ? selectedPatient.allergies.join(', ')
                  : 'None'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Chronic Diseases:</DetailLabel>
              <DetailValue>
                {selectedPatient?.chronicDiseases && selectedPatient.chronicDiseases.length > 0
                  ? selectedPatient.chronicDiseases.join(', ')
                  : 'None'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Emergency Contact:</DetailLabel>
              <DetailValue>
                {selectedPatient?.emergencyContact?.name
                  ? `${selectedPatient.emergencyContact.name} (${selectedPatient.emergencyContact.relationship}) - ${selectedPatient.emergencyContact.phone && selectedPatient.emergencyContact.phone !== '0000000000' ? selectedPatient.emergencyContact.phone : ''}`
                  : 'Not specified'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Created:</DetailLabel>
              <DetailValue>
                {selectedPatient?.createdAt && new Date(selectedPatient.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Last Updated:</DetailLabel>
              <DetailValue>
                {selectedPatient?.updatedAt && new Date(selectedPatient.updatedAt).toLocaleDateString()}
              </DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {showEditModal && selectedPatient && (
        <EditPatientModal
          open={showEditModal}
          onClose={handleCloseEditModal}
          onUpdated={handleRefresh}
          patient={selectedPatient}
        />
      )}

      {showDeleteDialog && selectedPatient && (
        <DeletePatientDialog
          open={showDeleteDialog}
          patient={selectedPatient}
          onClose={handleCloseDeleteDialog}
          onDeleted={handleRefresh}
        />
      )}
    </div>
  );
};
