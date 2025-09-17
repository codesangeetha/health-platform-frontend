import type { LoginResponse, AuthResponseData } from '@/types/auth/auth.types';
import { BASE_URL } from '../../config/constants';

const API_URL = `${BASE_URL}/api/v1`;

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export class ApiError extends Error {
  status?: number;
  errors?: any[];

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'Something went wrong';
  let errors = [];

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
    errors = errorData.errors || [];
  } catch (e) {
    errorMessage = response.statusText;
  }

  throw new ApiError(errorMessage, response.status, errors);
};

interface RegisterDataBase {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface PatientRegisterData extends RegisterDataBase {
  userType: 'patient';
  phone: string;
  whatsapp: string;
  dateOfBirth: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type RegisterData = PatientRegisterData | (RegisterDataBase & { userType: 'doctor' | 'admin'; });

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponseData> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Always parse body to capture message
      const data = await response.json();
      const message = (data && data.message) ? data.message : 'Request processed.';

      if (!response.ok) {
        throw new Error(message || 'Failed to process forgot password request');
      }

      return { success: true, message };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to process forgot password request');
    }
  }

  static async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();
      const message = (data && data.message) ? data.message : 'Password reset processed.';

      if (!response.ok) {
        throw new Error(message || 'Password reset failed');
      }

      return { success: true, message };
    } catch (error: any) {
      throw new Error(error?.message || 'Password reset failed');
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponseData> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      
      
      // Registration successful; do not auto-login. Let user login explicitly.
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    console.log('User data from localStorage:', userStr);
    if (userStr) {
      try {
        return JSON.parse(userStr) as AuthResponseData['user'];
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Remove invalid data from localStorage
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  }

  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Do not navigate here; let the UI handle routing after logout
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setUserData(user: AuthResponseData['user'], token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
}
