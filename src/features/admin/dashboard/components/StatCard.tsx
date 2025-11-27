import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const Card = styled.div<{ clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  margin: 1rem;
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  cursor: ${({ clickable }: { clickable?: boolean }) => clickable ? 'pointer' : 'default'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    ${({ clickable }: { clickable?: boolean }) => clickable ? `
      transform: translateY(-2px);
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.12);
    ` : ''}
  }
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #333333;
  margin-bottom: 1rem;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 0.5rem;
`;

const ChangeIndicator = styled.div<{ isPositive?: boolean }>`
  font-size: 0.875rem;
  color: ${({ isPositive }: { isPositive?: boolean }) => isPositive ? '#4CAF50' : '#F44336'};
`;

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
  to?: string;
}

const StatCard = ({ title, value, change, isPositive = true, to }: StatCardProps) => {
  const navigate = useNavigate();
  const clickable = !!to;

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <Card onClick={handleClick} clickable={clickable}>
      <Title>{title}</Title>
      <Value>{value}</Value>
      <ChangeIndicator isPositive={isPositive}>{change}</ChangeIndicator>
    </Card>
  );
};

export default StatCard;