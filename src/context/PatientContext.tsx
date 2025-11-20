import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { PatientService } from '@/services/patient/patient.service';

interface PatientProfile {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicDiseases?: string;
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
}

const defaultPatientState: PatientState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const PatientContext = createContext<PatientContextType>({
  patientState: defaultPatientState,
  setPatientState: (() => undefined) as unknown as Dispatch<SetStateAction<PatientState>>,
  clearError: () => {},
  fetchPatientProfile: async () => {},
  getDisplayName: () => 'Patient'
});

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patientState, setPatientState] = useState<PatientState>(defaultPatientState);

  const clearError = () => {
    setPatientState(prev => ({ ...prev, error: null }));
  };

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

  const getDisplayName = (): string => {
    const { profile } = patientState;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    return 'Patient';
  };

  return (
    <PatientContext.Provider value={{
      patientState,
      setPatientState,
      clearError,
      fetchPatientProfile,
      getDisplayName
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