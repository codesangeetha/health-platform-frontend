import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { getPharmacyOrders, updatePharmacyOrderStatus, getPharmacyOrderDetail, type Order, type MedicineStatusUpdate, type OrderDetail, type OrderDetailItem, validateMedicineStock, type StockValidationResult } from '../../../services/admin/pharmacy-dashboard.service';
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
  background-color: ${props => props.type === 'medicine' ? '#E8F5E8' : '#F3E5F5'};
  color: ${props => props.type === 'medicine' ? '#2E7D32' : '#7B1FA2'};
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

const SuccessBox = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
  border-radius: 4px;
  padding: 12px 16px;
  margin: 8px 0;
  font-size: 14px;
  font-weight: 500;
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

const SearchSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  color: #333333;
  background-color: #FFFFFF;
  cursor: pointer;

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

const StockIndicator = styled.span<{ stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'checking' }>`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
  background-color: ${props => {
    switch (props.stockStatus) {
      case 'in-stock': return '#D4EDDA';
      case 'low-stock': return '#FFF3CD';
      case 'out-of-stock': return '#F8D7DA';
      case 'checking': return '#E2E3E5';
      default: return '#E2E3E5';
    }
  }};
  color: ${props => {
    switch (props.stockStatus) {
      case 'in-stock': return '#155724';
      case 'low-stock': return '#856404';
      case 'out-of-stock': return '#721C24';
      case 'checking': return '#383D41';
      default: return '#383D41';
    }
  }};
`;

const PrintButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #28a745;
  background: transparent;
  color: #28a745;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;

  &:hover {
    background: #28a745;
    color: #FFFFFF;
  }
`;

interface Filters {
  patientName: string;
  amountMin: string;
  amountMax: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

const ORDER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' }
];

export const PharmacyOrdersList = ({ refreshKey = 0 }: { refreshKey?: number }) => {
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
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedStatusUpdateOrder, setSelectedStatusUpdateOrder] = useState<Order | null>(null);
  const [updateReason, setUpdateReason] = useState('');
  const [medicineStatuses, setMedicineStatuses] = useState<MedicineStatusUpdate[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingPreviousValues, setLoadingPreviousValues] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    patientName: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [stockValidations, setStockValidations] = useState<Map<string, StockValidationResult[]>>(new Map());
  const [loadingStockValidation, setLoadingStockValidation] = useState(false);

  const fetchOrders = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        patientName: filters.patientName || undefined,
        amountMin: filters.amountMin ? parseFloat(filters.amountMin) : undefined,
        amountMax: filters.amountMax ? parseFloat(filters.amountMax) : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        orderType: 'medicine' as const
      };

      const response = await getPharmacyOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch pharmacy orders');
      }
      console.error('Error fetching pharmacy orders:', err);
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
      patientName: '',
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(1);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page, fetchOrders, refreshKey]);

  const handleViewDetails = async (order: Order) => {
    try {
      setLoadingOrderDetail(true);
      setError(null);
      
      // Fetch detailed order information using the new API
      const response = await getPharmacyOrderDetail(order.orderId);
      setSelectedOrderDetail(response.data.order);
      setSelectedOrder(order);
      setShowModal(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch order details');
      }
      console.error('Error fetching order details:', err);
    } finally {
      setLoadingOrderDetail(false);
    }
  };
  
const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setSelectedOrderDetail(null);
    setLoadingOrderDetail(false);
  };

  const handleStatusUpdate = async (order: Order) => {
    setSelectedStatusUpdateOrder(order);
    setUpdateReason('');
    setError(null);
    
    // Validate stock for all medicines in the order
    try {
      setLoadingStockValidation(true);
      const stockValidations = await validateOrderStock(order);
      
      // Store validation results
      setStockValidations(prev => new Map(prev.set(order.orderId, stockValidations)));
      
      // Check if any medicines have insufficient stock
      const outOfStockMedicines = stockValidations.filter(v => !v.isValid && v.currentStock <= 0);
      const lowStockMedicines = stockValidations.filter(v => !v.isValid && v.currentStock > 0);
      
      if (outOfStockMedicines.length > 0) {
        const medicineNames = outOfStockMedicines.map(v => v.medicineName).join(', ');
        setError(`Cannot complete/cancel order. The following medicines are out of stock: ${medicineNames}. These medicines will be automatically set to skipped status.`);
      }
      
      if (lowStockMedicines.length > 0) {
        const medicineDetails = lowStockMedicines.map(v => `${v.medicineName} (Need: ${v.requiredQuantity}, Available: ${v.currentStock})`).join('; ');
        setError(`Warning: Insufficient stock for some medicines. ${medicineDetails}`);
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      setError('Warning: Could not verify stock availability for some medicines. Please check manually.');
    } finally {
      setLoadingStockValidation(false);
    }
    
    // For completed or cancelled orders, fetch previous update values from order detail API
    if (order.status === 'completed' || order.status === 'cancelled') {
      try {
        setLoadingPreviousValues(true);
        const response = await getPharmacyOrderDetail(order.orderId);
        const orderDetail = response.data.order;
        
        // Set smart default reason based on stock validation
        const newStockValidations = await validateOrderStock(order);
        const allSkippedDueToStock = newStockValidations.every(v => !v.isValid && v.currentStock <= 0);
        if (allSkippedDueToStock) {
          setUpdateReason('Order cancelled due to all medicines being out of stock');
        }
        
        // Initialize medicine statuses by matching the original order items with detail items
        // This ensures the order matches exactly for proper index-based mapping in the UI
        const initialStatuses: MedicineStatusUpdate[] = order.items.map((orderItem) => {
          // Find the corresponding detail item by matching medicine name
          const detailItem = orderDetail.medicineItems.find(
            item => item.medicineName === orderItem.medicineName
          );
          
          const validation = stockValidations.get(order.orderId)?.find(v => v.medicineName === orderItem.medicineName);
          const currentStock = validation?.currentStock ?? 0;
          
          // For out-of-stock items, always set to 'skipped' regardless of existing detail item status
          // This ensures consistency with stock validation and API requirements
          // Only allow 'completed' or 'skipped' - convert any other status to 'completed' as default
          let itemStatus: 'completed' | 'skipped';
          if (currentStock <= 0) {
            itemStatus = 'skipped';
          } else if (detailItem?.itemStatus === 'completed' || detailItem?.itemStatus === 'skipped') {
            itemStatus = detailItem.itemStatus;
          } else {
            itemStatus = 'completed'; // Default to 'completed' for any other status (including 'pending')
          }
          
          // Ensure we always use a real medicine ID, never fallback to medicine name
          if (!detailItem?.medicineId) {
            throw new Error(`Medicine ID not found for medicine: ${orderItem.medicineName}`);
          }
          
          return {
            medicineId: detailItem.medicineId,
            itemStatus: itemStatus
          };
        });
        
        // Set the reason from previous update if available
        setUpdateReason(orderDetail.reason || '');
        setMedicineStatuses(initialStatuses);
      } catch (err) {
        console.error('Error fetching previous update values:', err);
        // Fallback to default initialization if fetch fails
        // For pending/processing orders, we need to fetch order detail to get medicine IDs
        try {
          const fallbackDetailResponse = await getPharmacyOrderDetail(order.orderId);
          const fallbackOrderDetail = fallbackDetailResponse.data.order;
          
          const fallbackStatuses: MedicineStatusUpdate[] = order.items.map((item) => {
            const detailItem = fallbackOrderDetail.medicineItems.find(
              detail => detail.medicineName === item.medicineName
            );
            
            const validation = stockValidations.get(order.orderId)?.find(v => v.medicineName === item.medicineName);
            const currentStock = validation?.currentStock ?? 0;
            
            // For out-of-stock items, always set to 'skipped' to ensure consistency
            const itemStatus = currentStock <= 0 ? 'skipped' : 'completed';
            
            // Ensure we always use a real medicine ID, never fallback to medicine name
            if (!detailItem?.medicineId) {
              throw new Error(`Medicine ID not found for medicine: ${item.medicineName}`);
            }
            
            return {
              medicineId: detailItem.medicineId,
              itemStatus: itemStatus
            };
          });
          setMedicineStatuses(fallbackStatuses);
        } catch (fallbackError) {
          console.error('Error in fallback initialization:', fallbackError);
          setError('Unable to initialize medicine statuses. Please refresh the page and try again.');
          setMedicineStatuses([]);
        }
      } finally {
        setLoadingPreviousValues(false);
      }
    } else {
      // For pending/processing orders, initialize with default values
      // We need to fetch order detail to get proper medicine IDs
      try {
        const pendingOrderDetailResponse = await getPharmacyOrderDetail(order.orderId);
        const pendingOrderDetail = pendingOrderDetailResponse.data.order;
        
        const initialStatuses: MedicineStatusUpdate[] = order.items.map((item) => {
          const detailItem = pendingOrderDetail.medicineItems.find(
            detail => detail.medicineName === item.medicineName
          );
          
          const validation = stockValidations.get(order.orderId)?.find(v => v.medicineName === item.medicineName);
          const currentStock = validation?.currentStock ?? 0;
          
          // For out-of-stock items, always set to 'skipped' to ensure consistency with stock validation
          const itemStatus = currentStock <= 0 ? 'skipped' : 'completed';
          
          // Ensure we always use a real medicine ID, never fallback to medicine name
          if (!detailItem?.medicineId) {
            throw new Error(`Medicine ID not found for medicine: ${item.medicineName}`);
          }
          
          return {
            medicineId: detailItem.medicineId,
            itemStatus: itemStatus
          };
        });
        setMedicineStatuses(initialStatuses);
      } catch (pendingError) {
        console.error('Error initializing pending order statuses:', pendingError);
        setError('Unable to initialize medicine statuses. Please refresh the page and try again.');
        setMedicineStatuses([]);
      }
    }
    
    setShowStatusUpdateModal(true);
  };

  const closeStatusUpdateModal = () => {
    setShowStatusUpdateModal(false);
    setSelectedStatusUpdateOrder(null);
    setUpdateReason('');
    setMedicineStatuses([]);
    setSuccessMessage(null);
    setLoadingStockValidation(false);
  };

  const validateOrderStock = async (order: Order): Promise<StockValidationResult[]> => {
    setLoadingStockValidation(true);
    const validations: StockValidationResult[] = [];
    
    try {
      // Fetch order details to get proper medicine IDs
      const orderDetailResponse = await getPharmacyOrderDetail(order.orderId);
      const orderDetail = orderDetailResponse.data.order;
      
      for (const item of order.items) {
        try {
          // Find the corresponding detail item to get the real medicine ID
          const detailItem = orderDetail.medicineItems.find(
            detail => detail.medicineName === item.medicineName
          );
          
          const medicineId = detailItem?.medicineId;
          
          // Only validate stock if we have a valid medicine ID
          if (!medicineId) {
            validations.push({
              isValid: false,
              medicineId: item.medicineName,
              medicineName: item.medicineName,
              currentStock: 0,
              requiredQuantity: item.quantity,
              errorMessage: `Medicine ID not available for "${item.medicineName}"`
            });
            continue;
          }
          
          const validation = await validateMedicineStock(
            medicineId,
            item.medicineName,
            item.quantity
          );
          validations.push(validation);
        } catch (error) {
          console.warn(`Failed to validate stock for ${item.medicineName}:`, error);
          validations.push({
            isValid: false,
            medicineId: item.medicineName,
            medicineName: item.medicineName,
            currentStock: 0,
            requiredQuantity: item.quantity,
            errorMessage: `Could not verify stock for "${item.medicineName}"`
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch order details for stock validation:', error);
      // Fallback: create validation results without stock checking
      for (const item of order.items) {
        validations.push({
          isValid: false,
          medicineId: item.medicineName,
          medicineName: item.medicineName,
          currentStock: 0,
          requiredQuantity: item.quantity,
          errorMessage: `Could not fetch order details for stock validation`
        });
      }
    }
    
    setLoadingStockValidation(false);
    return validations;
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedStatusUpdateOrder || !updateReason.trim()) {
      setError('Please provide a reason for the status update');
      return;
    }

    if (medicineStatuses.length === 0) {
      setError('Please set status for all medicines');
      return;
    }

    // Check stock validations for medicines marked as completed
    const orderStockValidations = stockValidations.get(selectedStatusUpdateOrder.orderId);
    const invalidCompletedMedicines = medicineStatuses.filter(medStatus => {
      if (medStatus.itemStatus !== 'completed') return false;
      const validation = orderStockValidations?.find(v => v.medicineId === medStatus.medicineId);
      return validation && !validation.isValid && validation.currentStock <= 0;
    });

    if (invalidCompletedMedicines.length > 0) {
      const medicineNames = invalidCompletedMedicines.map(med => med.medicineId).join(', ');
      setError(`Cannot complete order. The following medicines are out of stock and must be marked as skipped: ${medicineNames}`);
      return;
    }

    try {
      setUpdatingStatus(true);
      setError(null);
      setSuccessMessage(null);

      // Sanitize medicineStatuses to ensure only valid itemStatus values are sent
      const sanitizedMedicineStatuses = medicineStatuses.map(med => ({
        medicineId: med.medicineId,
        itemStatus: (med.itemStatus === 'completed' || med.itemStatus === 'skipped') 
          ? med.itemStatus 
          : 'completed' // Default to 'completed' for any invalid status
      }));

      // Calculate final status based on medicine statuses - this should be 'cancelled' if all items are skipped
      const finalStatus = getFinalCalculatedStatus();

      await updatePharmacyOrderStatus(
        selectedStatusUpdateOrder.orderId,
        sanitizedMedicineStatuses,
        updateReason.trim()
      );

      // Refresh the orders list
      await fetchOrders(pagination.page);

      setSuccessMessage(`Order status updated to ${finalStatus} successfully!`);

      // Close modal after 2 seconds to show success message
      setTimeout(() => {
        closeStatusUpdateModal();
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update order status');
      }
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMedicineStatusChange = (medicineId: string, newStatus: 'completed' | 'skipped') => {
    // Validate that only valid status values are accepted
    const validStatus = (newStatus === 'completed' || newStatus === 'skipped') ? newStatus : 'completed';
    
    setMedicineStatuses(prev => 
      prev.map(med => 
        med.medicineId === medicineId 
          ? { ...med, itemStatus: validStatus }
          : med
      )
    );
  };

  const getFinalCalculatedStatus = () => {
    if (medicineStatuses.length === 0) return 'pending';
    const allSkipped = medicineStatuses.every(med => med.itemStatus === 'skipped');
    const atLeastOneCompleted = medicineStatuses.some(med => med.itemStatus === 'completed');
    return allSkipped ? 'cancelled' : (atLeastOneCompleted ? 'completed' : 'pending');
  };

  const getAllItemsSkipped = () => {
    return medicineStatuses.length > 0 && medicineStatuses.every(med => med.itemStatus === 'skipped');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePrintInvoice = async (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    // Fetch order details to get the latest item statuses
    let orderItems = order.items;
    let calculatedTotal = order.totalAmount;

    try {
      const response = await getPharmacyOrderDetail(order.orderId);
      const orderDetail = response.data.order;
      
      // Filter out skipped items and get only completed items for invoice
      const completedItems = orderDetail.medicineItems.filter(item => item.itemStatus === 'completed');
      
      if (completedItems.length > 0) {
        // Use completed items for invoice
        orderItems = completedItems.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: item.price
        }));
        
        // Recalculate total amount for completed items only
        calculatedTotal = completedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      }
    } catch (error) {
      console.warn('Could not fetch order details for invoice filtering:', error);
      // If we can't fetch details, show all items but still check for any obvious skipped items
      orderItems = order.items;
      calculatedTotal = order.totalAmount;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4A90E2;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4A90E2;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
          }
          .detail-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .detail-label {
            color: #666;
          }
          .detail-value {
            color: #333;
            font-weight: 500;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          .items-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          .items-table td {
            color: #666;
          }
          .total-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .total-final {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            border-top: 2px solid #4A90E2;
            padding-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              background-color: white;
            }
            .invoice-container {
              box-shadow: none;
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">HealthCare Pharmacy</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Order Information</h3>
              <div class="detail-row">
                <span class="detail-label">Invoice No:</span>
                <span class="detail-value">${order.orderId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${formatDate(order.orderDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Time:</span>
                <span class="detail-value">${formatTime(order.orderDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Patient Information</h3>
              <div class="detail-row">
                <span class="detail-label">Patient ID:</span>
                <span class="detail-value">${order.patientId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Patient Name:</span>
                <span class="detail-value">${order.patientName}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.quantity * item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(calculatedTotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax (0%):</span>
              <span>${formatCurrency(0)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total Amount:</span>
              <span>${formatCurrency(calculatedTotal)}</span>
            </div>
          </div>

          ${orderItems.length < order.items.length ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 6px;">
              <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 14px;">Note: Some items were not included in this invoice</h4>
              <p style="margin: 0; color: #856404; font-size: 12px;">
                ${order.items.length - orderItems.length} item(s) were excluded from this invoice due to being out of stock and marked as skipped.
              </p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing HealthCare Pharmacy!</p>
            <p>Generated on ${formatDate(new Date().toISOString())} at ${formatTime(new Date().toISOString())}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div>
      <SearchContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#333333', fontSize: '18px', fontWeight: '600' }}>Filter Pharmacy Orders</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', marginBottom: '16px' }}>
          <SearchField>
            <SearchLabel htmlFor="patientName">Patient Name</SearchLabel>
            <SearchInput
              id="patientName"
              type="text"
              placeholder="Enter patient name"
              value={filters.patientName}
              onChange={(e) => handleFilterChange('patientName', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="status">Status</SearchLabel>
            <SearchSelect
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {ORDER_STATUSES.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SearchSelect>
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="amountMin">Min Amount (₹)</SearchLabel>
            <SearchInput
              id="amountMin"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="amountMax">Max Amount (₹)</SearchLabel>
            <SearchInput
              id="amountMax"
              type="number"
              placeholder="1000"
              min="0"
              step="0.01"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="dateFrom">From Date</SearchLabel>
            <SearchInput
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </SearchField>

          <SearchField>
            <SearchLabel htmlFor="dateTo">To Date</SearchLabel>
            <SearchInput
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
                <Th>Medicine Details</Th>
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
                      Loading pharmacy orders...
                    </LoadingOverlay>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyStateMessage>
                      <EmptyStateText>No pharmacy orders found</EmptyStateText>
                      <EmptyStateSubtext>
                        {Object.values(filters).some(filter => filter !== '')
                          ? 'Try adjusting your filters to see more results'
                          : 'No pharmacy orders have been placed yet'}
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
                          <div style={{ fontWeight: '500' }}>{item.medicineName}</div>
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
                        View
                      </ActionButton>
                      <ActionButton onClick={() => handleStatusUpdate(order)}>
                        Update
                      </ActionButton>
                      {order.status === 'completed' && (
                        <PrintButton onClick={() => handlePrintInvoice(order)}>
                          Print Invoice
                        </PrintButton>
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
            Showing {orders.length} of {pagination.total} pharmacy orders
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
              <ModalTitle>Pharmacy Order Details</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            {loadingOrderDetail ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <LoadingSpinner />
                Loading order details...
              </div>
            ) : selectedOrderDetail ? (
              <>
                <DetailRow>
                  <DetailLabel>Order ID:</DetailLabel>
                  <DetailValue>{selectedOrderDetail.orderId}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Order Date:</DetailLabel>
                  <DetailValue>{formatDate(selectedOrderDetail.orderDate)}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Status:</DetailLabel>
                  <DetailValue>
                    <StatusBadge status={selectedOrderDetail.status}>
                      {selectedOrderDetail.status.charAt(0).toUpperCase() + selectedOrderDetail.status.slice(1)}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Total Amount:</DetailLabel>
                  <DetailValue style={{ fontWeight: 'bold' }}>
                    {formatCurrency(selectedOrderDetail.totalAmount)}
                  </DetailValue>
                </DetailRow>

                <DetailRow>
                  <DetailLabel>Delivery Method:</DetailLabel>
                  <DetailValue>{selectedOrderDetail.deliveryMethod}</DetailValue>
                </DetailRow>



                {selectedOrderDetail.reason && (
                  <DetailRow>
                    <DetailLabel>Reason:</DetailLabel>
                    <DetailValue>{selectedOrderDetail.reason}</DetailValue>
                  </DetailRow>
                )}



                <DetailRow>
                  <DetailLabel>Medicine Items:</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailRow>
                <ItemsList>
                  {selectedOrderDetail.medicineItems.map((item, index) => (
                    <ItemRow key={index}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{item.medicineName}</div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                        {item.medicineDetails?.description && (
                          <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
                            {item.medicineDetails.description}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '500' }}>
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                        {item.itemStatus && (
                          <StatusBadge status={item.itemStatus}>
                            {item.itemStatus.charAt(0).toUpperCase() + item.itemStatus.slice(1)}
                          </StatusBadge>
                        )}
                      </div>
                    </ItemRow>
                  ))}
                </ItemsList>
              </>
            ) : (
              // Fallback to basic order data if detail fetch fails
              <>
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
                  <DetailLabel>Medicine Items:</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailRow>
                <ItemsList>
                  {selectedOrder.items.map((item, index) => (
                    <ItemRow key={index}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{item.medicineName}</div>
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
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {showStatusUpdateModal && selectedStatusUpdateOrder && (
        <ModalOverlay onClick={closeStatusUpdateModal}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Update Order Status</ModalTitle>
              <CloseButton onClick={closeStatusUpdateModal}>&times;</CloseButton>
            </ModalHeader>

            {loadingStockValidation && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingSpinner />
                Checking medicine stock availability...
              </div>
            )}

            {loadingPreviousValues && !loadingStockValidation && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingSpinner />
                Loading previous update values...
              </div>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessBox>{successMessage}</SuccessBox>}

            {!loadingStockValidation && !loadingPreviousValues && !successMessage && (
              <>
                <DetailRow>
                  <DetailLabel>Order ID:</DetailLabel>
                  <DetailValue>{selectedStatusUpdateOrder.orderId}</DetailValue>
                </DetailRow>

                <DetailRow>
                  <DetailLabel>Current Status:</DetailLabel>
                  <DetailValue>
                    <StatusBadge status={selectedStatusUpdateOrder.status}>
                      {selectedStatusUpdateOrder.status.charAt(0).toUpperCase() + selectedStatusUpdateOrder.status.slice(1)}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>

                <DetailRow>
                  <DetailLabel>Medicine Status:</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailRow>
                
                <ItemsList>
                  {selectedStatusUpdateOrder.items.map((item, index) => {
                    // Use index-based mapping since we've ensured the medicineStatuses array
                    // matches the order of items in selectedStatusUpdateOrder.items
                    const medicineStatus = medicineStatuses[index];
                    
                    // Ensure we have a valid medicine status with real ID
                    if (!medicineStatus) {
                      console.error(`Missing medicine status for item at index ${index}:`, item);
                      return (
                        <ItemRow key={index}>
                          <div style={{ flex: 1, color: 'red' }}>
                            <div style={{ fontWeight: '500' }}>{item.medicineName}</div>
                            <div style={{ fontSize: '12px' }}>Error: Missing medicine status</div>
                          </div>
                          <div></div>
                        </ItemRow>
                      );
                    }
                    
                    // Validate that we have a real medicine ID (not a medicine name)
                    if (!medicineStatus.medicineId || medicineStatus.medicineId === item.medicineName) {
                      console.error(`Invalid medicine ID for item ${item.medicineName}:`, medicineStatus.medicineId);
                      return (
                        <ItemRow key={index}>
                          <div style={{ flex: 1, color: 'red' }}>
                            <div style={{ fontWeight: '500' }}>{item.medicineName}</div>
                            <div style={{ fontSize: '12px' }}>Error: Invalid medicine ID</div>
                          </div>
                          <div></div>
                        </ItemRow>
                      );
                    }
                    
                    // Get stock validation for this medicine
                    const stockValidation = stockValidations.get(selectedStatusUpdateOrder.orderId)
                      ?.find(v => v.medicineId === medicineStatus.medicineId);
                    
                    // Determine stock status
                    let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'checking' = 'checking';
                    let stockInfo = '';
                    let isDisabled = false;
                    
                    if (stockValidation) {
                      if (stockValidation.currentStock <= 0) {
                        stockStatus = 'out-of-stock';
                        stockInfo = `Out of stock`;
                        isDisabled = true; // Disable completion for out of stock items
                      } else if (stockValidation.currentStock < item.quantity) {
                        stockStatus = 'low-stock';
                        stockInfo = `Low stock (${stockValidation.currentStock} available)`;
                        isDisabled = false; // Allow completion but warn
                      } else {
                        stockStatus = 'in-stock';
                        stockInfo = `${stockValidation.currentStock} in stock`;
                        isDisabled = false;
                      }
                    }
                    
                    return (
                      <ItemRow key={index}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                            {item.medicineName}
                            <StockIndicator stockStatus={stockStatus}>
                              {stockInfo}
                            </StockIndicator>
                          </div>
                          <div style={{ fontSize: '12px', color: '#666666' }}>
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </div>
                          {stockValidation?.errorMessage && (
                            <div style={{ fontSize: '11px', color: '#721C24', marginTop: '2px' }}>
                              {stockValidation.errorMessage}
                            </div>
                          )}
                        </div>
                        <div>
                          <SearchSelect
                            value={medicineStatus.itemStatus}
                            onChange={(e) => {
                              // Update the medicineStatus at the same index
                              const newMedicineStatuses = [...medicineStatuses];
                              newMedicineStatuses[index] = {
                                ...newMedicineStatuses[index],
                                itemStatus: e.target.value as 'completed' | 'skipped'
                              };
                              setMedicineStatuses(newMedicineStatuses);
                            }}
                            style={{ width: '120px' }}
                            disabled={isDisabled && medicineStatus.itemStatus !== 'skipped'}
                          >
                            <option value="completed">Completed</option>
                            <option value="skipped">Skipped</option>
                          </SearchSelect>
                          {isDisabled && stockStatus === 'out-of-stock' && (
                            <div style={{ fontSize: '10px', color: '#721C24', marginTop: '2px', textAlign: 'center' }}>
                              Auto-skipped (out of stock)
                            </div>
                          )}
                        </div>
                      </ItemRow>
                    );
                  })}
                </ItemsList>

                <DetailRow>
                  <DetailLabel>Final Status:</DetailLabel>
                  <DetailValue>
                    <StatusBadge status={getFinalCalculatedStatus()}>
                      {getFinalCalculatedStatus().charAt(0).toUpperCase() + getFinalCalculatedStatus().slice(1)}
                    </StatusBadge>
                    {getAllItemsSkipped() && (
                      <div style={{ fontSize: '12px', color: '#721C24', marginTop: '4px' }}>
                        All items are skipped - Order will be cancelled
                      </div>
                    )}
                  </DetailValue>
                </DetailRow>

                <DetailRow>
                  <DetailLabel>Reason *</DetailLabel>
                  <DetailValue>
                    <SearchInput
                      id="reasonInput"
                      type="text"
                      placeholder="Enter reason for status update"
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </DetailValue>
                </DetailRow>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <SearchButton
                    onClick={handleUpdateOrderStatus}
                    disabled={updatingStatus || !updateReason.trim()}
                  >
                    {updatingStatus ? 'Updating...' : `Update Order`}
                  </SearchButton>
                  <ResetButton onClick={closeStatusUpdateModal}>
                    Cancel
                  </ResetButton>
                </div>
              </>
            )}
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