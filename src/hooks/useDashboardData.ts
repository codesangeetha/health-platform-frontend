import { useState, useEffect, useCallback } from 'react';
import { PatientService } from '../services/patient/patient.service';

interface DashboardData {
  upcomingAppointments: number;
  allAppointments: number;
  lastVisitDate: string | null;
}

interface UseDashboardDataReturn {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  retry: () => void;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PatientService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    retry,
  };
};