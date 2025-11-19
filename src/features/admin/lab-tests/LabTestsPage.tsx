/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { AppLayout, MainContainer, Footer } from '../../../components/layout/AppLayout';
import Sidebar from '../dashboard/components/Sidebar';
import TopBar from '../dashboard/components/TopBar';
import { LabTestList } from './LabTestList';
import { CreateLabTestModal } from './components/CreateLabTestModal';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { getLabTestCategories } from '../../../services/admin/lab-test-categories.service';
import type { LabTestFilters } from '../../../types/lab-test/lab-test.types';

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
  justify-content: space-between;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  background-color: ${props => props.variant === 'secondary' ? '#FFFFFF' : '#4A90E2'};
  border: 1px solid ${props => props.variant === 'secondary' ? '#E0E0E0' : '#4A90E2'};
  color: ${props => props.variant === 'secondary' ? '#666666' : '#FFFFFF'};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 12px 16px;
    font-size: 16px;
  }

  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#F8F9FA' : '#3a78c3'};
    border-color: ${props => props.variant === 'secondary' ? '#CCCCCC' : '#3a78c3'};
  }
`;

const FilterSection = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
  
  @media (max-width: 768px) {
    min-width: unset;
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 6px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 4px;
  }
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  color: #333333;
  background: #FFFFFF;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px 12px;
  }
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const FilterButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.variant === 'secondary' ? '#E0E0E0' : '#4A90E2'};
  background: ${props => props.variant === 'secondary' ? '#FFFFFF' : '#4A90E2'};
  color: ${props => props.variant === 'secondary' ? '#666666' : '#FFFFFF'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#F8F9FA' : '#3a78c3'};
    border-color: ${props => props.variant === 'secondary' ? '#CCCCCC' : '#3a78c3'};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
  }
`;

const LabTestsPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [categories, setCategories] = useState<{ categoryId: string; name: string }[]>([]);
  const [filters, setFilters] = useState<LabTestFilters>({});
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getLabTestCategories({ status: 'active' });
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Set empty array as fallback to prevent errors in EditLabTestModal
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleCreated = () => {
    setOpen(false);
    // bump token to trigger list refresh
    setRefreshToken(t => t + 1);
  };

  const handleFilterChange = (field: keyof LabTestFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleApplyFilters = () => {
    setRefreshToken(t => t + 1);
  };

  const handleClearFilters = () => {
    setFilters({});
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
        <PageContainer>
          <PageTitle>Manage Lab Tests</PageTitle>
          <ActionBar>
            <div />
            <ButtonGroup>
              <ActionButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </ActionButton>
              <ActionButton onClick={() => setOpen(true)}>+ Create Lab Test</ActionButton>
            </ButtonGroup>
          </ActionBar>
          
          {showFilters && (
            <FilterSection>
              <FilterRow>
                <FilterGroup>
                  <FilterLabel>Name</FilterLabel>
                  <FilterInput
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name || ''}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Description</FilterLabel>
                  <FilterInput
                    type="text"
                    placeholder="Search by description..."
                    value={filters.description || ''}
                    onChange={(e) => handleFilterChange('description', e.target.value)}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Min Price</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Max Price</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Created From</FilterLabel>
                  <FilterInput
                    type="date"
                    value={filters.createdFrom || ''}
                    onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Created To</FilterLabel>
                  <FilterInput
                    type="date"
                    value={filters.createdTo || ''}
                    onChange={(e) => handleFilterChange('createdTo', e.target.value)}
                  />
                </FilterGroup>

                <FilterButtonGroup>
                  <FilterButton variant="primary" onClick={handleApplyFilters}>
                    Apply Filters
                  </FilterButton>
                  <FilterButton variant="secondary" onClick={handleClearFilters}>
                    Clear
                  </FilterButton>
                </FilterButtonGroup>
              </FilterRow>
            </FilterSection>
          )}
          
          <LabTestList refreshKey={refreshToken} categories={categories} filters={filters} />
        </PageContainer>
        <CreateLabTestModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={handleCreated}
          categories={categories}
        />
        <Footer />
      </MainContainer>
    </AppLayout>
  );
};

export default LabTestsPage;