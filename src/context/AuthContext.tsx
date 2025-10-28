import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import type { AuthResponseData } from '@/types/auth/auth.types';
import { AuthService } from '@/services/auth/auth.service';

interface AuthState {
  user: AuthResponseData['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  googleLogin: () => Promise<void>;
  handleGoogleCallback: () => Promise<AuthResponseData>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Accepts different payloads based on user type (patient/doctor/admin)
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

type RegisterData = PatientRegisterData | (RegisterDataBase & { userType: 'doctor' | 'admin'; });

const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export const AuthContext = createContext<AuthContextType>({
  authState: defaultAuthState,
  setAuthState: (() => undefined) as unknown as Dispatch<SetStateAction<AuthState>>,
  login: async () => {},
  register: async () => ({ success: false }),
  logout: () => {},
  googleLogin: async () => {},
  handleGoogleCallback: async () => ({ token: '', user: { userId: '', email: '', userType: 'patient' } }),
  forgotPassword: async () => ({ success: false, message: 'Not implemented' }),
  resetPassword: async () => ({ success: false, message: 'Not implemented' })
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // Check if there's a valid session on the backend
        const authData = await AuthService.checkAuthStatus();

        if (authData) {
          setAuthState({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // No valid session, use local storage as fallback
          const user = AuthService.getCurrentUser();
          const token = AuthService.getToken();

          setAuthState({
            user,
            token,
            isAuthenticated: !!user && !!token,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Fallback to local storage
        const user = AuthService.getCurrentUser();
        const token = AuthService.getToken();

        setAuthState({
          user,
          token,
          isAuthenticated: !!user && !!token,
          isLoading: false,
          error: null,
        });
      }
    };

    // Listen for external auth updates (e.g., from Google OAuth callback)
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      console.log('🎉 Received google-auth-success event');
      const { user, token } = event.detail;
      console.log('👤 External auth update - User:', user);
      console.log('🔑 External auth update - Token length:', token?.length || 0);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ AuthContext state updated from external event');
    };

    window.addEventListener('google-auth-success', handleGoogleAuthSuccess as EventListener);

    // Initialize auth state
    initializeAuth();

    // Cleanup
    return () => {
      window.removeEventListener('google-auth-success', handleGoogleAuthSuccess as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await AuthService.login(email, password);
      console.log("data",data);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log("error",error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please check your credentials.',
      }));
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await AuthService.register(userData);
      // Do not authenticate on registration success
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Registration failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return { success: false, message };
    }
  };

  const logout = async () => {
    console.log('🚪 [AUTH_CONTEXT] Logout initiated by user');

    try {
      console.log('🔄 [AUTH_CONTEXT] Calling backend logout...');
      // Call backend logout for Google OAuth cleanup
      await AuthService.logoutFromBackend();
      console.log('✅ [AUTH_CONTEXT] Backend logout completed successfully');
    } catch (error) {
      console.warn('❌ [AUTH_CONTEXT] Backend logout failed:', error);
      console.warn('❌ [AUTH_CONTEXT] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check for specific error types
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.error('🚫 [AUTH_CONTEXT] Network/CORS error detected in context');
      }
    }

    console.log('🧹 [AUTH_CONTEXT] Clearing local storage and state...');
    AuthService.logout();

    // Clear Google OAuth sessions to prevent auto-login
    AuthService.clearGoogleOAuthSession();

    setAuthState(defaultAuthState);

    console.log('🗂️ [AUTH_CONTEXT] Redirecting to home page...');
    // Use window.location.href for hard navigation to avoid aborting pending requests
    //window.location.href = '/';

    console.log('🎉 [AUTH_CONTEXT] Logout process completed');
  };

  const forgotPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const res = await AuthService.forgotPassword(email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, message: res.message };
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to process forgot password request';
      setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, message };
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const res = await AuthService.resetPassword(token, newPassword, confirmPassword);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, message: res.message };
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Password reset failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
      return { success: false, message };
    }
  };

  const googleLogin = async () => {
    try {
      console.log('🚀 Initiating Google OAuth login...');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await AuthService.googleLogin();
      console.log('✅ Google OAuth request sent, waiting for redirect...');
      // Note: This will redirect away from the current page
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Google login failed';
      console.error('❌ Google login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  };

  const handleGoogleCallback = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await AuthService.handleGoogleCallback();
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data;
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Google login callback failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, register, logout, googleLogin, handleGoogleCallback, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
