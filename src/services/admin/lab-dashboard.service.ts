import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  LAB_DASHBOARD_COUNTS: '/api/v1/lab-test/dashboard/counts',
  LAB_ORDERS: '/api/v1/lab/orders',
} as const;

export interface LabDashboardCounts {
  totalLabTests: number;
  totalLabTestOrders: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type LabDashboardCountsResponse = ApiResponse<LabDashboardCounts>;

// Interface for lab test orders
export interface LabTestOrder {
  orderId: string;
  patientId: string;
  patientName: string;
  labTestId: string;
  labTestName: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  appointmentId?: string;
}

export interface LabOrdersResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    orders: LabTestOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const getLabDashboardCounts = async (): Promise<LabDashboardCountsResponse> => {
  try {
    const token = getAuthToken('labadmin') || getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_DASHBOARD_COUNTS}`,
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

const calculateDashboardCounts = async (): Promise<LabDashboardCountsResponse> => {
  // This fallback is no longer needed since the API endpoint should be available
  // If the API endpoint doesn't exist, return empty data
  const counts: LabDashboardCounts = {
    totalLabTests: 0,
    totalLabTestOrders: 0,
  };

  return {
    success: true,
    message: 'API endpoint not available, using default values',
    data: counts,
    timestamp: new Date().toISOString()
  };
};

export const getLabOrders = async (params: { 
  page?: number; 
  limit?: number; 
  status?: string; 
} = {}): Promise<LabOrdersResponse> => {
  try {
    const { page = 1, limit = 10, status } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (status) queryParams.append('status', status);

    const token = getAuthToken('labadmin') || getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_ORDERS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch lab orders', 500);
  }
};