import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { PatientService } from '@/services/patient/patient.service';

interface PatientProfile {
  patientId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface PatientState {
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface PatientContextType {
  patientState: PatientState;
  setPatientState: Dispatch<SetStateAction<PatientState>>;
  clearError: () => void;
  fetchPatientProfile: () => Promise<void>;
  getDisplayName: () => string;
  clearPatientData: () => void;
}

const defaultPatientState: PatientState = {
  profile: null,
  isLoading: false,
  error: null,
};

// LocalStorage key for patient profile
const PATIENT_PROFILE_KEY = 'healthcare_patient_profile';

export const PatientContext = createContext<PatientContextType>({
  patientState: defaultPatientState,
  setPatientState: (() => undefined) as unknown as Dispatch<SetStateAction<PatientState>>,
  clearError: () => {},
  fetchPatientProfile: async () => {},
  getDisplayName: () => 'Patient',
  clearPatientData: () => {}
});

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patientState, setPatientState] = useState<PatientState>(defaultPatientState);

  // Function to fetch patient profile
  const fetchPatientProfile = async () => {
    try {
      setPatientState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await PatientService.getCurrentPatient();
      setPatientState(prev => ({
        ...prev,
        profile: response.data,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Error fetching patient profile:', error);
      setPatientState(prev => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Failed to fetch patient profile'
      }));
    }
  };

  // Load patient profile from localStorage on initialization
  useEffect(() => {
    const loadProfileFromStorage = () => {
      try {
        const storedProfile = localStorage.getItem(PATIENT_PROFILE_KEY);
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setPatientState(prev => ({
            ...prev,
            profile
          }));
        }
      } catch (error) {
        console.error('Error loading patient profile from localStorage:', error);
      }
    };

    loadProfileFromStorage();
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (patientState.profile) {
      try {
        localStorage.setItem(PATIENT_PROFILE_KEY, JSON.stringify(patientState.profile));
      } catch (error) {
        console.error('Error saving patient profile to localStorage:', error);
      }
    }
  }, [patientState.profile]);

  // Listen for patient authentication and logout events
  useEffect(() => {
    const handlePatientAuthSuccess = () => {
      console.log('Patient auth success detected, fetching profile...');
      fetchPatientProfile();
    };

    const handleGoogleAuthSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { user } = customEvent.detail;
      if (user?.userType === 'patient') {
        console.log('Google patient auth success detected, fetching profile...');
        fetchPatientProfile();
      }
    };

    const handlePatientLogout = () => {
      console.log('Patient logout detected, clearing profile data...');
      clearPatientData();
    };

    window.addEventListener('patient-auth-success', handlePatientAuthSuccess);
    window.addEventListener('google-auth-success', handleGoogleAuthSuccess);
    window.addEventListener('patient-logout', handlePatientLogout);

    return () => {
      window.removeEventListener('patient-auth-success', handlePatientAuthSuccess);
      window.removeEventListener('google-auth-success', handleGoogleAuthSuccess);
      window.removeEventListener('patient-logout', handlePatientLogout);
    };
  }, []);

  const clearError = () => {
    setPatientState(prev => ({ ...prev, error: null }));
  };

  const getDisplayName = (): string => {
    const { profile } = patientState;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    return 'Patient';
  };

  const clearPatientData = () => {
    setPatientState(defaultPatientState);
    try {
      localStorage.removeItem(PATIENT_PROFILE_KEY);
    } catch (error) {
      console.error('Error clearing patient profile from localStorage:', error);
    }
  };

  return (
    <PatientContext.Provider value={{
      patientState,
      setPatientState,
      clearError,
      fetchPatientProfile,
      getDisplayName,
      clearPatientData
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}