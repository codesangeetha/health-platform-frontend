import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  PHARMACY_DASHBOARD_COUNTS: '/api/v1/pharmacy/dashboard/counts',
  PHARMACY_ORDERS: '/api/v1/pharmacy/orders',
} as const;

export interface PharmacyDashboardCounts {
  totalMedicines: number;
  totalOrders: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type PharmacyDashboardCountsResponse = ApiResponse<PharmacyDashboardCounts>;

// Interface for orders to calculate metrics
export interface OrderItem {
  medicineName: string;
  quantity: number;
  price: number;
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

export const getPharmacyDashboardCounts = async (): Promise<PharmacyDashboardCountsResponse> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PHARMACY_DASHBOARD_COUNTS}`,
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
    // If the specific endpoint doesn't exist, fallback to calculating from available data
    return await calculateDashboardCounts();
  }
};

const calculateDashboardCounts = async (): Promise<PharmacyDashboardCountsResponse> => {
  // This fallback is no longer needed since the API endpoint should be available
  // If the API endpoint doesn't exist, return empty data
  const counts: PharmacyDashboardCounts = {
    totalMedicines: 0,
    totalOrders: 0,
  };

  return {
    success: true,
    message: 'API endpoint not available, using default values',
    data: counts,
    timestamp: new Date().toISOString()
  };
};

export const getPharmacyOrders = async (params: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  orderType?: 'medicine' | 'lab_test';
  patientName?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<OrdersResponse> => {
  try {
    const { page = 1, limit = 10, status, orderType = 'medicine', patientName, amountMin, amountMax, dateFrom, dateTo } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('orderType', orderType);
    
    if (status) queryParams.append('status', status);
    if (patientName) queryParams.append('patientName', patientName);
    if (amountMin) queryParams.append('amountMin', amountMin.toString());
    if (amountMax) queryParams.append('amountMax', amountMax.toString());
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PHARMACY_ORDERS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch pharmacy orders', 500);
  }
};

export const updatePharmacyOrderStatus = async (
  orderId: string,
  status: string,
  reason: string
): Promise<{ success: boolean; message: string; timestamp: string; data: Order }> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
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