/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';
import Sidebar from '../dashboard/components/Sidebar';
import TopBar from '../dashboard/components/TopBar';
import { DoctorList } from './DoctorList';
import { useState } from 'react';
import { CreateDoctorModal } from './components/CreateDoctorModal';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  background-color: #4A90E2;
  border: none;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #3a78c3;
  }
`;

const DoctorsPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreated = () => {
    setOpen(false);
    // bump token to trigger list refresh
    setRefreshToken(t => t + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <AppLayout>
      <Sidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <PageTitle>Manage Doctors</PageTitle>
        <ActionBar>
          <div />
          <CreateButton onClick={() => setOpen(true)}>+ Create Doctor</CreateButton>
        </ActionBar>
        <DoctorList refreshKey={refreshToken} />
        <CreateDoctorModal open={open} onClose={() => setOpen(false)} onCreated={handleCreated} />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default DoctorsPage;