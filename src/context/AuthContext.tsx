import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import type { AuthResponseData } from '@/types/auth/auth.types';
import { AuthService } from '@/services/auth/auth.service';

interface UserSession {
  user: AuthResponseData['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthState {
  currentUserType: 'patient' | 'doctor' | 'admin' | null;
  sessions: {
    patient: UserSession;
    doctor: UserSession;
    admin: UserSession;
  };
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
  clearError: () => void;
  login: (email: string, password: string, userType: 'patient' | 'doctor' | 'admin') => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: (userType?: 'patient' | 'doctor' | 'admin') => void;
  logoutAll: () => void;
  switchUser: (userType: 'patient' | 'doctor' | 'admin') => void;
  getCurrentSession: () => UserSession | null;
  googleLogin: () => Promise<void>;
  handleGoogleCallback: () => Promise<AuthResponseData>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  doctorPasswordSet: (token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
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

const createEmptySession = (): UserSession => ({
  user: null,
  token: null,
  isAuthenticated: false,
});

const defaultAuthState: AuthState = {
  currentUserType: null,
  sessions: {
    patient: createEmptySession(),
    doctor: createEmptySession(),
    admin: createEmptySession(),
  },
  isLoading: false,
  error: null,
};

export const AuthContext = createContext<AuthContextType>({
  authState: defaultAuthState,
  setAuthState: (() => undefined) as unknown as Dispatch<SetStateAction<AuthState>>,
  clearError: () => {},
  login: async () => {},
  register: async () => ({ success: false }),
  logout: () => {},
  logoutAll: () => {},
  switchUser: () => {},
  getCurrentSession: () => null,
  googleLogin: async () => {},
  handleGoogleCallback: async () => ({
    token: '',
    user: {
      userId: '',
      email: '',
      userType: 'patient',
      firstName: '',
      lastName: ''
    }
  }),
  forgotPassword: async () => ({ success: false, message: 'Not implemented' }),
  resetPassword: async () => ({ success: false, message: 'Not implemented' }),
  doctorPasswordSet: async () => ({ success: false, message: 'Not implemented' })
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // Initialize sessions from localStorage
        const userTypes: Array<'patient' | 'doctor' | 'admin'> = ['patient', 'doctor', 'admin'];
        const newSessions = { ...defaultAuthState.sessions };
        let firstAuthenticatedUserType: 'patient' | 'doctor' | 'admin' | null = null;

        for (const userType of userTypes) {
          const user = AuthService.getCurrentUser(userType);
          const token = AuthService.getToken(userType);
          
          if (user && token) {
            newSessions[userType] = {
              user,
              token,
              isAuthenticated: true,
            };
            
            if (!firstAuthenticatedUserType) {
              firstAuthenticatedUserType = userType;
            }
          }
        }

        setAuthState(prev => ({
          ...prev,
          sessions: newSessions,
          currentUserType: firstAuthenticatedUserType,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication',
        }));
      }
    };

    initializeAuth();

    // Listen for external auth updates (e.g., from Google OAuth callback)
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      console.log('🎉 Received google-auth-success event');
      const { user, token } = event.detail;
      console.log('👤 External auth update - User:', user);
      console.log('🔑 External auth update - Token length:', token?.length || 0);

      const userType = user.userType as 'patient' | 'doctor' | 'admin';
      
      setAuthState(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [userType]: {
            user,
            token,
            isAuthenticated: true,
          },
        },
        currentUserType: userType,
        isLoading: false,
        error: null,
      }));

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

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const login = async (email: string, password: string, userType: 'patient' | 'doctor' | 'admin') => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await AuthService.login(email, password, userType);
      console.log("data", data);
      
      setAuthState(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [userType]: {
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          },
        },
        currentUserType: userType,
        isLoading: false,
        error: null,
      }));

      // For patient login, trigger profile fetch
      if (userType === 'patient') {
        // Dispatch custom event to PatientContext to fetch profile
        const event = new CustomEvent('patient-auth-success', {
          detail: { token: data.token }
        });
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      console.log("error", error);
      // Extract the actual error message from the API response
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
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

  const logout = async (userType?: 'patient' | 'doctor' | 'admin') => {
    console.log('🚪 [AUTH_CONTEXT] Logout initiated by user');
    
    const targetUserType = userType || authState.currentUserType;
    if (!targetUserType) return;

    try {
      console.log('🔄 [AUTH_CONTEXT] Calling backend logout...');
      // Call backend logout for Google OAuth cleanup
      await AuthService.logoutFromBackend(targetUserType);
      console.log('✅ [AUTH_CONTEXT] Backend logout completed successfully');
    } catch (error) {
      console.warn('❌ [AUTH_CONTEXT] Backend logout failed:', error);
      console.warn('❌ [AUTH_CONTEXT] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    console.log('🧹 [AUTH_CONTEXT] Clearing local storage and state...');
    AuthService.logout(targetUserType);

    setAuthState(prev => {
      const newSessions = { ...prev.sessions };
      newSessions[targetUserType] = createEmptySession();
      
      // If logging out the current user, switch to another authenticated user or null
      let newCurrentUserType = prev.currentUserType;
      if (prev.currentUserType === targetUserType) {
        newCurrentUserType = null;
        // Find another authenticated user
        for (const type of ['patient', 'doctor', 'admin'] as const) {
          if (newSessions[type].isAuthenticated) {
            newCurrentUserType = type;
            break;
          }
        }
      }

      return {
        ...prev,
        sessions: newSessions,
        currentUserType: newCurrentUserType,
      };
    });

    // Clear Google OAuth sessions to prevent auto-login
    AuthService.clearGoogleOAuthSession();

    // Clear patient-specific data if logging out a patient
    if (targetUserType === 'patient') {
      const event = new CustomEvent('patient-logout');
      window.dispatchEvent(event);
    }

    console.log('🎉 [AUTH_CONTEXT] Logout process completed');
  };

  const logoutAll = async () => {
    console.log('🚪 [AUTH_CONTEXT] Logging out all users');
    
    try {
      // Call backend logout for all user types
      for (const userType of ['patient', 'doctor', 'admin'] as const) {
        if (authState.sessions[userType].isAuthenticated) {
          try {
            await AuthService.logoutFromBackend(userType);
          } catch (error) {
            console.warn(`Backend logout failed for ${userType}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Backend logout errors:', error);
    }

    // Clear all local storage
    AuthService.logout();
    
    // Clear Google OAuth sessions
    AuthService.clearGoogleOAuthSession();

    setAuthState(defaultAuthState);

    // Clear patient-specific data
    const event = new CustomEvent('patient-logout');
    window.dispatchEvent(event);

    console.log('🎉 [AUTH_CONTEXT] All users logged out');
  };

  const switchUser = (userType: 'patient' | 'doctor' | 'admin') => {
    if (authState.sessions[userType].isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        currentUserType: userType,
      }));
    }
  };

  const getCurrentSession = (): UserSession | null => {
    if (!authState.currentUserType) return null;
    return authState.sessions[authState.currentUserType];
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

  const doctorPasswordSet = async (token: string, newPassword: string, confirmPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const res = await AuthService.doctorPasswordSet(token, newPassword, confirmPassword);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, message: res.message };
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Setting doctor password failed';
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
      const userType = data.user.userType as 'patient' | 'doctor' | 'admin';
      
      setAuthState(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [userType]: {
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          },
        },
        currentUserType: userType,
        isLoading: false,
        error: null,
      }));
      
      return data;
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Google login callback failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      setAuthState,
      clearError,
      login,
      register,
      logout,
      logoutAll,
      switchUser,
      getCurrentSession,
      googleLogin,
      handleGoogleCallback,
      forgotPassword,
      resetPassword,
      doctorPasswordSet
    }}>
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
