/** @jsxImportSource @emotion/react */
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import LabAdminSidebar from './LabAdminSidebar';
import TopBar from '../dashboard/components/TopBar';
import StatCard from '../dashboard/components/StatCard';
import { AuthContext } from '@/context/AuthContext';
import { getLabDashboardCounts, type LabDashboardCounts } from '../../../services/admin/lab-dashboard.service';

import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
  }
  
  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
  }
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const LabAdminDashboard = () => {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<LabDashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authState.sessions.labadmin.user;
    if (user && user.userType !== 'labadmin') {
      navigate('/', { replace: true });
    }
  }, [authState.sessions.labadmin.user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch lab-specific dashboard data
        const labResponse = await getLabDashboardCounts();
        if (labResponse.success) {
          setDashboardData(labResponse.data);
        } else {
          setError(labResponse.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (authState.sessions.labadmin.token) {
      fetchDashboardData();
    }
  }, [authState.sessions.labadmin.token]);

  const handleLogout = () => {
    logout('labadmin');
    navigate('/', { replace: true });
  };

  const statsData = [
    {
      title: 'Total Lab Tests',
      value: dashboardData ? dashboardData.totalLabTests.toString() : '--',
      change: 'Available lab tests',
      isPositive: true,
      to: '/labadmin/lab-tests',
    },
    {
      title: 'Total Lab Test Orders',
      value: dashboardData ? dashboardData.totalLabTestOrders.toString() : '--',
      change: 'All lab test orders',
      isPositive: true,
      to: '/labadmin/lab-test-orders',
    },
  ];

  return (
    <AppLayout>
      <LabAdminSidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <DashboardContent>
          {error && (
            <div style={{ 
              backgroundColor: '#fee', 
              color: '#c33', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              Error: {error}
            </div>
          )}
          <StatsGrid>
            {statsData.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={loading ? 'Loading...' : stat.value}
                change={stat.change}
                isPositive={stat.isPositive}
                to={stat.to}
              />
            ))}
          </StatsGrid>
        </DashboardContent>
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};