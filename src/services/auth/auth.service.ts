import type { LoginResponse, AuthResponseData } from '@/types/auth/auth.types';

const API_URL = 'http://localhost:3000/api/v1'; // Replace with your actual API URL

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

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

  static async register(userData: RegisterData): Promise<AuthResponseData> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data: LoginResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

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
    window.location.href = '/login';
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setUserData(user: AuthResponseData['user'], token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
}
