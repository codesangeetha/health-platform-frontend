import styled from '@emotion/styled';

const Card = styled.div`
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
`;

const Header = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  color: #333333;
  margin-bottom: 0.5rem;
`;

const BodyText = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 1.5rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
`;

const IconContainer = styled.div<{ color: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }: { color: string }) => `${color}20`};
  color: ${({ color }: { color: string }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
  margin-bottom: 0.25rem;
`;

const ActivityDetails = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

interface ActivityItemType {
  icon: string;
  color: string;
  text: string;
  details: string;
  time: string;
}

interface ActivityCardProps {
  title: string;
  description: string;
  activities: ActivityItemType[];
}

const ActivityCard = ({ title, description, activities }: ActivityCardProps) => {
  return (
    <Card>
      <Header>{title}</Header>
      <BodyText>{description}</BodyText>
      <ActivityList>
        {activities.map((activity, index) => (
          <ActivityItem key={index}>
            <IconContainer color={activity.color}>
              {activity.icon}
            </IconContainer>
            <ActivityContent>
              <ActivityText>{activity.text}</ActivityText>
              <ActivityDetails>{activity.details}</ActivityDetails>
            </ActivityContent>
            <ActivityTime>{activity.time}</ActivityTime>
          </ActivityItem>
        ))}
      </ActivityList>
    </Card>
  );
};

export default ActivityCard;