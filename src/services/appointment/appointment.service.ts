import { BASE_URL } from '@/config/constants';
import type { AppointmentResponse, AppointmentData } from '@/types/appointment/appointment.types';
import { ApiError, handleApiError, getAuthToken } from '@/services/auth/auth.service';

const API_URL = `${BASE_URL}/api/v1`;

export class AppointmentService {
  static async bookAppointment(appointmentData: AppointmentData): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${API_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: AppointmentResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to book appointment');
    }
  }

  static async getAppointments(filters?: any): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params.append(key, filters[key].toString());
          }
        });
      }

      const response = await fetch(`${API_URL}/appointments/patient?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
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
      throw new ApiError('Failed to fetch appointments');
    }
  }

  static async getAppointmentById(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
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
      throw new ApiError('Failed to fetch appointment details');
    }
  }

  static async cancelAppointment(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
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
      throw new ApiError('Failed to cancel appointment');
    }
  }

  static async rescheduleAppointment(id: string, rescheduleData: { newDate: string; newTime: string; reason: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
        },
        body: JSON.stringify(rescheduleData),
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
      throw new ApiError('Failed to reschedule appointment');
    }
  }

  static async updateAppointmentStatus(id: string, statusData: { status: string; reason: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('patient')}`,
        },
        body: JSON.stringify(statusData),
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
      throw new ApiError('Failed to update appointment status');
    }
  }

  static async getCalendarData(year: number, month: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/appointments/calendar?year=${year}&month=${month}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken('doctor')}`,
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
      throw new ApiError('Failed to fetch calendar data');
    }
  }
}