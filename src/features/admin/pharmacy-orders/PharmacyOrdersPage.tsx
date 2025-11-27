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
        
        <PharmacyOrdersList refreshKey={refreshToken} />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default PharmacyOrdersPage;