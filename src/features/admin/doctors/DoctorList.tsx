/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Doctor } from '../../../services/admin/doctors.service';
import { getDoctors, verifyDoctor, updateDoctorStatus } from '../../../services/admin/doctors.service';
import { ApiError } from '../../../services/auth/auth.service';

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
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDoctorsList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getDoctors({
        page,
        limit: pagination.limit
      });

      // Sort doctors by creation date (newest first)
      const sortedDoctors = response.data.users.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
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
  }, [pagination.limit]);

  useEffect(() => {
    fetchDoctorsList(pagination.page);
  }, [pagination.page, fetchDoctorsList, refreshKey]);

  const handleVerify = async (doctorId: string) => {
    try {
      setVerifyingId(doctorId);
      await verifyDoctor(doctorId);
      await fetchDoctorsList(pagination.page);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to verify doctor');
      }
      console.error('Error verifying doctor:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleToggleStatus = async (doctorId: string, isVerified: boolean) => {
    try {
      setStatusUpdatingId(doctorId);
      await updateDoctorStatus(doctorId, isVerified);
      await fetchDoctorsList(pagination.page);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update doctor status');
      }
      console.error('Error updating doctor status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
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
                      {!doctor.isVerified ? (
                        <ActionButton onClick={() => handleVerify(doctor.id)} disabled={verifyingId === doctor.id}>
                          {verifyingId === doctor.id ? 'Verifying...' : 'Verify'}
                        </ActionButton>
                      ) : (
                        <ActionButton onClick={() => handleToggleStatus(doctor.id, false)} disabled={statusUpdatingId === doctor.id}>
                          {statusUpdatingId === doctor.id ? 'Updating...' : 'Unverify'}
                        </ActionButton>
                      )}
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
    </div>
  );
};