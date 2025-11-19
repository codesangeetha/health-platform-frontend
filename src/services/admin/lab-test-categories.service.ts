import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';
import type {
  LabTestCategory,
  LabTestCategoriesResponse,
  CreateLabTestCategoryPayload,
  CreateLabTestCategoryResponse,
  UpdateLabTestCategoryPayload,
  UpdateLabTestCategoryResponse,
  DeleteLabTestCategoryResponse,
  GetLabTestCategoriesParams
} from '../../types/lab-test-category/lab-test-category.types';

const API_ENDPOINTS = {
  LAB_TEST_CATEGORIES: '/api/v1/lab-test-categories',
} as const;

export const getLabTestCategories = async (params: GetLabTestCategoriesParams = {}): Promise<LabTestCategoriesResponse> => {
  try {
    const { name, description, status, createdAt, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (name) {
      queryParams.append('name', name);
    }

    if (description) {
      queryParams.append('description', description);
    }

    if (status) {
      queryParams.append('status', status);
    }

    if (createdAt) {
      queryParams.append('createdAt', createdAt);
    }

    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_CATEGORIES}?${queryParams}`,
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
    throw new ApiError('Failed to fetch lab test categories list', 500);
  }
};

export const getLabTestCategoryById = async (categoryId: string): Promise<LabTestCategoriesResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_CATEGORIES}/${categoryId}`,
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
    throw new ApiError('Failed to fetch lab test category', 500);
  }
};

export const createLabTestCategory = async (payload: CreateLabTestCategoryPayload): Promise<CreateLabTestCategoryResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_CATEGORIES}`,
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
    throw new ApiError('Failed to create lab test category', 500);
  }
};

export const updateLabTestCategory = async (categoryId: string, payload: UpdateLabTestCategoryPayload): Promise<UpdateLabTestCategoryResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_CATEGORIES}/${categoryId}`,
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
    throw new ApiError('Failed to update lab test category', 500);
  }
};

export const deleteLabTestCategory = async (categoryId: string): Promise<DeleteLabTestCategoryResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_CATEGORIES}/${categoryId}`,
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
    throw new ApiError('Failed to delete lab test category', 500);
  }
};