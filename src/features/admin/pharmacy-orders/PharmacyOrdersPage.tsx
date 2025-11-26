/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';
import Sidebar from '../dashboard/components/Sidebar';
import TopBar from '../dashboard/components/TopBar';
import { PharmacyOrdersList } from './PharmacyOrdersList';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #28a745;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #28a745;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666666;
  font-weight: 500;
`;

const PharmacyOrdersPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleRefresh = () => {
    setRefreshToken(t => t + 1);
  };

  return (
    <AppLayout>
      <Sidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <PageTitle>Pharmacy Orders</PageTitle>
        
<StatsContainer>
          <StatCard>
            <StatValue>9</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>7</StatValue>
            <StatLabel>Pending Orders</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>2</StatValue>
            <StatLabel>Completed Orders</StatLabel>
          </StatCard>
        </StatsContainer>

        <PharmacyOrdersList refreshKey={refreshToken} />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default PharmacyOrdersPage;