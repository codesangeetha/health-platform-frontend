import { BASE_URL } from '@/config/constants';
import type { DoctorResponse, DoctorFilters } from '@/types/doctor/doctor.types';
import { ApiError, handleApiError } from '@/services/auth/auth.service';

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
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export class DoctorService {
  static async getDoctors(filters: DoctorFilters = {}): Promise<DoctorResponse> {
    try {
      const { limit = 5, page = 1, specialization, search, searchName, availableDays } = filters;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });
      
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

      const response = await fetch(`${API_URL}/appointments/doctors?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  static async getDoctorById(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/doctor/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

      const response = await fetch(`${API_URL}/appointments/doctor?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
}