/** @jsxImportSource @emotion/react */
import { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import type { Medicine, MedicineSearchResponse } from '../../../types/medicine/medicine.types';
import type { Doctor } from '../../../types/doctor/doctor.types';
import { searchMedicines, uploadPrescription, placeOrder } from '../../../services/admin/pharmacy.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { ApiError } from '../../../services/auth/auth.service';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    primary: "#3E7BFA",
    secondary: "#5CB85C",
    background: "#F7F7F7",
    cardBackground: "#FFFFFF",
    textPrimary: "#333333",
    textSecondary: "#6C757D",
    text_dark: "#333333",
    text_light: "#6C757D",
    background_light: "#F7F7F7",
    background_white: "#FFFFFF",
    border: "#CCCCCC",
    status_confirmed: "#5CB85C",
    status_pending: "#5CB85C",
    status_cancelled: "#EF4444"
  },
  typography: {
    font_family: "Sans-serif",
    font_size_xs: "0.75rem",
    font_size_sm: "0.875rem",
    font_size_base: "1rem",
    font_size_lg: "1.125rem",
    font_size_xl: "1.25rem",
    font_size_2xl: "1.5rem",
    font_size_3xl: "1.875rem",
    font_size_4xl: "2.25rem",
    font_weight_normal: "400",
    font_weight_medium: "500",
    font_weight_semibold: "600",
    font_weight_bold: "700"
  },
  layout: {
    maxWidth: "1200px",
    spacing: {
      padding: "20px 40px",
      gap: "20px"
    }
  }
};

// Cart Types
interface CartItem {
  medicine: Medicine;
  quantity: number;
}

interface CartSummary {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

const PageContainer = styled.div`
  max-width: ${DESIGN_SYSTEM.layout.maxWidth};
  margin: 0 auto;
  padding: ${DESIGN_SYSTEM.layout.spacing.padding};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  background: ${DESIGN_SYSTEM.colors.background};
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${DESIGN_SYSTEM.colors.border};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: ${DESIGN_SYSTEM.colors.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  font-size: ${DESIGN_SYSTEM.typography.font_size_lg};
`;

const CompanyName = styled.h1`
  font-size: 24px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.textPrimary};
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const HeaderIcon = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${DESIGN_SYSTEM.colors.textSecondary};
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${DESIGN_SYSTEM.colors.background};
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 70% 30%;
  gap: ${DESIGN_SYSTEM.layout.spacing.gap};
  margin-bottom: 32px;
`;

const ContentArea = styled.main`
  background: ${DESIGN_SYSTEM.colors.cardBackground};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_normal};
  color: ${DESIGN_SYSTEM.colors.textSecondary};
  margin: 0 0 24px 0;
`;

const Title = styled.h1`
  font-size: ${DESIGN_SYSTEM.typography.font_size_3xl};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${DESIGN_SYSTEM.colors.text_light};
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  margin: 0;
`;

const SearchContainer = styled.div`
  margin-bottom: 24px;
`;

const SearchForm = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 4px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  outline: none;
  width: 400px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
  }

  &::placeholder {
    color: ${DESIGN_SYSTEM.colors.textSecondary};
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: ${DESIGN_SYSTEM.colors.primary};
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #2E5BDA;
  }

  &:disabled {
    background: ${DESIGN_SYSTEM.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  color: ${DESIGN_SYSTEM.colors.primary};
  border: 1px solid ${DESIGN_SYSTEM.colors.primary};
  border-radius: 4px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${DESIGN_SYSTEM.colors.primary};
    color: white;
  }
`;

const ResultsInfo = styled.div`
  color: ${DESIGN_SYSTEM.colors.text_light};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  margin-bottom: 16px;
`;

const MedicineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const MedicineCard = styled.div`
  background: ${DESIGN_SYSTEM.colors.cardBackground};
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s ease;
  gap: 16px;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MedicineHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
`;

const MedicineIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${DESIGN_SYSTEM.colors.primary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
`;

const MedicineContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MedicineName = styled.h3`
  font-size: 16px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_semibold};
  color: ${DESIGN_SYSTEM.colors.textPrimary};
  margin: 0 0 2px 0;
`;

const MedicineGenericName = styled.p`
  color: ${DESIGN_SYSTEM.colors.textSecondary};
  font-size: 14px;
  margin: 0 0 6px 0;
  font-weight: 400;
`;

const MedicineManufacturer = styled.p`
  color: #888;
  font-size: 12px;
  margin: 0 0 6px 0;
  font-weight: 400;
`;

const MedicineInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 4px;
`;

const MedicinePrice = styled.span`
  font-size: 16px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.primary};
`;

const MedicineStock = styled.span<{ stock: number }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  background-color: ${props =>
    props.stock > 50 ? DESIGN_SYSTEM.colors.status_confirmed :
    props.stock > 10 ? DESIGN_SYSTEM.colors.status_pending :
    DESIGN_SYSTEM.colors.status_cancelled};
  color: #FFFFFF;
`;

const MedicineDescription = styled.p`
  color: ${DESIGN_SYSTEM.colors.textSecondary};
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 12px 0;
`;

const MedicineDetails = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${DESIGN_SYSTEM.colors.background_light};
  border-radius: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_light};
  width: 100px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: ${DESIGN_SYSTEM.colors.text_dark};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  flex: 1;
`;

const MedicineCardFooter = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${DESIGN_SYSTEM.colors.background_light};
  border-radius: 8px;
  padding: 4px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: ${DESIGN_SYSTEM.colors.background_white};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${DESIGN_SYSTEM.typography.font_size_lg};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${DESIGN_SYSTEM.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 24px;
  text-align: center;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_dark};
`;

const AddToCartButton = styled.button`
  flex: none;
  padding: 10px 16px;
  background: #3E7BFA;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 36px;
  width: auto;

  &:hover {
    background: #2563EB;
  }

  &:disabled {
    background: ${DESIGN_SYSTEM.colors.text_light};
    cursor: not-allowed;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PageInfo = styled.span`
  color: #666666;
  font-size: 14px;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.disabled ? '#E0E0E0' : '#4A90E2'};
  background: ${props => props.disabled ? '#F8F9FA' : '#FFFFFF'};
  color: ${props => props.disabled ? '#666666' : '#4A90E2'};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin: 0 4px;

  &:hover:not(:disabled) {
    background: #4A90E2;
    color: #FFFFFF;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.8);
  color: #666666;
  min-height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 16px 0;
  background-color: #FFEBEE;
  color: #D32F2F;
  border-radius: 4px;
  border: 1px solid #FFCDD2;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px;
  color: #666666;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

// Prescription Upload Styles
const UploadSection = styled.div`
  background: ${DESIGN_SYSTEM.colors.background_white};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
`;

const UploadHeader = styled.div`
  margin-bottom: 24px;
`;

const UploadTitle = styled.h2`
  font-size: ${DESIGN_SYSTEM.typography.font_size_2xl};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_semibold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  margin: 0 0 8px 0;
`;

const UploadDescription = styled.p`
  color: ${DESIGN_SYSTEM.colors.text_light};
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  margin: 0 0 20px 0;
  line-height: 1.6;
`;

const UploadForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
`;

const FileInput = styled.input`
  padding: 16px;
  border: 2px dashed ${DESIGN_SYSTEM.colors.border};
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  cursor: pointer;
  background: ${DESIGN_SYSTEM.colors.background_light};
  transition: border-color 0.2s ease;
  font-family: ${DESIGN_SYSTEM.typography.font_family};

  &:hover {
    border-color: ${DESIGN_SYSTEM.colors.primary};
  }
`;

const TextInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  outline: none;
  transition: border-color 0.2s ease;
  font-family: ${DESIGN_SYSTEM.typography.font_family};

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  outline: none;
  background: ${DESIGN_SYSTEM.colors.background_white};
  cursor: pointer;
  transition: border-color 0.2s ease;
  font-family: ${DESIGN_SYSTEM.typography.font_family};

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid ${DESIGN_SYSTEM.colors.border};
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  font-family: ${DESIGN_SYSTEM.typography.font_family};

  &:focus {
    border-color: ${DESIGN_SYSTEM.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const UploadButton = styled.button`
  padding: 16px 24px;
  background: ${DESIGN_SYSTEM.colors.primary};
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: ${DESIGN_SYSTEM.typography.font_family};

  &:hover {
    background: #2563EB;
  }

  &:disabled {
    background: ${DESIGN_SYSTEM.colors.text_light};
    cursor: not-allowed;
  }
`;

const FileInfo = styled.div`
  padding: 12px 16px;
  background: ${DESIGN_SYSTEM.colors.primary}10;
  border: 1px solid ${DESIGN_SYSTEM.colors.primary}30;
  border-radius: 8px;
  color: ${DESIGN_SYSTEM.colors.primary};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
`;

const SuccessMessage = styled.div`
  padding: 16px;
  background: ${DESIGN_SYSTEM.colors.status_confirmed}15;
  border: 1px solid ${DESIGN_SYSTEM.colors.status_confirmed};
  border-radius: 8px;
  color: ${DESIGN_SYSTEM.colors.status_confirmed};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  margin-top: 12px;
`;

const UploadErrorMessage = styled.div`
  padding: 16px;
  background: ${DESIGN_SYSTEM.colors.status_cancelled}15;
  border: 1px solid ${DESIGN_SYSTEM.colors.status_cancelled};
  border-radius: 8px;
  color: ${DESIGN_SYSTEM.colors.status_cancelled};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  margin-top: 12px;
`;

// Cart Styles
interface CartContainerProps {
  open?: boolean;
}

interface CartOverlayProps {
  open?: boolean;
}

const CartContainer = styled.div<CartContainerProps>`
  background: ${DESIGN_SYSTEM.colors.cardBackground};
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  padding: 20px;
  height: fit-content;
`;

const CartTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.textPrimary};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
`;

const CartItems = styled.div`
  padding: 24px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
`;

const CartItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${DESIGN_SYSTEM.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.div`
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  color: ${DESIGN_SYSTEM.colors.text_dark};
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  margin-bottom: 4px;
`;

const CartItemPrice = styled.div`
  color: ${DESIGN_SYSTEM.colors.primary};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_semibold};
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
`;


const RemoveButton = styled.button`
  background: ${DESIGN_SYSTEM.colors.status_cancelled};
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  transition: background-color 0.2s ease;

  &:hover {
    background: #DC2626;
  }
`;

const CartSummary = styled.div`
  padding: 24px;
  border-top: 1px solid ${DESIGN_SYSTEM.colors.border};
  background: ${DESIGN_SYSTEM.colors.background_light};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  color: ${DESIGN_SYSTEM.colors.text_light};
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${DESIGN_SYSTEM.colors.border};
  font-size: ${DESIGN_SYSTEM.typography.font_size_lg};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
  color: ${DESIGN_SYSTEM.colors.text_dark};
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${DESIGN_SYSTEM.colors.secondary};
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_base};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_semibold};
  font-family: ${DESIGN_SYSTEM.typography.font_family};
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: ${DESIGN_SYSTEM.colors.text_light};
    cursor: not-allowed;
  }
`;

const ClearCartButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${DESIGN_SYSTEM.colors.status_cancelled};
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_sm};
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_medium};
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #DC2626;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${DESIGN_SYSTEM.colors.text_light};
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const CartIcon = styled.button`
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${DESIGN_SYSTEM.colors.primary};
  color: #FFFFFF;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #2563EB;
    transform: translateY(-50%) scale(1.05);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${DESIGN_SYSTEM.colors.status_cancelled};
  color: #FFFFFF;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: ${DESIGN_SYSTEM.typography.font_size_xs};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${DESIGN_SYSTEM.typography.font_weight_bold};
`;


export const OrderMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Prescription upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Order state
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [lastPrescriptionId, setLastPrescriptionId] = useState<string | null>(null);

  const fetchMedicines = useCallback(async (search: string = '', page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response: MedicineSearchResponse = await searchMedicines({
        query: search,
        page,
        limit: pagination.limit
      });

      setMedicines(response.data.medicines);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to search medicines');
      }
      console.error('Error searching medicines:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchMedicines(searchQuery, pagination.page);
  }, [pagination.page, fetchMedicines, searchQuery]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('medicineCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medicineCart', JSON.stringify(cart));
  }, [cart]);

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await DoctorService.getDoctors({ limit: 50 }); // Get more doctors for the dropdown
      if (response.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput);
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const [quantities, setQuantities] = useState<{[medicineId: string]: number}>({});

  const handleQuantityChange = (medicineId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [medicineId]: Math.max(1, (prev[medicineId] || 1) + delta)
    }));
  };

  const handleAddToCart = (medicine: Medicine) => {
    const quantity = quantities[medicine.id] || 1;
    addToCart(medicine, quantity);
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [medicine.id]: 1 }));
    // Automatically open cart sidebar to show the added item
    setCartOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePrescriptionUpload = async () => {
    if (!selectedFile || !selectedDoctor) {
      setUploadError('Please select a file and choose a doctor');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);
      setUploadSuccess(false);

      const response = await uploadPrescription({
        prescription: selectedFile,
        doctorId,
        notes: notes || undefined
      });

      if (response.success) {
        setUploadSuccess(true);
        setLastPrescriptionId(response.data.prescriptionId);
        // Reset form
        setSelectedFile(null);
        setDoctorId('');
        setNotes('');
        // Reset file input
        const fileInput = document.getElementById('prescriptionFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setUploadError(error.message);
      } else {
        setUploadError('Failed to upload prescription. Please try again.');
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Cart functions
  const addToCart = (medicine: Medicine, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.medicine.id === medicine.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { medicine, quantity }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prevCart => prevCart.filter(item => item.medicine.id !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartSummary = (): CartSummary => {
    const subtotal = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleOrderMedicine = async () => {
    if (cart.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    if (!lastPrescriptionId) {
      setOrderError('Please upload a prescription first before placing an order');
      return;
    }

    try {
      setOrderLoading(true);
      setOrderError(null);
      setOrderSuccess(null);

      // Default delivery address (in a real app, this would come from user profile or form)
      const deliveryAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      };

      const orderPayload = {
        prescriptionId: lastPrescriptionId,
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity
        })),
        deliveryAddress,
        deliveryMethod: 'standard' as const
      };

      const response = await placeOrder(orderPayload);

      if (response.success) {
        setOrderSuccess(`Order placed successfully! Order ID: ${response.data.orderId}. Estimated delivery: ${new Date(response.data.estimatedDelivery).toLocaleDateString()}`);

        // Clear prescription form immediately after successful order
        setSelectedFile(null);
        setDoctorId('');
        setSelectedDoctor(null);
        setNotes('');
        setUploadSuccess(false);
        setLastPrescriptionId(null);

        // Reset file input
        const fileInput = document.getElementById('prescriptionFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Clear cart and order messages after showing success
        setTimeout(() => {
          clearCart();
          setOrderSuccess(null);
          setOrderError(null);
        }, 3000); // Clear after 3 seconds to let user see the success
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setOrderError(error.message);
      } else {
        setOrderError('Failed to place order. Please try again.');
      }
      // Keep sidebar open to show error message
    } finally {
      setOrderLoading(false);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      

      <MainContent>
        <ContentArea>
          <SectionTitle>Order Medicines</SectionTitle>
          <SectionSubtitle>Browse and order your prescribed medications</SectionSubtitle>

          {/* Search Section - Moved to Top */}
          <SearchContainer>
            <SearchForm>
              <SearchInput
                type="text"
                placeholder="Search medicines..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <SearchButton
                type="submit"
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </SearchButton>
              {searchQuery && (
                <ClearButton onClick={handleClearSearch}>
                  Clear
                </ClearButton>
              )}
            </SearchForm>

            {searchQuery && (
              <ResultsInfo>
                Showing results for "{searchQuery}"
              </ResultsInfo>
            )}
          </SearchContainer>

          {loading ? (
            <LoadingOverlay>
              <LoadingSpinner />
              Searching medicines...
            </LoadingOverlay>
          ) : medicines.length === 0 ? (
            <NoResults>
              <NoResultsIcon>🔍</NoResultsIcon>
              <h3>No medicines found</h3>
              <p>Try adjusting your search terms or browse all medicines.</p>
            </NoResults>
          ) : (
            <>
              <MedicineList>
                {medicines.map(medicine => (
                  <MedicineCard key={medicine.id}>
                    <MedicineHeader>
                      <MedicineIcon>💊</MedicineIcon>
                      <MedicineContent>
                        <MedicineName>{medicine.name}</MedicineName>
                        <MedicineGenericName>{medicine.genericName}</MedicineGenericName>
                        <MedicineManufacturer>
                          Manufacturer: {medicine.manufacturer}
                        </MedicineManufacturer>
                        <MedicineInfo>
                          <MedicinePrice>₹{medicine.price.toFixed(2)}</MedicinePrice>
                          <MedicineStock stock={medicine.stock}>
                            In stock: {medicine.stock} tablets
                          </MedicineStock>
                        </MedicineInfo>
                      </MedicineContent>
                    </MedicineHeader>

                    <MedicineCardFooter>
                      <QuantityControls>
                        <QuantityButton
                          onClick={() => handleQuantityChange(medicine.id, -1)}
                          disabled={(quantities[medicine.id] || 1) <= 1}
                        >
                          −
                        </QuantityButton>
                        <QuantityDisplay>
                          {quantities[medicine.id] || 1}
                        </QuantityDisplay>
                        <QuantityButton
                          onClick={() => handleQuantityChange(medicine.id, 1)}
                          disabled={(quantities[medicine.id] || 1) >= medicine.stock}
                        >
                          +
                        </QuantityButton>
                      </QuantityControls>
                      <AddToCartButton
                        onClick={() => handleAddToCart(medicine)}
                        disabled={medicine.stock === 0}
                      >
                        {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </AddToCartButton>
                    </MedicineCardFooter>
                  </MedicineCard>
                ))}
              </MedicineList>

              <PaginationContainer>
                <PageInfo>
                  Showing {medicines.length} of {pagination.total} medicines
                </PageInfo>
                <div>
                  <PaginationButton
                    disabled={pagination.page === 1 || loading}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </PaginationButton>
                  <span style={{ margin: '0 12px', color: '#666' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <PaginationButton
                    disabled={pagination.page === pagination.totalPages || loading}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </PaginationButton>
                </div>
              </PaginationContainer>
            </>
          )}
        </ContentArea>

        {/* Shopping Cart Sidebar with Prescription Upload */}
        <CartContainer>
          <CartTitle>Shopping Cart</CartTitle>

          {/* Prescription Upload Section - Moved to Cart Area with reduced width */}
          <UploadSection style={{ marginBottom: '20px', padding: '16px' }}>
            <UploadHeader>
              <UploadTitle style={{ fontSize: '18px' }}>Upload Prescription</UploadTitle>
              <UploadDescription style={{ fontSize: '14px' }}>
                Upload your doctor's prescription to get the exact medicines you need
              </UploadDescription>
            </UploadHeader>

            <UploadForm>
              <FormGroup>
                <Label htmlFor="doctorSelect" style={{ fontSize: '12px' }}>Select Doctor</Label>
                <Select
                  id="doctorSelect"
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.id === e.target.value);
                    setSelectedDoctor(doctor || null);
                    setDoctorId(e.target.value);
                  }}
                  disabled={doctorsLoading}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  <option value="">
                    {doctorsLoading ? 'Loading doctors...' : 'Select a doctor'}
                  </option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization} ({doctor.hospital})
                    </option>
                  ))}
                </Select>
                {selectedDoctor && (
                  <FileInfo style={{ fontSize: '11px', padding: '8px' }}>
                    Selected: Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} - {selectedDoctor.specialization}
                    <br />
                    <small>Hospital: {selectedDoctor.hospital} | Rating: {selectedDoctor.rating}/5</small>
                  </FileInfo>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="prescriptionFile" style={{ fontSize: '12px' }}>Prescription Image/File</Label>
                <FileInput
                  id="prescriptionFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '12px', padding: '12px' }}
                />
                {selectedFile && (
                  <FileInfo style={{ fontSize: '11px', padding: '8px' }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </FileInfo>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="notes" style={{ fontSize: '12px' }}>Notes (Optional)</Label>
                <TextArea
                  id="notes"
                  placeholder="Add any additional notes for the pharmacist"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ fontSize: '12px', padding: '8px 12px', minHeight: '60px' }}
                />
              </FormGroup>

              {uploadError && (
                <UploadErrorMessage style={{ fontSize: '11px', padding: '8px' }}>
                  {uploadError}
                </UploadErrorMessage>
              )}

              {uploadSuccess && (
                <SuccessMessage style={{ fontSize: '11px', padding: '8px' }}>
                  Prescription uploaded successfully! ✅ Ready for ordering.
                </SuccessMessage>
              )}

              {lastPrescriptionId && !orderSuccess && (
                <FileInfo style={{ fontSize: '11px', padding: '8px' }}>
                  📋 Prescription ready for order (ID: {lastPrescriptionId.slice(-8)})
                </FileInfo>
              )}


              {!lastPrescriptionId && !orderSuccess && (
                <FileInfo style={{ background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E', fontSize: '11px', padding: '8px' }}>
                  📋 Upload a prescription to start ordering medicines
                </FileInfo>
              )}

              <UploadButton
                onClick={handlePrescriptionUpload}
                disabled={uploadLoading || !selectedFile || !selectedDoctor}
                style={{ fontSize: '12px', padding: '10px 16px' }}
              >
                {uploadLoading ? 'Uploading...' : 'Upload Prescription'}
              </UploadButton>
            </UploadForm>
          </UploadSection>

          {cart.length === 0 ? (
            <EmptyCart>
              <EmptyCartIcon>🛒</EmptyCartIcon>
              <p>Your cart is empty</p>
            </EmptyCart>
          ) : (
            <>
              <CartItems>
                {cart.map(item => (
                  <CartItem key={item.medicine.id}>
                    <CartItemInfo>
                      <CartItemName>{item.medicine.name}</CartItemName>
                      <CartItemPrice>₹{item.medicine.price.toFixed(2)} each</CartItemPrice>
                      <QuantityControls>
                        <QuantityButton
                          onClick={() => updateCartQuantity(item.medicine.id, item.quantity - 1)}
                        >
                          −
                        </QuantityButton>
                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                        <QuantityButton
                          onClick={() => updateCartQuantity(item.medicine.id, item.quantity + 1)}
                          disabled={item.quantity >= item.medicine.stock}
                        >
                          +
                        </QuantityButton>
                      </QuantityControls>
                    </CartItemInfo>
                    <div>
                      <RemoveButton onClick={() => removeFromCart(item.medicine.id)}>
                        Remove
                      </RemoveButton>
                    </div>
                  </CartItem>
                ))}
              </CartItems>

              <CartSummary>
                <SummaryRow>
                  <span>Subtotal:</span>
                  <span>₹{getCartSummary().subtotal.toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Delivery Fee:</span>
                  <span>₹5.00</span>
                </SummaryRow>
                <SummaryTotal>
                  <span>Total:</span>
                  <span>₹{getCartSummary().total.toFixed(2)}</span>
                </SummaryTotal>

                {orderError && (
                  <UploadErrorMessage style={{ marginTop: '12px', marginBottom: '12px' }}>
                    {orderError}
                  </UploadErrorMessage>
                )}

                {!lastPrescriptionId && !orderSuccess && (
                  <UploadErrorMessage style={{ marginTop: '12px', marginBottom: '12px' }}>
                    Please upload a prescription before placing an order
                  </UploadErrorMessage>
                )}

                {!orderSuccess && lastPrescriptionId && (
                  <CheckoutButton
                    onClick={handleOrderMedicine}
                    disabled={orderLoading || cart.length === 0}
                  >
                    {orderLoading ? 'Placing Order...' : 'Order Medicine'}
                  </CheckoutButton>
                )}

                {orderSuccess && (
                  <SuccessMessage style={{ marginTop: '12px', marginBottom: '12px' }}>
                    {orderSuccess}
                  </SuccessMessage>
                )}
              </CartSummary>
            </>
          )}
        </CartContainer>
      </MainContent>
    </PageContainer>
  );
};