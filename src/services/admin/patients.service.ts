import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  USERS: '/api/v1/admin/users',
  PATIENTS: '/api/v1/admin/patients',
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
  firstName?: string;
  lastName?: string;
  email?: string;
  bloodGroup?: string;
  createdAt?: string;
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
    const { page = 1, limit = 5, verified, firstName, lastName, email, bloodGroup, createdAt } = params;
    const queryParams = new URLSearchParams({
      userType: 'patient',
      page: page.toString(),
      limit: limit.toString(),
      ...(verified !== undefined && { verified: verified.toString() }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(bloodGroup && { bloodGroup }),
      ...(createdAt && { createdAt })
    });

    const token = getAuthToken('admin');
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

export const updatePatient = async (patientId: string, data: Partial<Patient>): Promise<Patient> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PATIENTS}/${patientId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update patient', 500);
  }
};

export const deletePatient = async (patientId: string): Promise<void> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PATIENTS}/${patientId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete patient', 500);
  }
};
