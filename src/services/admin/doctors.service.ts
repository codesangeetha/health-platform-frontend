import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  DOCTORS: '/api/v1/admin/users',
  VERIFY_DOCTOR: (id: string) => `/api/v1/admin/users/${id}/status`,
  STATUS_DOCTOR: (id: string) => `/api/v1/admin/users/${id}/status`,
} as const;

export interface Doctor {
  id: string;
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  dateOfBirth?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  specialization: string;
  licenseNumber?: string;
  experience: number | string;
  consultationFee: number;
  qualification?: string;
  hospital?: string;
  availableDays: string[];
  availableTime?: {
    start: string;
    end: string;
  };
  rating: number;
  totalPatients: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GetDoctorsParams {
  page?: number;
  limit?: number;
  specialization?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
  experience?: string | number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type DoctorsResponse = ApiResponse<{
  users: Doctor[];
  pagination: PaginationInfo;
}>;

export type VerifyDoctorResponse = ApiResponse<{
  user: Doctor;
}>;

export const verifyDoctor = async (doctorId: string): Promise<VerifyDoctorResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.VERIFY_DOCTOR(doctorId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified: true })
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
    throw new ApiError('Failed to verify doctor', 500);
  }
};

export const getDoctors = async (params: GetDoctorsParams = {}): Promise<DoctorsResponse> => {
  try {
    const { page = 1, limit = 5, specialization, firstName, lastName, email, createdAt, experience } = params;
    const queryParams = new URLSearchParams({
      userType: 'doctor',
      page: page.toString(),
      limit: limit.toString(),
      ...(specialization && { specialization }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(createdAt && { createdAt }),
      ...(experience && { experience: experience.toString() })
    });

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.DOCTORS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch doctors list', 500);
  }
};

export interface CreateDoctorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  dateOfBirth: string; // YYYY-MM-DD
  specialization: string;
  qualification?: string;
  hospital?: string;
  licenseNumber?: string;
  experience?: number | string;
  consultationFee?: number;
}

export type CreateDoctorResponse = ApiResponse<{
  user: Doctor;
}>;

export const createDoctor = async (payload: CreateDoctorPayload): Promise<CreateDoctorResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.DOCTORS}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userType: 'doctor', ...payload })
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
    throw new ApiError('Failed to create doctor', 500);
  }
};

export type UpdateDoctorStatusResponse = ApiResponse<{ user: Doctor }>;

export const updateDoctorStatus = async (
  doctorId: string,
  isVerified: boolean
): Promise<UpdateDoctorStatusResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.STATUS_DOCTOR(doctorId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified })
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
    throw new ApiError('Failed to update doctor status', 500);
  }
};