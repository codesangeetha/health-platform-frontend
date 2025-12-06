import { BASE_URL } from '../../config/constants';
import { getAuthToken, ApiError, handleApiError } from '../auth/auth.service';

const API_ENDPOINTS = {
  PHARMACY_DASHBOARD_COUNTS: '/api/v1/pharmacy/dashboard/counts',
  PHARMACY_ORDERS: '/api/v1/pharmacy/orders',
  PHARMACY_ORDER_DETAIL: '/api/v1/pharmacy/orders',
} as const;

export interface PharmacyDashboardCounts {
  totalMedicines: number;
  totalOrders: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type PharmacyDashboardCountsResponse = ApiResponse<PharmacyDashboardCounts>;

export type OrderDetailResponse = ApiResponse<{ order: OrderDetail }>;

// Interface for orders to calculate metrics
export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  itemStatus?: 'completed' | 'skipped';
}

export interface Order {
  orderId: string;
  patientId: string;
  patientName: string;
  orderType: 'medicine' | 'lab_test';
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  prescriptionId?: string;
}

export interface OrderDetailItem {
  medicineName: string;
  quantity: number;
  price: number;
  medicineId: string;
  itemStatus: 'completed' | 'skipped';
  medicineDetails?: {
    _id: string;
    name: string;
    description: string;
    category: string;
    manufacturer: string;
    price: number;
  };
}

export interface OrderDetail {
  orderId: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
  totalAmount: number;
  medicineItems: OrderDetailItem[];
  deliveryMethod: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery: string;
  prescriptionId?: string;
  reason?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const getPharmacyDashboardCounts = async (): Promise<PharmacyDashboardCountsResponse> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PHARMACY_DASHBOARD_COUNTS}`,
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
    // If the specific endpoint doesn't exist, fallback to calculating from available data
    return await calculateDashboardCounts();
  }
};

const calculateDashboardCounts = async (): Promise<PharmacyDashboardCountsResponse> => {
  // This fallback is no longer needed since the API endpoint should be available
  // If the API endpoint doesn't exist, return empty data
  const counts: PharmacyDashboardCounts = {
    totalMedicines: 0,
    totalOrders: 0,
  };

  return {
    success: true,
    message: 'API endpoint not available, using default values',
    data: counts,
    timestamp: new Date().toISOString()
  };
};

export const getPharmacyOrders = async (params: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  orderType?: 'medicine' | 'lab_test';
  patientName?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<OrdersResponse> => {
  try {
    const { page = 1, limit = 10, status, orderType = 'medicine', patientName, amountMin, amountMax, dateFrom, dateTo } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('orderType', orderType);
    
    if (status) queryParams.append('status', status);
    if (patientName) queryParams.append('patientName', patientName);
    if (amountMin) queryParams.append('amountMin', amountMin.toString());
    if (amountMax) queryParams.append('amountMax', amountMax.toString());
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PHARMACY_ORDERS}?${queryParams}`,
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
    throw new ApiError('Failed to fetch pharmacy orders', 500);
  }
};

export interface MedicineStatusUpdate {
  medicineId: string;
  itemStatus: 'completed' | 'skipped';
}

// Extended OrderItem interface for update functionality
export interface OrderItemForUpdate {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
}

export const updatePharmacyOrderStatus = async (
  orderId: string,
  medicineStatuses: MedicineStatusUpdate[],
  reason: string
): Promise<{ success: boolean; message: string; timestamp: string; data: Order }> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    // Validate and sanitize medicineStatuses to ensure only valid itemStatus values
    const sanitizedMedicineStatuses = medicineStatuses.map(med => ({
      medicineId: med.medicineId,
      itemStatus: (med.itemStatus === 'completed' || med.itemStatus === 'skipped') 
        ? med.itemStatus 
        : 'completed' // Default to 'completed' for any invalid status
    }));

    // Calculate final order status based on individual medicine statuses
    // This must match the logic in the UI component for consistency
    const allSkipped = sanitizedMedicineStatuses.every(med => med.itemStatus === 'skipped');
    const atLeastOneCompleted = sanitizedMedicineStatuses.some(med => med.itemStatus === 'completed');
    
    // If all medicines are skipped due to being out of stock, the order should be cancelled
    const finalStatus = allSkipped ? 'cancelled' : (atLeastOneCompleted ? 'completed' : 'pending');

    console.log('Updating order status:', {
      orderId,
      originalMedicineStatuses: medicineStatuses,
      sanitizedMedicineStatuses,
      reason,
      finalStatus,
      allSkipped,
      atLeastOneCompleted
    });

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/orders/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: finalStatus,
          reason, 
          medicines: sanitizedMedicineStatuses 
        }),
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
    throw new ApiError('Failed to update pharmacy order status', 500);
  }
};

export const getPharmacyOrderDetail = async (orderId: string): Promise<OrderDetailResponse> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.PHARMACY_ORDER_DETAIL}/${orderId}`,
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
    throw new ApiError('Failed to fetch pharmacy order detail', 500);
  }
};

export interface MedicineStockInfo {
  medicineId: string;
  name: string;
  stock: number;
  price: number;
  status: string;
}

export interface MedicineStockResponse {
  success: boolean;
  message: string;
  data: MedicineStockInfo;
  timestamp: string;
}

export const getMedicineStock = async (medicineId: string): Promise<MedicineStockResponse> => {
  try {
    const token = getAuthToken('pharmadmin');
    if (!token) {
      throw new ApiError('No authentication token found', 401);
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/pharmacy/medicines/${medicineId}`,
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
    return {
      success: data.success,
      message: data.message,
      data: {
        medicineId: data.data.medicineId,
        name: data.data.name,
        stock: data.data.stock,
        price: data.data.price,
        status: data.data.status
      },
      timestamp: data.timestamp
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Failed to fetch stock for medicine ${medicineId}`, 500);
  }
};

export interface StockValidationResult {
  isValid: boolean;
  medicineId: string;
  medicineName: string;
  currentStock: number;
  requiredQuantity: number;
  errorMessage?: string;
}

export const validateMedicineStock = async (
  medicineId: string,
  medicineName: string,
  requiredQuantity: number
): Promise<StockValidationResult> => {
  try {
    const stockInfo = await getMedicineStock(medicineId);
    
    if (stockInfo.data.status !== 'active') {
      return {
        isValid: false,
        medicineId,
        medicineName,
        currentStock: stockInfo.data.stock,
        requiredQuantity,
        errorMessage: `Medicine "${medicineName}" is not active`
      };
    }

    if (stockInfo.data.stock <= 0) {
      return {
        isValid: false,
        medicineId,
        medicineName,
        currentStock: stockInfo.data.stock,
        requiredQuantity,
        errorMessage: `Medicine "${medicineName}" is out of stock (current stock: 0)`
      };
    }

    if (stockInfo.data.stock < requiredQuantity) {
      return {
        isValid: false,
        medicineId,
        medicineName,
        currentStock: stockInfo.data.stock,
        requiredQuantity,
        errorMessage: `Insufficient stock for "${medicineName}". Required: ${requiredQuantity}, Available: ${stockInfo.data.stock}`
      };
    }

    return {
      isValid: true,
      medicineId,
      medicineName,
      currentStock: stockInfo.data.stock,
      requiredQuantity
    };
  } catch (error) {
    // If we can't fetch stock info, allow the operation but warn
    console.warn(`Could not validate stock for ${medicineName}:`, error);
    return {
      isValid: false,
      medicineId,
      medicineName,
      currentStock: 0,
      requiredQuantity,
      errorMessage: `Could not verify stock for "${medicineName}". Please check manually.`
    };
  }
};