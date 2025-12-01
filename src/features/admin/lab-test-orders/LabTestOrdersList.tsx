import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { getOrders, updateLabTestOrderStatus, getLabTestOrderById } from '../../../services/admin/lab-test-orders.service';
import type { TestResult } from '../../../services/admin/lab-test-orders.service';
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
  max-width: 700px;
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

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

const PrintResultButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #17a2b8;
  background: transparent;
  color: #17a2b8;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;

  &:hover {
    background: #17a2b8;
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

interface LabTestDetails {
  _id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LabTestItem {
  testName: string;
  price: number;
  labTestId: string;
  labTestDetails: LabTestDetails;
}

interface DetailedLabTestOrder {
  orderId: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  testItems: LabTestItem[];
  collectionMethod: string;
  scheduledDate: string;
  prescriptionId: string | object;
  reason?: string;
  resultData?: Record<string, string>;
  completedDate?: string;
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
  const [selectedOrder, setSelectedOrder] = useState<DetailedLabTestOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedStatusUpdateOrder, setSelectedStatusUpdateOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'completed' | 'cancelled'>('completed');
  const [updateReason, setUpdateReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    patientName: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  const fetchOrders = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params: OrdersRequest = {
        page,
        limit: pagination.limit,
        patientName: filters.patientName || undefined,
        amountMin: filters.amountMin ? parseFloat(filters.amountMin) : undefined,
        amountMax: filters.amountMax ? parseFloat(filters.amountMax) : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        orderType: 'lab_test'
      };

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
      setError(null);
      setLoading(true);
      
      // Fetch detailed order information
      const response = await getLabTestOrderById(order.orderId);
      const detailedOrder = response.data.order as DetailedLabTestOrder;
      
      setSelectedOrder(detailedOrder);
      setShowModal(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch order details');
      }
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (order: Order) => {
    setSelectedStatusUpdateOrder(order);
    setUpdateReason('');
    setUpdateStatus('completed');
    setTestResults([]);
    
    // Fetch order details to get labTestIds
    try {
      const response = await getLabTestOrderById(order.orderId);
      setOrderDetails(response.data.order);
      
      // Initialize test results for each test item
      const initialResults: TestResult[] = response.data.order.testItems.map((item: any) => ({
        labTestId: item.labTestId,
        testResult: ''
      }));
      setTestResults(initialResults);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to fetch order details');
    }
    
    setShowStatusUpdateModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

const closeStatusUpdateModal = () => {
    setShowStatusUpdateModal(false);
    setSelectedStatusUpdateOrder(null);
    setUpdateReason('');
    setUpdateStatus('completed');
    setSuccessMessage(null);
    setTestResults([]);
    setOrderDetails(null);
  };

  const handleTestResultChange = (index: number, value: string) => {
    setTestResults(prev => 
      prev.map((result, i) => 
        i === index ? { ...result, testResult: value } : result
      )
    );
  };

const handleUpdateOrderStatus = async () => {
    if (!selectedStatusUpdateOrder || !updateReason.trim()) {
      setError('Please provide a reason for the status update');
      return;
    }

    // Validate test results when status is completed
    if (updateStatus === 'completed') {
      const emptyResults = testResults.filter(result => !result.testResult.trim());
      if (emptyResults.length > 0) {
        setError('Please provide results for all tests');
        return;
      }
    }

    try {
      setUpdatingStatus(true);
      setError(null);
      setSuccessMessage(null);

      const updateData = {
        status: updateStatus,
        reason: updateReason.trim(),
        result: updateStatus === 'completed' ? testResults : undefined
      };

      await updateLabTestOrderStatus(
        selectedStatusUpdateOrder.orderId,
        updateData
      );

      // Refresh the orders list
      await fetchOrders(pagination.page);
      
      setSuccessMessage(`Order status updated to ${updateStatus} successfully!`);

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

  const handlePrintInvoice = async (order: Order) => {
    try {
      setError(null);
      
      // Fetch detailed order information
      const response = await getLabTestOrderById(order.orderId);
      const detailedOrder = response.data.order as DetailedLabTestOrder;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError('Unable to open print window. Please check your browser settings.');
        return;
      }

      // Generate invoice HTML
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lab Test Invoice - ${detailedOrder.orderId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4A90E2;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #4A90E2;
              margin: 0;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-section {
              width: 48%;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #4A90E2;
              border-bottom: 1px solid #E0E0E0;
              padding-bottom: 5px;
            }
            .info-row {
              margin-bottom: 5px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #E0E0E0;
              padding: 10px;
              text-align: left;
            }
            .items-table th {
              background-color: #F8F9FA;
              font-weight: bold;
              color: #4A90E2;
            }
            .items-table td:last-child {
              text-align: right;
            }
            .total-section {
              margin-top: 30px;
              text-align: right;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              color: #4A90E2;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              border-top: 1px solid #E0E0E0;
              padding-top: 20px;
            }
            .status-completed {
              background-color: #D4EDDA;
              color: #155724;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lab Test Invoice</h1>
            <p>Health Platform Laboratory Services</p>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="label">Order ID:</span>
                ${detailedOrder.orderId}
              </div>
              <div class="info-row">
                <span class="label">Order Date:</span>
                ${formatDate(detailedOrder.orderDate)}
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="status-completed">Completed</span>
              </div>
              ${detailedOrder.completedDate ? `
                <div class="info-row">
                  <span class="label">Completed Date:</span>
                  ${formatDate(detailedOrder.completedDate)}
                </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Collection Method:</span>
                ${detailedOrder.collectionMethod === 'lab_visit' ? 'Lab Visit' : detailedOrder.collectionMethod}
              </div>
              <div class="info-row">
                <span class="label">Scheduled Date:</span>
                ${formatDate(detailedOrder.scheduledDate)}
              </div>
            </div>

            <div class="info-section">
              <h3>Test Information</h3>
              <div class="info-row">
                <span class="label">Total Tests:</span>
                ${detailedOrder.testItems.length}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${detailedOrder.testItems.map(item => `
                <tr>
                  <td>${item.testName}</td>
                  <td>${item.labTestDetails.description}</td>
                  <td>${formatCurrency(item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              Total Amount: ${formatCurrency(detailedOrder.totalAmount)}
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing our laboratory services!</p>
            <p>For any queries, please contact us at support@healthplatform.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      // Write the HTML to the new window and print
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to generate invoice');
      }
      console.error('Error generating invoice:', err);
    }
  };

  const handlePrintResult = async (order: DetailedLabTestOrder) => {
    try {
      setError(null);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError('Unable to open print window. Please check your browser settings.');
        return;
      }

      // Generate lab test result HTML
      const resultHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lab Test Results - ${order.orderId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4A90E2;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #4A90E2;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .report-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-section {
              width: 48%;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #4A90E2;
              border-bottom: 1px solid #E0E0E0;
              padding-bottom: 5px;
              font-size: 16px;
            }
            .info-row {
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 130px;
            }
            .results-section {
              margin: 30px 0;
            }
            .results-section h3 {
              margin: 0 0 15px 0;
              color: #4A90E2;
              border-bottom: 2px solid #E0E0E0;
              padding-bottom: 8px;
              font-size: 18px;
            }
            .test-result {
              border: 1px solid #E0E0E0;
              border-radius: 6px;
              margin-bottom: 20px;
              overflow: hidden;
            }
            .test-header {
              background-color: #F8F9FA;
              padding: 12px 16px;
              border-bottom: 1px solid #E0E0E0;
            }
            .test-name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin: 0;
            }
            .test-description {
              font-size: 12px;
              color: #666;
              margin: 4px 0 0 0;
            }
            .test-result-value {
              padding: 16px;
              font-size: 14px;
            }
            .result-label {
              font-weight: 600;
              color: #4A90E2;
              margin-bottom: 8px;
            }
            .result-value {
              background-color: #F8F9FA;
              padding: 12px;
              border-radius: 4px;
              border-left: 4px solid #28a745;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
            .no-results {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
              background-color: #F8F9FA;
              border-radius: 4px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              border-top: 1px solid #E0E0E0;
              padding-top: 20px;
            }
            .report-status {
              background-color: #D4EDDA;
              color: #155724;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              display: inline-block;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LABORATORY TEST RESULTS</h1>
            <p>Health Platform Laboratory Services</p>
            <p>Accredited Testing Facility</p>
          </div>

          <div class="report-info">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="label">Order ID:</span>
                ${order.orderId}
              </div>
              <div class="info-row">
                <span class="label">Order Date:</span>
                ${formatDate(order.orderDate)}
              </div>
              <div class="info-row">
                <span class="label">Collection Method:</span>
                ${order.collectionMethod === 'lab_visit' ? 'Lab Visit' : order.collectionMethod}
              </div>
              <div class="info-row">
                <span class="label">Scheduled Date:</span>
                ${formatDate(order.scheduledDate)}
              </div>
            </div>

            <div class="info-section">
              <h3>Report Information</h3>
              <div class="info-row">
                <span class="label">Completed Date:</span>
                ${order.completedDate ? formatDate(order.completedDate) : 'N/A'}
              </div>
              <div class="info-row">
                <span class="label">Report Status:</span>
                <span class="report-status">FINAL REPORT</span>
              </div>
              <div class="info-row">
                <span class="label">Total Tests:</span>
                ${order.testItems.length}
              </div>
            </div>
          </div>

          <div class="results-section">
            <h3>TEST RESULTS</h3>
            
            ${order.testItems && order.testItems.length > 0 ? 
              order.testItems.map((item, index) => {
                const resultValue = order.resultData && order.resultData[item.testName] ? 
                  order.resultData[item.testName] : 'Results not available';
                
                return `
                  <div class="test-result">
                    <div class="test-header">
                      <h4 class="test-name">Test ${index + 1}: ${item.testName}</h4>
                      <p class="test-description">${item.labTestDetails.description}</p>
                    </div>
                    <div class="test-result-value">
                      <div class="result-label">Test Result:</div>
                      <div class="result-value">${resultValue}</div>
                    </div>
                  </div>
                `;
              }).join('')
              : '<div class="no-results">No test results available</div>'
            }
          </div>

          <div class="footer">
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            <p>This report contains confidential patient information</p>
            <p>For any queries, please contact our laboratory at lab@healthplatform.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      // Write the HTML to the new window and print
      printWindow.document.write(resultHTML);
      printWindow.document.close();
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to generate test results');
      }
      console.error('Error generating test results:', err);
    }
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

  return (
    <div>
      <SearchContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#333333', fontSize: '18px', fontWeight: '600' }}>Filter Lab Test Orders</h3>
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
    View
  </ActionButton>
  {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
    <ActionButton onClick={() => handleStatusUpdate(order)}>
      Update
    </ActionButton>
  )}
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
              <ModalActions>
                {selectedOrder.status === 'completed' && (
                  <PrintResultButton onClick={() => handlePrintResult(selectedOrder)}>
                    Print Result
                  </PrintResultButton>
                )}
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalActions>
            </ModalHeader>
            
            <DetailRow>
              <DetailLabel>Order ID:</DetailLabel>
              <DetailValue>{selectedOrder.orderId}</DetailValue>
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
              <DetailLabel>Collection Method:</DetailLabel>
              <DetailValue>
                {selectedOrder.collectionMethod === 'lab_visit' ? 'Lab Visit' : selectedOrder.collectionMethod}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Scheduled Date:</DetailLabel>
              <DetailValue>{formatDate(selectedOrder.scheduledDate)}</DetailValue>
            </DetailRow>

            {selectedOrder.completedDate && (
              <DetailRow>
                <DetailLabel>Completed Date:</DetailLabel>
                <DetailValue>{formatDate(selectedOrder.completedDate)}</DetailValue>
              </DetailRow>
            )}
            
            <DetailRow>
              <DetailLabel>Test Items:</DetailLabel>
              <DetailValue></DetailValue>
            </DetailRow>
            <ItemsList>
              {selectedOrder.testItems.map((item, index) => (
                <ItemRow key={index}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.testName}</div>
                    <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                      {item.labTestDetails.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666666' }}>
                      Price: {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '500' }}>
                    {formatCurrency(item.price)}
                  </div>
                </ItemRow>
              ))}
            </ItemsList>

            {selectedOrder.resultData && Object.keys(selectedOrder.resultData).length > 0 && (
              <>
                <DetailRow>
                  <DetailLabel>Test Results:</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailRow>
                <ItemsList>
                  {Object.entries(selectedOrder.resultData).map(([testName, result], index) => (
                    <ItemRow key={index}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{testName}</div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>
                          Result: {result}
                        </div>
                      </div>
                    </ItemRow>
                  ))}
                </ItemsList>
              </>
            )}

            {selectedOrder.reason && (
              <DetailRow>
                <DetailLabel>Reason:</DetailLabel>
                <DetailValue>{selectedOrder.reason}</DetailValue>
              </DetailRow>
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

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessBox>{successMessage}</SuccessBox>}

            {!successMessage && (
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
                  <DetailLabel>New Status:</DetailLabel>
                  <DetailValue>
                    <SearchSelect
                      id="statusSelect"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value as 'completed' | 'cancelled')}
                      style={{ width: '200px' }}
                    >
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </SearchSelect>
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

                {updateStatus === 'completed' && orderDetails && (
                  <DetailRow style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <DetailLabel style={{ marginBottom: '8px' }}>Test Results *</DetailLabel>
                    <DetailValue style={{ width: '100%' }}>
                      {orderDetails.testItems.map((item: any, index: number) => (
                        <div key={item.labTestId} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F8F9FA', borderRadius: '4px' }}>
                          <div style={{ fontWeight: '500', marginBottom: '8px' }}>{item.testName}</div>
                          <SearchInput
                            type="text"
                            placeholder={`Enter result for ${item.testName}`}
                            value={testResults[index]?.testResult || ''}
                            onChange={(e) => {
                              handleTestResultChange(index, e.target.value);
                              setError(null);
                            }}
                            style={{ width: '100%' }}
                          />
                        </div>
                      ))}
                    </DetailValue>
                  </DetailRow>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <SearchButton
                    onClick={handleUpdateOrderStatus}
                    disabled={
                      updatingStatus || 
                      !updateReason.trim() || 
                      (updateStatus === 'completed' && testResults.some(result => !result.testResult.trim()))
                    }
                  >
                    {updatingStatus ? 'Updating...' : `Update to ${updateStatus}`}
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