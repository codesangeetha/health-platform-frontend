/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F8F9FA;
  position: relative;
  overflow: hidden;
`;

const MainWrapper = styled.div`
  flex: 1;
  padding-left: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8F9FA;
  position: relative;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 80px 32px 32px;
  background-color: #F8F9FA;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  min-height: calc(100vh - 64px); /* Subtracting header height */
`;

const FooterWrapper = styled.footer`
  padding: 16px 32px;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  text-align: center;
  color: #666666;
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const AppLayout = ({ children, className = '' }: LayoutProps) => {
  return (
    <LayoutContainer className={className}>
      {children}
    </LayoutContainer>
  );
};

export const MainContainer = ({ children, className = '' }: LayoutProps) => {
  return (
    <MainWrapper className={className}>
      <MainContent>{children}</MainContent>
    </MainWrapper>
  );
};

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <FooterWrapper>
      <p>© {currentYear} HealthCare+. All rights reserved.</p>
    </FooterWrapper>
  );
};

// Named exports
export { LayoutContainer, MainWrapper, MainContent, FooterWrapper };