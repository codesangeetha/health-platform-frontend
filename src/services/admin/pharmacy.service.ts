import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  CATEGORIES: '/api/v1/pharmacy/categories',
  PRESCRIPTION_UPLOAD: '/api/v1/pharmacy/prescriptions/upload',
} as const;

export interface Category {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type CategoriesResponse = ApiResponse<{
  categories: Category[];
  pagination: PaginationInfo;
}>;

export const getCategories = async (params: GetCategoriesParams = {}): Promise<CategoriesResponse> => {
  try {
    const { page = 1, limit = 10, name, description, status, createdAt } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(createdAt && { createdAt })
    });

    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.CATEGORIES}?${queryParams}`,
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
    throw new ApiError('Failed to fetch categories list', 500);
  }
};

export interface CreateCategoryPayload {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
}

export type CreateCategoryResponse = ApiResponse<{
  category: Category;
}>;

export const createCategory = async (payload: CreateCategoryPayload): Promise<CreateCategoryResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.CATEGORIES}`,
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
    throw new ApiError('Failed to create category', 500);
  }
};

const MEDICINES_ENDPOINTS = {
   MEDICINES: '/api/v1/pharmacy/medicines',
   SEARCH_MEDICINES: '/api/v1/pharmacy/medicines/search',
} as const;

interface GetMedicinesParams {
  page?: number;
  limit?: number;
}

export type MedicinesResponse = ApiResponse<{
  medicines: Medicine[];
  pagination: PaginationInfo;
}>;

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  sideEffects: string[];
  interactions: string[];
  ingredients: string[];
  expiryDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  manufacturer: string;
  description: string;
  dosage: string;
  storage: string;
}

export const getMedicines = async (params: GetMedicinesParams = {}): Promise<MedicinesResponse> => {
   try {
     const { page = 1, limit = 10 } = params;
     const queryParams = new URLSearchParams({
       page: page.toString(),
       limit: limit.toString()
     });

     const token = getAuthToken('admin');
     if (!token) {
       throw new ApiError('No authentication token found', 401);
     }

     const response = await fetch(
       `${BASE_URL}${MEDICINES_ENDPOINTS.MEDICINES}?${queryParams}`,
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
     throw new ApiError('Failed to fetch medicines list', 500);
   }
};

interface SearchMedicinesParams {
   query?: string;
   page?: number;
   limit?: number;
}

interface AdvancedSearchParams {
   name?: string;
   genericName?: string;
   priceMin?: number;
   priceMax?: number;
   createdDateFrom?: string;
   sortBy?: string;
   sortOrder?: 'asc' | 'desc';
   page?: number;
   limit?: number;
}

export const searchMedicines = async (params: SearchMedicinesParams = {}): Promise<MedicinesResponse> => {
   try {
     const { query = '', page = 1, limit = 10 } = params;
     const queryParams = new URLSearchParams({
       page: page.toString(),
       limit: limit.toString()
     });

     if (query) {
       queryParams.append('query', query);
     }

     const token = getAuthToken('admin');
     if (!token) {
       throw new ApiError('No authentication token found', 401);
     }

     const response = await fetch(
       `${BASE_URL}${MEDICINES_ENDPOINTS.SEARCH_MEDICINES}?${queryParams}`,
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
     throw new ApiError('Failed to search medicines', 500);
   }
};

export const advancedSearchMedicines = async (params: AdvancedSearchParams = {}): Promise<MedicinesResponse> => {
   try {
     const {
       name,
       genericName,
       priceMin,
       priceMax,
       createdDateFrom,
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

     if (name) queryParams.append('name', name);
     if (genericName) queryParams.append('genericName', genericName);
     if (priceMin !== undefined) queryParams.append('priceMin', priceMin.toString());
     if (priceMax !== undefined) queryParams.append('priceMax', priceMax.toString());
     if (createdDateFrom) queryParams.append('createdDateFrom', createdDateFrom);

     const token = getAuthToken('admin');
     if (!token) {
       throw new ApiError('No authentication token found', 401);
     }

     const response = await fetch(
       `${BASE_URL}${MEDICINES_ENDPOINTS.SEARCH_MEDICINES}?${queryParams}`,
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
     throw new ApiError('Failed to search medicines with advanced filters', 500);
   }
};

export interface CreateMedicinePayload {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  stock: number;
  description: string;
  dosage: string;
  sideEffects: string[];
  interactions: string[];
  ingredients: string[];
  storage: string;
  expiryDate: string;
  status?: 'active' | 'inactive';
}

export type CreateMedicineResponse = ApiResponse<{
  medicineId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  createdAt: string;
}>;

export const createMedicine = async (payload: CreateMedicinePayload): Promise<CreateMedicineResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${MEDICINES_ENDPOINTS.MEDICINES}`,
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
    throw new ApiError('Failed to create medicine', 500);
  }
};

export interface UpdateMedicinePayload {
  name?: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  price?: number;
  stock?: number;
  description?: string;
  dosage?: string;
  sideEffects?: string[];
  interactions?: string[];
  ingredients?: string[];
  storage?: string;
  expiryDate?: string;
  status?: 'active' | 'inactive';
}

export type UpdateMedicineResponse = ApiResponse<{
  medicineId: string;
  name: string;
  price: number;
  status: string;
  updatedAt: string;
}>;

export const updateMedicine = async (medicineId: string, payload: UpdateMedicinePayload): Promise<UpdateMedicineResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${MEDICINES_ENDPOINTS.MEDICINES}/${medicineId}`,
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
    throw new ApiError('Failed to update medicine', 500);
  }
};

export type DeleteMedicineResponse = ApiResponse<{
  medicineId: string;
  status: string;
  deletedAt: string;
}>;

export const deleteMedicine = async (medicineId: string): Promise<DeleteMedicineResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${MEDICINES_ENDPOINTS.MEDICINES}/${medicineId}`,
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
    throw new ApiError('Failed to delete medicine', 500);
  }
};

// Prescription Upload Types and Functions
export interface PrescriptionUploadPayload {
  prescription: File;
  doctorId: string;
  notes?: string;
}

export interface PrescriptionUploadResponse {
  prescriptionId: string;
  fileName: string;
  doctorId: string;
  uploadDate: string;
  createdAt: string;
}

export type UploadPrescriptionResponse = ApiResponse<PrescriptionUploadResponse>;

export const uploadPrescription = async (payload: PrescriptionUploadPayload): Promise<UploadPrescriptionResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const formData = new FormData();
    formData.append('prescription', payload.prescription);
    formData.append('doctorId', payload.doctorId);
    if (payload.notes) {
      formData.append('notes', payload.notes);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PRESCRIPTION_UPLOAD}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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
    throw new ApiError('Failed to upload prescription', 500);
  }
};

// Order Medicine Types and Functions
export interface OrderItem {
  medicineId: string;
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PlaceOrderPayload {
  prescriptionId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  deliveryMethod: 'standard' | 'express' | 'urgent';
}

export interface PlaceOrderResponse {
  orderId: string;
  totalAmount: number;
  status: string;
  estimatedDelivery: string;
}

export type OrderMedicineResponse = ApiResponse<PlaceOrderResponse>;

export const placeOrder = async (payload: PlaceOrderPayload): Promise<OrderMedicineResponse> => {
  try {
    const token = getAuthToken('admin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders`,
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
    throw new ApiError('Failed to place order', 500);
  }
};