/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { getOrders } from '../../../services/admin/lab-test-orders.service';
import type { Order, OrdersRequest } from '../../../services/admin/lab-test-orders.service';
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#FFF3CD';
      case 'confirmed': return '#D1ECF1';
      case 'processing': return '#D4EDDA';
      case 'completed': return '#D4EDDA';
      case 'cancelled': return '#F8D7DA';
      case 'shipped': return '#D1ECF1';
      case 'delivered': return '#D4EDDA';
      default: return '#E2E3E5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'confirmed': return '#0C5460';
      case 'processing': return '#155724';
      case 'completed': return '#155724';
      case 'cancelled': return '#721C24';
      case 'shipped': return '#0C5460';
      case 'delivered': return '#155724';
      default: return '#383D41';
    }
  }};
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.type === 'lab_test' ? '#E3F2FD' : '#F3E5F5'};
  color: ${props => props.type === 'lab_test' ? '#1565C0' : '#7B1FA2'};
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

const ItemsList = styled.div`
  background: #F8F9FA;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #E0E0E0;

  &:last-child {
    border-bottom: none;
  }
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

export const LabTestOrdersList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    patientId: '',
    status: '',
    orderType: 'lab_test',
    startDate: '',
    endDate: ''
  });

  const fetchOrders = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params: OrdersRequest = {
        page,
        limit: pagination.limit,
        ...filters,
        orderType: 'lab_test' // Only fetch lab test orders
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key as keyof OrdersRequest] === '') {
          delete params[key as keyof OrdersRequest];
        }
      });

      const response = await getOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch lab test orders');
      }
      console.error('Error fetching lab test orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(1);
  };

  const handleReset = () => {
    setFilters({
      patientId: '',
      status: '',
      orderType: 'lab_test',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page, fetchOrders, refreshKey]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <SearchContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#333333', fontSize: '18px', fontWeight: '600' }}>Filter Lab Test Orders</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', marginBottom: '16px' }}>
          <SearchField>
            <SearchLabel htmlFor="patientId">Patient ID</SearchLabel>
            <SearchInput
              id="patientId"
              type="text"
              placeholder="Enter patient ID"
              value={filters.patientId}
              onChange={(e) => handleFilterChange('patientId', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="status">Status</SearchLabel>
            <SearchInput
              id="status"
              type="text"
              placeholder="e.g., pending, confirmed"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="startDate">Start Date</SearchLabel>
            <SearchInput
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="endDate">End Date</SearchLabel>
            <SearchInput
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
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
                <Th>Order ID</Th>
                <Th>Patient</Th>
                <Th>Test Details</Th>
                <Th>Order Date</Th>
                <Th>Status</Th>
                <Th>Total Amount</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingOverlay>
                      <LoadingSpinner />
                      Loading lab test orders...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyStateMessage>
                      <EmptyStateText>No lab test orders found</EmptyStateText>
                      <EmptyStateSubtext>
                        {Object.values(filters).some(filter => filter !== '')
                          ? 'Try adjusting your filters to see more results'
                          : 'No lab test orders have been placed yet'}
                      </EmptyStateSubtext>
                    </EmptyStateMessage>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.orderId}>
                    <Td>
                      <div style={{ fontWeight: '500', color: '#333333' }}>
                        {order.orderId}
                      </div>
                    </Td>
                    <Td>
                      <div>
                        <div style={{ fontWeight: '500', color: '#333333' }}>
                          {order.patientName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>
                          {order.patientId}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          <div style={{ fontWeight: '500' }}>{item.labTestName}</div>
                          <div style={{ fontSize: '12px', color: '#666666' }}>
                            Quantity: {item.quantity} | {formatCurrency(item.price)}
                          </div>
                        </div>
                      ))}
                    </Td>
                    <Td>{formatDate(order.orderDate)}</Td>
                    <Td>
                      <StatusBadge status={order.status}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </StatusBadge>
                    </Td>
                    <Td style={{ fontWeight: '500', color: '#333333' }}>
                      {formatCurrency(order.totalAmount)}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(order)}>
                        View Details
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
            Showing {orders.length} of {pagination.total} lab test orders
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
      
      {showModal && selectedOrder && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Lab Test Order Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <DetailRow>
              <DetailLabel>Order ID:</DetailLabel>
              <DetailValue>{selectedOrder.orderId}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Patient Name:</DetailLabel>
              <DetailValue>{selectedOrder.patientName}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Patient ID:</DetailLabel>
              <DetailValue>{selectedOrder.patientId}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Order Date:</DetailLabel>
              <DetailValue>{formatDate(selectedOrder.orderDate)}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusBadge status={selectedOrder.status}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </StatusBadge>
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Total Amount:</DetailLabel>
              <DetailValue style={{ fontWeight: 'bold' }}>
                {formatCurrency(selectedOrder.totalAmount)}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Delivery Address:</DetailLabel>
              <DetailValue>
                {selectedOrder.deliveryAddress.street}<br />
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Test Items:</DetailLabel>
              <DetailValue></DetailValue>
            </DetailRow>
            <ItemsList>
              {selectedOrder.items.map((item, index) => (
                <ItemRow key={index}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.labTestName}</div>
                    <div style={{ fontSize: '12px', color: '#666666' }}>
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </ItemRow>
              ))}
            </ItemsList>
            
            <DetailRow>
              <DetailLabel>Created At:</DetailLabel>
              <DetailValue>{formatDate(selectedOrder.createdAt)}</DetailValue>
            </DetailRow>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </div>
  );
};