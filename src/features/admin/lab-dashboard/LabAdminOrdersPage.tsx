/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';
import LabAdminSidebar from './LabAdminSidebar';
import TopBar from '../dashboard/components/TopBar';
import { LabTestOrdersList } from '../lab-test-orders/LabTestOrdersList';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

export const LabAdminOrdersPage = () => {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const user = authState.sessions.labadmin.user;
    if (user && user.userType !== 'labadmin') {
      navigate('/', { replace: true });
    }
  }, [authState.sessions.labadmin.user, navigate]);

  const handleLogout = () => {
    logout('labadmin');
    navigate('/', { replace: true });
  };

  const handleRefresh = () => {
    setRefreshToken(t => t + 1);
  };

  return (
    <AppLayout>
      <LabAdminSidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <PageTitle>Lab Test Orders</PageTitle>
        
        <LabTestOrdersList refreshKey={refreshToken} />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};