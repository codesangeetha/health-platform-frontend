import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  DOCTORS: '/api/v1/admin/users',
  REGISTER_DOCTOR: '/api/v1/auth/register',
  UPDATE_DOCTOR: (id: string) => `/api/v1/doctors/${id}`,
  DELETE_DOCTOR: (id: string) => `/api/v1/doctors/${id}`,
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
  isActive: boolean;
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
  sort?: string;
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
    const { page = 1, limit = 5, specialization, firstName, lastName, email, createdAt, experience, sort = '-createdAt' } = params;
    
    // Build query parameters in the correct order: userType, sort, then pagination, then filters
    const queryParams = [
      `userType=doctor`,
      `sort=${sort}`,
      `page=${page.toString()}`,
      `limit=${limit.toString()}`,
      ...(specialization ? [`specialization=${encodeURIComponent(specialization)}`] : []),
      ...(firstName ? [`firstName=${encodeURIComponent(firstName)}`] : []),
      ...(lastName ? [`lastName=${encodeURIComponent(lastName)}`] : []),
      ...(email ? [`email=${encodeURIComponent(email)}`] : []),
      ...(createdAt ? [`createdAt=${encodeURIComponent(createdAt)}`] : []),
      ...(experience ? [`experience=${experience.toString()}`] : [])
    ].join('&');

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
  userType?: string;
  email: string;
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
  availableDays?: string[];
  availableTime?: {
    start: string;
    end: string;
  };
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
      `${BASE_URL}${API_ENDPOINTS.REGISTER_DOCTOR}`,
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

export type UpdateDoctorResponse = ApiResponse<{
  user: Doctor;
}>;

export interface UpdateDoctorPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  qualification?: string;
  hospital?: string;
  experience?: number;
  consultationFee?: number;
  isActive?: boolean;
}

export const updateDoctor = async (
  doctorId: string,
  payload: UpdateDoctorPayload
): Promise<UpdateDoctorResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_DOCTOR(doctorId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
    throw new ApiError('Failed to update doctor', 500);
  }
};

export type DeleteDoctorResponse = ApiResponse<{
  doctorId: string;
  deletedAt: string;
}>;

export const deleteDoctor = async (doctorId: string): Promise<DeleteDoctorResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.DELETE_DOCTOR(doctorId)}`,
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

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete doctor', 500);
  }
};