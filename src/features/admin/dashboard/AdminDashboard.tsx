/** @jsxImportSource @emotion/react */
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import { AuthContext } from '@/context/AuthContext';
import { getDashboardCounts, type DashboardCounts } from '../../../services/admin/dashboard.service';

import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = authState?.user && (authState.user as any)?.role;
    if (role && role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [authState?.user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardCounts();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (authState?.token) {
      fetchDashboardData();
    }
  }, [authState?.token]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const statsData = [
    {
      title: 'Total Patients',
      value: dashboardData ? dashboardData.totalPatients.toString() : '--',
      change: 'Registered patients',
      isPositive: true,
    },
    {
      title: 'Total Doctors',
      value: dashboardData ? dashboardData.totalDoctors.toString() : '--',
      change: 'Active doctors',
      isPositive: true,
    },
    {
      title: 'Appointments',
      value: dashboardData ? dashboardData.totalAppointments.toString() : '--',
      change: 'Booked appointments',
      isPositive: true,
    },
    {
      title: 'Medicines',
      value: dashboardData ? dashboardData.totalMedicines.toString() : '--',
      change: 'Available medicines',
      isPositive: true,
    },
    {
      title: 'Lab Tests',
      value: dashboardData ? dashboardData.totalLabTests.toString() : '--',
      change: 'Available tests',
      isPositive: true,
    },
    {
      title: 'Pharmacy Categories',
      value: dashboardData ? dashboardData.totalPharmacyCategories.toString() : '--',
      change: 'Medicine categories',
      isPositive: true,
    },
    {
      title: 'Lab Test Categories',
      value: dashboardData ? dashboardData.totalLabTestCategories.toString() : '--',
      change: 'Test categories',
      isPositive: true,
    },
  ];

  return (
    <AppLayout>
      <Sidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <DashboardContent>
          <StatsGrid>
            {statsData.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={loading ? 'Loading...' : stat.value}
                change={stat.change}
                isPositive={stat.isPositive}
              />
            ))}
          </StatsGrid>
        </DashboardContent>
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};