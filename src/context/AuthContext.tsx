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
  forgotPassword: async () => ({ success: false, message: 'Not implemented' }),
  resetPassword: async () => ({ success: false, message: 'Not implemented' })
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    const initializeAuth = () => {
      const user = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      setAuthState({
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading: false,
        error: null,
      });
    };

    // Initialize auth state
    initializeAuth();
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

  const logout = () => {
    AuthService.logout();
    setAuthState(defaultAuthState);
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

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, register, logout, forgotPassword, resetPassword }}>
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
