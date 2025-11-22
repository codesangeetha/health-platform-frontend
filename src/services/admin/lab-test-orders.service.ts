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
  patientId?: string;
  orderType?: 'medicine' | 'lab_test';
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
}

export const getOrders = async (params: OrdersRequest = {}): Promise<OrdersResponse> => {
  try {
    const { page = 1, limit = 10, status, patientId, orderType, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (status) queryParams.append('status', status);
    if (patientId) queryParams.append('patientId', patientId);
    if (orderType) queryParams.append('orderType', orderType);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
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
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
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

export const getOrderById = async (orderId: string): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
  data: Order;
}> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders/${orderId}`,
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
    throw new ApiError('Failed to fetch order details', 500);
  }
};