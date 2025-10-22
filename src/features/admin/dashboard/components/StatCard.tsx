import styled from '@emotion/styled';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  margin: 1rem;
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
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
}

const StatCard = ({ title, value, change, isPositive = true }: StatCardProps) => {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value}</Value>
      <ChangeIndicator isPositive={isPositive}>{change}</ChangeIndicator>
    </Card>
  );
};

export default StatCard;