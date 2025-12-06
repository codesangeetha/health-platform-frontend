// Admin service for managing orders (both pharmacy and lab test orders)
import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

export interface OrderItem {
  medicineName: string;
  labTestName: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
}

export interface Order {
  orderId: string;
  patientId: string;
  patientName: string;
  orderType: 'medicine' | 'lab_test';
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  prescriptionId?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface OrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
  patientName?: string;
  patientId?: string;
  orderType?: 'medicine' | 'lab_test';
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
}

export const getOrders = async (params: OrdersRequest = {}): Promise<OrdersResponse> => {
  try {
    const { page = 1, limit = 10, status, patientId, patientName, orderType, startDate, endDate, dateFrom, dateTo, amountMin, amountMax } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (status) queryParams.append('status', status);
    if (patientId) queryParams.append('patientId', patientId);
    if (patientName) queryParams.append('patientName', patientName);
    if (amountMin) queryParams.append('amountMin', amountMin.toString());
    if (amountMax) queryParams.append('amountMax', amountMax.toString());
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    if (orderType) queryParams.append('orderType', orderType);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const token = getAuthToken('labadmin');
    if (!token) {
      throw new ApiError('No lab admin authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch orders', 500);
  }
};

export const updateOrderStatus = async (
  orderId: string,
  updateData: UpdateOrderRequest
): Promise<{ success: boolean; message: string; timestamp: string; data: Order }> => {
  try {
    const token = getAuthToken('labadmin');
    if (!token) {
      throw new ApiError('No lab admin authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders/${orderId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update order status', 500);
  }
};

export interface TestResult {
  labTestId: string;
  testStatus: 'completed' | 'skipped';
  testResult: string | null;
}

export interface UpdateLabTestOrderRequest {
  status: 'completed' | 'cancelled';
  reason: string;
  result: TestResult[];
}

export const updateLabTestOrderStatus = async (
  orderId: string,
  updateData: UpdateLabTestOrderRequest
): Promise<{ success: boolean; message: string; timestamp: string; data: Order }> => {
  try {
    const token = getAuthToken('labadmin');
    if (!token) {
      throw new ApiError('No lab admin authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/lab-test-orders/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update lab test order status', 500);
  }
};

export const updatePharmacyOrderStatus = async (
  orderId: string,
  status: string,
  reason: string
): Promise<{ success: boolean; message: string; timestamp: string; data: Order }> => {
  try {
    const token = getAuthToken('labadmin');
    if (!token) {
      throw new ApiError('No lab admin authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason }),
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update pharmacy order status', 500);
  }
};

export const getLabTestOrderById = async (orderId: string): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    order: {
      orderId: string;
      orderDate: string;
      status: string;
      totalAmount: number;
      testItems: Array<{
        testName: string;
        price: number;
        labTestId: string;
        testStatus?: 'completed' | 'skipped' | 'pending';
        result?: string | null;
        labTestDetails: {
          _id: string;
          name: string;
          categoryId: string;
          price: number;
          description: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      }>;
      collectionMethod: string;
      scheduledDate: string;
      prescriptionId: string | object;
      reason?: string;
      resultData?: Record<string, string>;
      completedDate?: string;
    };
  };
}> => {
  try {
    const token = getAuthToken('labadmin');
    if (!token) {
      throw new ApiError('No lab admin authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/lab-test-orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch lab test order details', 500);
  }
};