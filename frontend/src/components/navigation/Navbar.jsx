import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Car } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check saved theme
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <Car className="brand-icon" size={24} />
          <span className="brand-name">ParkNexus</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu hide-mobile">
          {!isAuthenticated ? (
            <>
              <a href="/#features" className="nav-link">Features</a>
              <a href="/#how-it-works" className="nav-link">How It Works</a>
              <a href="/#about" className="nav-link">About</a>
            </>
          ) : (
            <>
              <Link to="/parking-map" className="nav-link">Parking Map</Link>
              {user?.role === 'resident' && (
                <Link to="/my-parking" className="nav-link">My Parking</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/parking" className="nav-link">Manage Parking</Link>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions hide-mobile">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
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
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {!isAuthenticated ? (
            <>
              <a href="/#features" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="/#how-it-works" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
              <a href="/#about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            </>
          ) : (
            <>
              <Link to="/parking-map" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Parking Map</Link>
              {user?.role === 'resident' && (
                <Link to="/my-parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Parking</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Manage Parking</Link>
              )}
            </>
          )}
          <div className="mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="btn btn-outline mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <button 
                  className="btn btn-primary mobile-btn" 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
