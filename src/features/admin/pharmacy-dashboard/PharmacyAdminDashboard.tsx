/** @jsxImportSource @emotion/react */
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import PharmacySidebar from './PharmacySidebar';
import TopBar from '../dashboard/components/TopBar';
import StatCard from '../dashboard/components/StatCard';
import { AuthContext } from '@/context/AuthContext';
import { getPharmacyDashboardCounts, type PharmacyDashboardCounts } from '../../../services/admin/pharmacy-dashboard.service';

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

export const PharmacyAdminDashboard = () => {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<PharmacyDashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authState.sessions.pharmadmin.user;
    if (user && user.userType !== 'pharmadmin') {
      navigate('/', { replace: true });
    }
  }, [authState.sessions.pharmadmin.user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch pharmacy-specific dashboard data
        const pharmacyResponse = await getPharmacyDashboardCounts();
        if (pharmacyResponse.success) {
          setDashboardData(pharmacyResponse.data);
        } else {
          setError(pharmacyResponse.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (authState.sessions.pharmadmin.token) {
      fetchDashboardData();
    }
  }, [authState.sessions.pharmadmin.token]);

  const handleLogout = () => {
    logout('pharmadmin');
    navigate('/', { replace: true });
  };

  const statsData = [
    {
      title: 'Total Medicines',
      value: dashboardData ? dashboardData.totalMedicines.toString() : '--',
      change: 'Available medicines in inventory',
      isPositive: true,
      to: '/pharmadmin/medicines',
    },
    {
      title: 'Total Orders',
      value: dashboardData ? dashboardData.totalOrders.toString() : '--',
      change: 'All pharmacy orders',
      isPositive: true,
      to: '/pharmadmin/pharmacy-orders',
    },
  ];

  return (
    <AppLayout>
      <PharmacySidebar />
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