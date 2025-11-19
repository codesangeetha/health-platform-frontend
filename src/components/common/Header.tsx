import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/landing-page.css';

interface HeaderProps {
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`hc-header ${!transparent || scrolled ? 'scrolled' : ''}`}>
      <div className="hc-container hc-header__inner">
        <Link to="/" className="hc-logo" aria-label="HealthCare+ Home">
          <span className="hc-logo__mark">+</span>
          <span>HealthCare+</span>
        </Link>
        <nav className="hc-nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
};