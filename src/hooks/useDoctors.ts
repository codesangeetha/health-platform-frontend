import { useState, useEffect, useCallback } from 'react';
import { DoctorService } from '@/services/doctor/doctor.service';
import type { Doctor, DoctorFilters } from '@/types/doctor/doctor.types';

export interface UseDoctorsReturn {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  specializations: string[];
  refreshDoctors: () => Promise<void>;
}

export const useDoctors = (filters: DoctorFilters): UseDoctorsReturn => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [specializations, setSpecializations] = useState<string[]>([]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getDoctors(filters, 'patient');
      setDoctors(response.data.doctors);
      setTotalPages(response.data.pagination.totalPages);
      
      // Extract unique specializations for filter dropdown
      const uniqueSpecializations = Array.from(
        new Set(response.data.doctors.map(doctor => doctor.specialization))
      );
      setSpecializations(uniqueSpecializations);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
      setDoctors([]);
      setTotalPages(0);
      setSpecializations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshDoctors = useCallback(async () => {
    // Force refresh by calling with current filters
    await fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    totalPages,
    specializations,
    refreshDoctors,
  };
};