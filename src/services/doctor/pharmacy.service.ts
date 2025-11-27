import { BASE_URL } from '@/config/constants';
import { ApiError, handleApiError, getAuthToken } from '@/services/auth/auth.service';
import type { MedicineSearchResponse, PrescriptionData, PrescriptionResponse, PharmacyOrderData, PharmacyOrderResponse } from '@/types/medicine/medicine.types';

const API_URL = `${BASE_URL}/api/v1`;

// Helper function to get the appropriate token for doctor requests
const getDoctorToken = (): string | null => {
  return getAuthToken('doctor');
};

export class PharmacyService {
  static async searchMedicines(searchQuery?: string, page: number = 1, limit: number = 10): Promise<MedicineSearchResponse> {
    try {
      const params = new URLSearchParams();

      if (searchQuery && searchQuery.trim()) {
        params.append('name', searchQuery.trim());
      }

      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
      }

      const response = await fetch(`${API_URL}/pharmacy/medicines/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: MedicineSearchResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to search medicines');
    }
  }

  static async createPrescription(prescriptionData: PrescriptionData): Promise<PrescriptionResponse> {
    try {
      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
      }

      const response = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: PrescriptionResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create prescription');
    }
  }

  static async getMedicineById(medicineId: string): Promise<any> {
    try {
      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
      }

      const response = await fetch(`${API_URL}/pharmacy/medicines/${medicineId}`, {
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
      throw new ApiError('Failed to fetch medicine details');
    }
  }

  static async getAppointmentDetails(appointmentId: string): Promise<any> {
    try {
      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
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
      throw new ApiError('Failed to fetch appointment details');
    }
  }

  static async createPharmacyOrder(orderData: PharmacyOrderData): Promise<PharmacyOrderResponse> {
    try {
      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
      }

      const response = await fetch(`${API_URL}/pharmacy/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: PharmacyOrderResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create pharmacy order');
    }
  }

  static async updateAppointmentStatus(appointmentId: string, data: { status: string; reason: string }): Promise<any> {
    try {
      const token = getDoctorToken();
      if (!token) {
        throw new ApiError('Doctor authentication required', 401);
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
}