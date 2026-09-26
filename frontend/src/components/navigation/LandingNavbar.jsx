import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';
import logo from '../../assets/logo.png';
import ThemeToggle from './ThemeToggle';

const LandingNavbar = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('parknexus-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('parknexus-theme', newTheme);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" style={{ flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative', top: '10px' }}>
          <img src={logo} alt="ParkNexus Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
          <span className="brand-name" style={{ fontSize: '0.9rem', lineHeight: '1', color: 'var(--color-text)' }}>ParkNexus</span>
        </Link>

        {/* Desktop Menu - ONLY public links */}
        <div className="navbar-menu hide-mobile" style={{ gap: '1rem' }}>
          <a href="/#home" className="nav-pattern-btn">Home</a>
          <a href="/#features" className="nav-pattern-btn">Features</a>
          <a href="/#about" className="nav-pattern-btn">About</a>
        </div>

        {/* Actions */}
        <div className="navbar-actions hide-mobile">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          
          {isAuthenticated ? (
            <Link to="/resident/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button 
            className="menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="/#home" className="mobile-link nav-pattern-btn" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="/#features" className="mobile-link nav-pattern-btn" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="/#about" className="mobile-link nav-pattern-btn" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          
          <div className="mobile-actions" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {isAuthenticated ? (
              <Link to="/resident/dashboard" className="btn btn-primary mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;

