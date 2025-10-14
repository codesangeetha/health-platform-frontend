import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';
import type {
  LabTest,
  LabTestsResponse,
  GetLabTestsParams
} from '../../types/lab-test/lab-test.types';

const API_ENDPOINTS = {
  LAB_TESTS: '/api/v1/lab-tests',
  LAB_TEST_ORDERS: '/api/v1/lab-tests/orders',
} as const;

export const getLabTests = async (params: GetLabTestsParams = {}): Promise<LabTestsResponse> => {
  try {
    const {
      categoryId,
      isActive,
      minPrice,
      maxPrice,
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

interface CreateLabTestOrderPayload {
  testItems: Array<{
    testId: string;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  collectionMethod: string;
  scheduledDate: string;
  prescriptionId: string;
}

interface CreateLabTestOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    status: string;
    createdAt: string;
  };
  timestamp: string;
}

export const createLabTestOrder = async (payload: CreateLabTestOrderPayload): Promise<CreateLabTestOrderResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.LAB_TEST_ORDERS}`,
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
    throw new ApiError('Failed to create lab test order', 500);
  }
};