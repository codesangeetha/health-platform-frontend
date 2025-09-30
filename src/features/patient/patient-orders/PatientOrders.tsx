/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { PatientService } from '../../../services/patient/patient.service';
import { ApiError } from '../../../services/auth/auth.service';
import type { PatientOrder, PatientOrdersRequest } from '../../../types/order/order.types';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    primary: "#3E7BFA",
    secondary: "#5CB85C",
    background: "#F7F7F7",
    cardBackground: "#FFFFFF",
    textPrimary: "#333333",
    textSecondary: "#6C757D",
    text_dark: "#333333",
    text_light: "#6C757D",
    background_light: "#F7F7F7",
    background_white: "#FFFFFF",
    border: "#CCCCCC",
    status_confirmed: "#5CB85C",
    status_pending: "#F59E0B",
    status_processing: "#3B82F6",
    status_shipped: "#8B5CF6",
    status_delivered: "#10B981",
    status_cancelled: "#EF4444"
  },
  typography: {
    font_family: "Sans-serif",
    font_size_xs: "0.75rem",
    font_size_sm: "0.875rem",
    font_size_base: "1rem",
    font_size_lg: "1.125rem",
    font_size_xl: "1.25rem",
    font_size_2xl: "1.5rem",
    font_size_3xl: "1.875rem",
    font_size_4xl: "2.25rem",
    font_weight_normal: "400",
    font_weight_medium: "500",
    font_weight_semibold: "600",
    font_weight_bold: "700"
  },
  layout: {
    maxWidth: "1200px",
    spacing: {
      padding: "20px 40px",
      gap: "20px"
    }
  }
};

const PageContainer = styled.div`
  max-width: ${DESIGN_SYSTEM.layout.maxWidth};
  margin: 0 auto;
  padding: ${DESIGN_SYSTEM.layout.spacing.padding};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  background: ${DESIGN_SYSTEM.colors.background};
  min-height: 100vh;
`;

const Header = styled.header`
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${DESIGN_SYSTEM.colors.border};
`;

const Title = styled.h1`
  font-size: ${DESIGN_SYSTEM.typography.font_size_3xl};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${DESIGN_SYSTEM.colors.text_light};
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 6px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  outline: none;
  width: 350px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
  }

  &::placeholder {
    color: ${DESIGN_SYSTEM.colors.textSecondary};
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 6px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  outline: none;
  background: ${DESIGN_SYSTEM.colors.background_white};
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 120px;

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 32px;
`;

const OrderCard = styled.div`
  background: ${DESIGN_SYSTEM.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  transition: box-shadow 0.2s ease;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const PharmacyIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3E7BFA, #2563EB);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.h3`
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_semibold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  margin: 0 0 4px 0;
`;

const OrderDate = styled.span`
  color: ${DESIGN_SYSTEM.colors.textSecondary};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
`;

const OrderTopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 10px;
  border-radius: 16px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_xs};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#FEF3C7';
      case 'confirmed': return '#D1FAE5';
      case 'processing': return '#FEF3C7';
      case 'shipped': return '#E0E7FF';
      case 'delivered': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#E5E7EB';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400E';
      case 'confirmed': return '#065F46';
      case 'processing': return '#92400E';
      case 'shipped': return '#3730A3';
      case 'delivered': return '#065F46';
      case 'cancelled': return '#991B1B';
      default: return '#6B7280';
    }
  }};

  border: 1px solid ${props => {
    switch (props.status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#10B981';
      case 'processing': return '#F59E0B';
      case 'shipped': return '#6366F1';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#D1D5DB';
    }
  }};
`;

const TotalAmount = styled.span`
  font-size: ${DESIGN_SYSTEM.typography.font_size_lg};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
`;

const OrderContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const OrderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  margin: 0;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OrderItem = styled.div`
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &::before {
    content: "•";
    color: ${DESIGN_SYSTEM.colors.primary};
    font-weight: bold;
    margin-top: 2px;
  }
`;

const AddressInfo = styled.div`
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  line-height: 1.4;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  gap: 16px;
`;

const DeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  color: ${DESIGN_SYSTEM.colors.textSecondary};
`;

const DeliveryIcon = styled.span`
  color: #F59E0B;
`;

const PharmacyContact = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  color: ${DESIGN_SYSTEM.colors.textSecondary};
`;

const PhoneIcon = styled.span`
  color: ${DESIGN_SYSTEM.colors.primary};
`;

const ViewDetailsButton = styled.button`
  padding: 8px 16px;
  background: ${DESIGN_SYSTEM.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2563EB;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
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

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 16px 0;
  background-color: #FFEBEE;
  color: #D32F2F;
  border-radius: 4px;
  border: 1px solid #FFCDD2;
`;

const NoOrders = styled.div`
  text-align: center;
  padding: 60px;
  color: #666666;
`;

const NoOrdersIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PageInfo = styled.span`
  color: #666666;
  font-size: 14px;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 16px;
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

export const PatientOrders = () => {
  const [orders, setOrders] = useState<PatientOrder[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOrders = useCallback(async (params: PatientOrdersRequest = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await PatientService.getPatientOrders({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        status: params.status || statusFilter || undefined,
        ...params
      });

      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch orders');
      }
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage: number) => {
    fetchOrders({ page: newPage });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchOrders({ status: status || undefined, page: 1 });
  };

  const handleSearch = () => {
    // For now, we'll filter on the client side
    // In a real app, you might want to implement server-side search
    if (searchQuery.trim()) {
      fetchOrders({ page: 1 });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.items.some(item => item.medicineName.toLowerCase().includes(query)) ||
      order.deliveryAddress.city.toLowerCase().includes(query) ||
      order.deliveryAddress.state.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>My Orders</Title>
        <Subtitle>Track and manage your medicine orders</Subtitle>
      </Header>

      <ControlsContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search orders by ID, medicine, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <FilterSelect
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        </SearchContainer>
      </ControlsContainer>

      {loading ? (
        <LoadingOverlay>
          <LoadingSpinner />
          Loading orders...
        </LoadingOverlay>
      ) : filteredOrders.length === 0 ? (
        <NoOrders>
          <NoOrdersIcon>📦</NoOrdersIcon>
          <h3>No orders found</h3>
          <p>
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'You haven\'t placed any orders yet.'}
          </p>
        </NoOrders>
      ) : (
        <>
          <OrdersGrid>
            {filteredOrders.map(order => (
              <OrderCard key={order.orderId}>
                <OrderHeader>
                  <PharmacyIcon>💊</PharmacyIcon>
                  <OrderInfo>
                    <OrderId>Pharmacy Order #{order.orderId.slice(-8).toUpperCase()}</OrderId>
                    <OrderDate>Ordered on {formatDate(order.orderDate)}</OrderDate>
                  </OrderInfo>
                  <OrderTopRight>
                    <StatusBadge status={order.status}>
                      {order.status}
                    </StatusBadge>
                    <TotalAmount>{formatCurrency(order.totalAmount)}</TotalAmount>
                  </OrderTopRight>
                </OrderHeader>

                <OrderContent>
                  <OrderSection>
                    <SectionTitle>Items:</SectionTitle>
                    <ItemsList>
                      {order.items.map((item, index) => (
                        <OrderItem key={index}>
                          {item.medicineName} ({item.quantity} {item.quantity === 1 ? 'box' : 'boxes'})
                        </OrderItem>
                      ))}
                    </ItemsList>
                  </OrderSection>

                  <OrderSection>
                    <SectionTitle>Delivery Address:</SectionTitle>
                    <AddressInfo>
                      {order.deliveryAddress.street}<br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state}
                    </AddressInfo>
                  </OrderSection>
                </OrderContent>

                <OrderFooter>
                  <DeliveryInfo>
                    <DeliveryIcon>🚚</DeliveryIcon>
                    <span>Est. delivery: {formatDate(order.orderDate)}</span>
                    <PharmacyContact>
                      <PhoneIcon>📞</PhoneIcon>
                      <span>Pharmacy: (555) 123-4567</span>
                    </PharmacyContact>
                  </DeliveryInfo>
                </OrderFooter>
              </OrderCard>
            ))}
          </OrdersGrid>

          {pagination.totalPages > 1 && (
            <PaginationContainer>
              <PageInfo>
                Showing {filteredOrders.length} of {pagination.total} orders
              </PageInfo>
              <div>
                <PaginationButton
                  disabled={pagination.page === 1 || loading}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </PaginationButton>
                <span style={{ margin: '0 12px', color: '#666' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <PaginationButton
                  disabled={pagination.page === pagination.totalPages || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </PaginationButton>
              </div>
            </PaginationContainer>
          )}
        </>
      )}
    </PageContainer>
  );
};