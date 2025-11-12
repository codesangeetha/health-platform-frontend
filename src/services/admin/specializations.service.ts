import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';
import type {
  Specialization,
  GetSpecializationsParams,
  CreateSpecializationRequest,
  UpdateSpecializationRequest,
  UpdateSpecializationResponse,
  DeleteSpecializationResponse,
  SpecializationsResponse,
  ApiResponse,
  GetSpecializationsApiResponse,
} from '../../types/specialization/specialization.types';

const API_ENDPOINTS = {
  SPECIALIZATIONS: '/api/v1/admin/specializations',
  SPECIALIZATION: (id: string) => `/api/v1/admin/specializations/${id}`,
} as const;

export type GetSpecializationsResponse = GetSpecializationsApiResponse;
export type CreateSpecializationResponse = ApiResponse<{
  specializationId: string;
  name: string;
  createdAt: string;
}>;

export const getSpecializations = async (params: GetSpecializationsParams = {}): Promise<GetSpecializationsResponse> => {
  try {
    const { page = 1, limit = 10, name, createdAt } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(name && { name }),
      ...(createdAt && { createdAt })
    });

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.SPECIALIZATIONS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch specializations list', 500);
  }
};

export const createSpecialization = async (payload: CreateSpecializationRequest): Promise<CreateSpecializationResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.SPECIALIZATIONS}`,
      {
        method: 'POST',
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
    throw new ApiError('Failed to create specialization', 500);
  }
};

export const deleteSpecialization = async (specializationId: string): Promise<DeleteSpecializationResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.SPECIALIZATION(specializationId)}`,
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
    throw new ApiError('Failed to delete specialization', 500);
  }
};

export const updateSpecialization = async (specializationId: string, payload: UpdateSpecializationRequest): Promise<UpdateSpecializationResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.SPECIALIZATION(specializationId)}`,
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
    throw new ApiError('Failed to update specialization', 500);
  }
};