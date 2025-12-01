/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import PharmacySidebar from './PharmacySidebar';
import TopBar from '../dashboard/components/TopBar';
import { MedicineList } from '../medicines/MedicineList';
import { AuthContext } from '../../../context/AuthContext';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';

const PageContainer = styled.div`
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

export const PharmacyMedicinesPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout('pharmadmin');
    navigate('/', { replace: true });
  };

  return (
    <AppLayout>
      <PharmacySidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <PageContainer>
          <PageTitle>Manage Medicines</PageTitle>
          <ActionBar>
            <div />
          </ActionBar>
          <MedicineList showActions={false} />
        </PageContainer>
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default PharmacyMedicinesPage;