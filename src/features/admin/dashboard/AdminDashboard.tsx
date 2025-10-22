/** @jsxImportSource @emotion/react */
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import ActivityCard from './components/ActivityCard';
import { AuthContext } from '@/context/AuthContext';
import { useContext,useEffect } from 'react';

import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ActivitySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

export const AdminDashboard = () => {
  const navigate = useNavigate();

const { authState, logout } = useContext(AuthContext);


useEffect(() => {
    const role = authState?.user && (authState.user as any)?.role;
    if (role && role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [authState?.user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const statsData = [
    {
      title: 'Total Patients',
      value: '2,847',
      change: '+12% from last month',
      isPositive: true,
    },
    {
      title: 'Total Doctors',
      value: '158',
      change: '+5% from last month',
      isPositive: true,
    },
    {
      title: 'Appointments',
      value: '482',
      change: '+8% from last month',
      isPositive: true,
    },
    {
      title: 'Revenue',
      value: '$94,245',
      change: '+15% from last month',
      isPositive: true,
    },
  ];

  const recentActivities = [
    {
      icon: '📋',
      color: '#2196F3',
      text: 'New appointment booked',
      details: 'Sarah Johnson booked with Dr. Smith',
      time: '2 minutes ago',
    },
    {
      icon: '👤',
      color: '#4CAF50',
      text: 'New patient registered',
      details: 'Michael Davis joined the platform',
      time: '15 minutes ago',
    },
    {
      icon: '✅',
      color: '#4A90E2',
      text: 'Appointment completed',
      details: 'Dr. Wilson completed checkup with James Brown',
      time: '1 hour ago',
    },
  ];

  return (
    <AppLayout>
      <Sidebar />
      <MainContainer>
        <TopBar onLogout={handleLogout} />
        <StatsGrid>
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
            />
          ))}
        </StatsGrid>

        <ActivitySection>
          <ActivityCard
            title="Recent Activity"
            description="Latest platform interactions"
            activities={recentActivities}
          />
          
          <ActivityCard
            title="Important Updates"
            description="System and policy updates"
            activities={[
              {
                icon: '🔔',
                color: '#FF9800',
                text: 'System Maintenance',
                details: 'Scheduled maintenance on Sunday, 2 AM',
                time: '1 day ago',
              },
              {
                icon: '📢',
                color: '#F44336',
                text: 'New Policy Update',
                details: 'Updated patient data protection guidelines',
                time: '2 days ago',
              },
            ]}
          />
        </ActivitySection>
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};