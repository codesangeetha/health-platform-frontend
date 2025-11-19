import type { LoginResponse, AuthResponseData } from '@/types/auth/auth.types';
import { BASE_URL } from '../../config/constants';

const API_URL = `${BASE_URL}/api/v1`;

// User type specific storage keys
const STORAGE_KEYS = {
  patient: {
    user: 'patient',
    token: 'patient_token'
  },
  doctor: {
    user: 'doctor',
    token: 'doctor_token'
  },
  admin: {
    user: 'admin',
    token: 'admin_token'
  },
  // Legacy keys for backward compatibility
  legacy: {
    user: 'user',
    token: 'token'
  }
};

export const getAuthToken = (userType?: 'patient' | 'doctor' | 'admin'): string | null => {
  if (userType && STORAGE_KEYS[userType]) {
    return localStorage.getItem(STORAGE_KEYS[userType].token);
  }
  // Fallback to legacy key for backward compatibility
  return localStorage.getItem(STORAGE_KEYS.legacy.token);
};

export const setAuthToken = (token: string, userType: 'patient' | 'doctor' | 'admin'): void => {
  localStorage.setItem(STORAGE_KEYS[userType].token, token);
};

export const removeAuthToken = (userType?: 'patient' | 'doctor' | 'admin'): void => {
  if (userType && STORAGE_KEYS[userType]) {
    localStorage.removeItem(STORAGE_KEYS[userType].token);
  } else {
    // Remove all tokens
    Object.values(STORAGE_KEYS).forEach(keys => {
      localStorage.removeItem(keys.token);
    });
  }
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
  static async login(email: string, password: string, userType?: 'patient' | 'doctor' | 'admin'): Promise<AuthResponseData> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Always parse the response to get the actual error message
      const data: LoginResponse = await response.json();
       
      if (!response.ok || !data.success) {
        // Use the actual API error message instead of a generic one
        const errorMessage = data.message || 'Login failed';
         
        // Enhance error with context for better error handling
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).code = data.code || 'LOGIN_FAILED';
        (enhancedError as any).isInactiveAccount = /account is inactive/i.test(errorMessage);
         
        throw enhancedError;
      }

      // Store the token and user data with user-type specific keys
      const actualUserType = data.data.user.userType as 'patient' | 'doctor' | 'admin';
      localStorage.setItem(STORAGE_KEYS[actualUserType].token, data.data.token);
      localStorage.setItem(STORAGE_KEYS[actualUserType].user, JSON.stringify(data.data.user));

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

  static async doctorPasswordSet(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/doctor-password-set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();
      const message = (data && data.message) ? data.message : 'Doctor password set processed.';

      if (!response.ok) {
        throw new Error(message || 'Setting doctor password failed');
      }

      return { success: true, message };
    } catch (error: any) {
      throw new Error(error?.message || 'Setting doctor password failed');
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

  static getCurrentUser(userType?: 'patient' | 'doctor' | 'admin') {
    let userStr: string | null = null;
    
    if (userType && STORAGE_KEYS[userType]) {
      userStr = localStorage.getItem(STORAGE_KEYS[userType].user);
    } else {
      // Try to get user from any of the user type keys
      for (const key of ['patient', 'doctor', 'admin']) {
        userStr = localStorage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS].user);
        if (userStr) break;
      }
      
      // Fallback to legacy key
      if (!userStr) {
        userStr = localStorage.getItem(STORAGE_KEYS.legacy.user);
      }
    }
    
    console.log('User data from localStorage:', userStr);
    if (userStr) {
      try {
        return JSON.parse(userStr) as AuthResponseData['user'];
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Remove invalid data from localStorage
        if (userType && STORAGE_KEYS[userType]) {
          localStorage.removeItem(STORAGE_KEYS[userType].user);
        }
        return null;
      }
    }
    return null;
  }

  static logout(userType?: 'patient' | 'doctor' | 'admin'): void {
    if (userType && STORAGE_KEYS[userType]) {
      localStorage.removeItem(STORAGE_KEYS[userType].token);
      localStorage.removeItem(STORAGE_KEYS[userType].user);
    } else {
      // Clear all user tokens and data
      Object.values(STORAGE_KEYS).forEach(keys => {
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.user);
      });
    }
    // Do not navigate here; let the UI handle routing after logout
  }

  static clearGoogleOAuthSession(): void {
    try {
      console.log('🧹 Clearing Google OAuth sessions and cookies...');

      // Clear Google OAuth related cookies
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear Google OAuth related cookies
        if (name.includes('google') || name.includes('oauth') || name.includes('session')) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
          console.log('🗑️ Cleared cookie:', name);
        }
      }

      // Clear any OAuth-related local storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('google') || key.includes('oauth') || key.includes('g_state'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Cleared localStorage key:', key);
      });

      // Clear session storage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('google') || key.includes('oauth'))) {
          sessionKeysToRemove.push(key);
        }
      }

      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        console.log('🗑️ Cleared sessionStorage key:', key);
      });

      // Clear the Google auth flag
      localStorage.removeItem('google_auth');
      console.log('🗑️ Cleared google_auth flag');

      console.log('✅ Google OAuth session cleanup completed');
    } catch (error) {
      console.warn('⚠️ Error during Google OAuth session cleanup:', error);
    }
  }

  static getToken(userType?: 'patient' | 'doctor' | 'admin'): string | null {
    return getAuthToken(userType);
  }

  static setUserData(user: AuthResponseData['user'], token: string): void {
    const userType = user.userType as 'patient' | 'doctor' | 'admin';
    localStorage.setItem(STORAGE_KEYS[userType].user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS[userType].token, token);
  }

  static async googleLogin(): Promise<void> {
    try {
      console.log('🔗 [GOOGLE] Initiating Google OAuth login...');

      // Clear any existing Google OAuth sessions first
      this.clearGoogleOAuthSession();

      console.log('🔗 [GOOGLE] Redirecting to Google OAuth endpoint:', `${API_URL}/auth/google`);

      // Add parameters to force Google to show account selection
      const separator = `${API_URL}/auth/google`.includes('?') ? '&' : '?';
      const forceReauthParams = 'prompt=select_account&access_type=offline&max_auth_age=0';

      // Redirect to Google OAuth initiation endpoint with fresh auth parameters
      const finalUrl = `${API_URL}/auth/google${separator}${forceReauthParams}`;
      console.log('🔗 [GOOGLE] Final OAuth URL:', finalUrl);

      window.location.href = finalUrl;
    } catch (error) {
      console.error('❌ [GOOGLE] Failed to initiate Google OAuth:', error);
      throw error;
    }
  }

  static async handleGoogleCallback(): Promise<AuthResponseData> {
    try {
      // Get current user data after Google OAuth callback
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' as RequestCredentials, // Include cookies for OAuth
      });

      if (!response.ok) {
        throw new Error('Failed to get user data after Google login');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Google login failed');
      }

      // Store the token and user data with user-type specific keys
      const actualUserType = data.data.user.userType as 'patient' | 'doctor' | 'admin';
      localStorage.setItem(STORAGE_KEYS[actualUserType].token, data.data.token);
      localStorage.setItem(STORAGE_KEYS[actualUserType].user, JSON.stringify(data.data.user));

      // Mark as Google OAuth user for proper logout handling
      localStorage.setItem('google_auth', 'true');

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static async logoutFromBackend(userType?: 'patient' | 'doctor' | 'admin'): Promise<void> {
    try {
      console.log('🔄 [LOGOUT] Starting logout request...');
      console.log('🔄 [LOGOUT] API_URL:', API_URL);
      console.log('🔄 [LOGOUT] Current origin:', window.location.origin);
      console.log('🔄 [LOGOUT] User agent:', navigator.userAgent);

      // Check if this is a Google OAuth logout by looking for Google-related data
      const currentUser = this.getCurrentUser(userType);
      const isGoogleUser = currentUser?.email?.includes('@gmail.com') ||
                          localStorage.getItem('google_auth') === 'true';

      console.log('🔄 [LOGOUT] Is Google user:', isGoogleUser);

      // Choose the appropriate logout endpoint
      const logoutEndpoint = isGoogleUser ? '/auth/google-logout' : '/auth/logout';
      const fullUrl = `${API_URL}${logoutEndpoint}`;

      console.log('🔄 [LOGOUT] Using logout endpoint:', logoutEndpoint);
      console.log('🔄 [LOGOUT] Full URL:', fullUrl);

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' as RequestCredentials,
      };

      console.log('🔄 [LOGOUT] Request options:', requestOptions);

      const response = await fetch(fullUrl, requestOptions);

      console.log('📡 [LOGOUT] Response status:', response.status);
      console.log('📡 [LOGOUT] Response statusText:', response.statusText);
      console.log('📡 [LOGOUT] Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 [LOGOUT] Response ok:', response.ok);
      console.log('📡 [LOGOUT] Response type:', response.type);
      console.log('📡 [LOGOUT] Response url:', response.url);

      if (!response.ok) {
        console.warn('❌ [LOGOUT] Request failed with status:', response.status);
        const errorText = await response.text();
        console.warn('❌ [LOGOUT] Error response text:', errorText);

        // If Google logout fails, try regular logout as fallback
        if (isGoogleUser && response.status !== 404) {
          console.warn('⚠️ [LOGOUT] Google logout failed, trying regular logout...');
          await this.fallbackLogout();
        } else {
          console.warn('❌ [LOGOUT] Continuing with local logout anyway...');
        }
      } else {
        console.log('✅ [LOGOUT] Request successful');
        const responseData = await response.text();
        console.log('✅ [LOGOUT] Response data:', responseData);
      }
    } catch (error) {
      console.error('❌ [LOGOUT] Network error occurred:', error);
      console.error('❌ [LOGOUT] Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [LOGOUT] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [LOGOUT] Error stack:', error instanceof Error ? error.stack : undefined);

      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.error('🚫 [LOGOUT] CORS/Network error detected!');
        console.error('🚫 [LOGOUT] This usually means:');
        console.error('🚫 [LOGOUT] 1. Backend server is not running');
        console.error('🚫 [LOGOUT] 2. CORS is not properly configured on backend');
        console.error('🚫 [LOGOUT] 3. Request is being blocked by browser extension');
        console.error('🚫 [LOGOUT] 4. HTTPS/HTTP mixed content issue');
      }
    }
  }

  static async fallbackLogout(): Promise<void> {
    try {
      console.log('🔄 [LOGOUT] Attempting fallback logout...');
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        console.log('✅ [LOGOUT] Fallback logout successful');
      } else {
        console.warn('❌ [LOGOUT] Fallback logout also failed');
      }
    } catch (error) {
      console.warn('❌ [LOGOUT] Fallback logout error:', error);
    }
  }

  static async checkAuthStatus(userType?: 'patient' | 'doctor' | 'admin'): Promise<AuthResponseData | null> {
    try {
      const token = this.getToken(userType);
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If token is invalid, clear it
        this.logout(userType);
        return null;
      }

      const data = await response.json();

      if (!data.success) {
        this.logout(userType);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Auth status check failed:', error);
      this.logout(userType);
      return null;
    }
  }
}
