import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';
import type {
  LabTest,
  LabTestsResponse,
  CreateLabTestPayload,
  CreateLabTestResponse,
  UpdateLabTestPayload,
  UpdateLabTestResponse,
  DeleteLabTestResponse,
  GetLabTestsParams
} from '../../types/lab-test/lab-test.types';

const API_ENDPOINTS = {
  LAB_TESTS: '/api/v1/lab-tests',
} as const;

export const getLabTests = async (params: GetLabTestsParams = {}): Promise<LabTestsResponse> => {
  try {
    const {
      categoryId,
      isActive,
      minPrice,
      maxPrice,
      name,
      description,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (categoryId) {
      queryParams.append('categoryId', categoryId);
    }

    if (typeof isActive === 'boolean') {
      queryParams.append('isActive', isActive.toString());
    }

    if (minPrice !== undefined) {
      queryParams.append('minPrice', minPrice.toString());
    }

    if (maxPrice !== undefined) {
      queryParams.append('maxPrice', maxPrice.toString());
    }

    if (name) {
      queryParams.append('name', name);
    }

    if (description) {
      queryParams.append('description', description);
    }

    if (createdFrom) {
      queryParams.append('createdFrom', createdFrom);
    }

    if (createdTo) {
      queryParams.append('createdTo', createdTo);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TESTS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch lab tests list', 500);
  }
};

export const getLabTestById = async (testId: string): Promise<LabTestsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TESTS}/${testId}`,
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
    throw new ApiError('Failed to fetch lab test', 500);
  }
};

export const createLabTest = async (payload: CreateLabTestPayload): Promise<CreateLabTestResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TESTS}`,
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
    throw new ApiError('Failed to create lab test', 500);
  }
};

export const updateLabTest = async (testId: string, payload: UpdateLabTestPayload): Promise<UpdateLabTestResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TESTS}/${testId}`,
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
    throw new ApiError('Failed to update lab test', 500);
  }
};

export const deleteLabTest = async (testId: string): Promise<DeleteLabTestResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TESTS}/${testId}`,
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
    throw new ApiError('Failed to delete lab test', 500);
  }
};