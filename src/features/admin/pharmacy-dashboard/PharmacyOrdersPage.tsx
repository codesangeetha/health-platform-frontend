/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import PharmacySidebar from './PharmacySidebar';
import TopBar from '../dashboard/components/TopBar';
import { PharmacyOrdersList } from '../pharmacy-orders/PharmacyOrdersList';
import { AuthContext } from '../../../context/AuthContext';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

export const PharmacyOrdersPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    logout('pharmadmin');
    navigate('/', { replace: true });
  };

  const handleRefresh = () => {
    setRefreshToken(t => t + 1);
  };

  return (
    <AppLayout>
      <PharmacySidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <PageTitle>Pharmacy Orders</PageTitle>
        
        <PharmacyOrdersList refreshKey={refreshToken} />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default PharmacyOrdersPage;