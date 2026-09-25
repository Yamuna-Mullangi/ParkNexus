import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

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
        <Link to="/" className="navbar-brand">
          <Car className="brand-icon" size={24} />
          <span className="brand-name">ParkNexus</span>
        </Link>

        {/* Desktop Menu - ONLY public links */}
        <div className="navbar-menu hide-mobile" style={{ gap: '2rem' }}>
          <a href="/#home" className="nav-link">Home</a>
          <a href="/#features" className="nav-link">Features</a>
          <a href="/#about" className="nav-link">About</a>
        </div>

        {/* Actions */}
        <div className="navbar-actions hide-mobile">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme" style={{ marginRight: '1rem' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {isAuthenticated ? (
            <Link to="/resident/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="nav-link btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle">
          <button onClick={toggleTheme} className="theme-toggle mr-sm" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
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
          <a href="/#home" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="/#features" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="/#about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          
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
