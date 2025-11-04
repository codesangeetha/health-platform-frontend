import { BASE_URL } from '../../config/constants';
import type { PatientOrdersResponse, PatientOrdersRequest } from '../../types/order/order.types';

// Dashboard data interface
interface DashboardData {
  upcomingAppointments: number;
  allAppointments: number;
  lastVisitDate: string | null;
}

interface DashboardResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: DashboardData;
}

// Appointment interfaces
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  isVideoCall: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AppointmentsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    appointments: Appointment[];
    pagination: AppointmentPagination;
  };
}

// Base URL for API
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

// Doctor details interface
interface DoctorDetails {
  doctorId: string;
  firstName: string;
  lastName: string;
  // Add other fields as needed from the API response
}

interface DoctorDetailsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: DoctorDetails;
}

/**
 * Patient Service
 * Handles all patient-related API calls
 */
export class PatientService {
  /**
   * Get patient dashboard data
   */
  static async getDashboardData(): Promise<DashboardResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/v1/patients/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get patient appointments with pagination
   */
  static async getAppointments(page = 1, limit = 5): Promise<AppointmentsResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${BASE_URL}/api/v1/appointments/patient?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: AppointmentsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Get doctor details by doctor ID
   */
  static async getDoctorDetails(doctorId: string): Promise<DoctorDetailsResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments/doctor/${doctorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: DoctorDetailsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  }

  /**
   * Get patient orders with optional filtering and pagination
   */
  static async getPatientOrders(params: PatientOrdersRequest = {}): Promise<PatientOrdersResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = `${BASE_URL}/api/v1/pharmacy/orders/patient${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: PatientOrdersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patient orders:', error);
      throw error;
    }
  }

  /**
   * Get specific order details by order ID
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/v1/pharmacy/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/v1/pharmacy/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }
}