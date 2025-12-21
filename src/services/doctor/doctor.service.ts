import { BASE_URL } from '@/config/constants';
import { getAuthToken } from '@/services/auth/auth.service';
import type { DoctorResponse, DoctorFilters } from '@/types/doctor/doctor.types';
import { ApiError, handleApiError } from '@/services/auth/auth.service';

// Dashboard data interface
interface DashboardData {
  todayAppointments: number;
  totalAppointments: number;
  pendingConsultations: number;
  todayCompletedConsultations: number;
}

interface DashboardResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: DashboardData;
}

const API_URL = `${BASE_URL}/api/v1`;

interface DoctorAppointmentsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    appointments: Array<{
      appointmentId: string;
      patient: {
        patientId: string;
        firstName: string;
        lastName: string;
        age: number;
      };
      date: string;
      time: string;
      status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      appointmentType: 'video' | 'in-person';
      reason: string;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Doctor Service
 * Handles all doctor-related API calls
 */
export class DoctorService {
  /**
   * Get doctor dashboard data
   */
  static async getDashboardData(): Promise<DashboardResponse> {
    try {
      const token = getAuthToken('doctor');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/doctors/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch dashboard data');
    }
  }

  static async getDoctors(filters: DoctorFilters = {}, userType: 'patient' | 'doctor' | 'admin' = 'doctor'): Promise<DoctorResponse> {
    try {
      const { limit = 6, page = 1, specialization, search, searchName, availableDays, sort } = filters;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });
      
      // Add sort parameter, defaulting to descending order by creation date
      params.append('sort', sort || 'createdAt:desc');
      
      if (specialization) {
        params.append('specialization', specialization);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      if (searchName) {
        params.append('searchName', searchName);
      }
      
      if (availableDays) {
        params.append('availableDays', availableDays);
      }

      const token = getAuthToken(userType);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/appointments/doctors?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: DoctorResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch doctors');
    }
  }

  static async getDoctorById(id: string, userType: 'patient' | 'doctor' | 'admin' = 'doctor'): Promise<any> {
    try {
      const token = getAuthToken(userType);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/appointments/doctor/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch doctor details');
    }
  }

  static async getDoctorAppointments(filters: { limit: number; page: number }): Promise<DoctorAppointmentsResponse> {
    try {
      const { limit = 10, page = 1 } = filters;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      const token = getAuthToken('doctor');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/appointments/doctor?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: DoctorAppointmentsResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch doctor appointments');
    }
  }

  static async updateAppointmentStatus(appointmentId: string, data: { status: string; reason: string }): Promise<any> {
    try {
      const token = getAuthToken('doctor');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update appointment status');
    }
  }

  /**
   * Get current doctor profile
   */
  static async getCurrentDoctorProfile(): Promise<any> {
    try {
      const token = getAuthToken('doctor');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/doctors/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch doctor profile');
    }
  }

  /**
   * Get prescription details by appointment ID
   */
  static async getPrescriptionDetails(appointmentId: string): Promise<any> {
    try {
      const token = getAuthToken('doctor');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${API_URL}/prescriptions/appointment/${appointmentId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch prescription details');
    }
  }
}