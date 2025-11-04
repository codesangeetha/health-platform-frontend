import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  DASHBOARD_COUNTS: '/api/v1/admin/dashboard/counts',
} as const;

export interface DashboardCounts {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicines: number;
  totalLabTests: number;
  totalPharmacyCategories: number;
  totalLabTestCategories: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type DashboardCountsResponse = ApiResponse<DashboardCounts>;

export const getDashboardCounts = async (): Promise<DashboardCountsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.DASHBOARD_COUNTS}`,
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
    throw new ApiError('Failed to fetch dashboard counts', 500);
  }
};