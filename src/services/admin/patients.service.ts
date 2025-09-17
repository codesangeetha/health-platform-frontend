import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  USERS: '/api/v1/admin/users',
} as const;

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  email: string;
  userType: 'patient';
  firstName?: string;
  lastName?: string;
  phone: string;
  dateOfBirth?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: EmergencyContact;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GetPatientsParams {
  page?: number;
  limit?: number;
  verified?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type PatientsResponse = ApiResponse<{
  users: Patient[];
  pagination: PaginationInfo;
}>;

export const getPatients = async (params: GetPatientsParams = {}): Promise<PatientsResponse> => {
  try {
    const { page = 1, limit = 5, verified } = params;
    const queryParams = new URLSearchParams({
      userType: 'patient',
      page: page.toString(),
      limit: limit.toString(),
      ...(verified !== undefined && { verified: verified.toString() }) as any
    });

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.USERS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch patients list', 500);
  }
};
