import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';
import logo from '../../assets/logo.png';

import NotificationBell from '../notifications/NotificationBell';

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
        <Link to="/" className="navbar-brand" style={{ flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative', top: '10px' }}>
          <img src={logo} alt="ParkNexus Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
          <span className="brand-name" style={{ fontSize: '0.9rem', lineHeight: '1', color: 'var(--color-text)' }}>ParkNexus</span>
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
                <>
                  <Link to="/resident/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/resident/calendar" className="nav-link">Calendar</Link>
                  <Link to="/resident/history" className="nav-link">History</Link>
                  <Link to="/resident/favorites" className="nav-link">Favorites</Link>
                  <Link to="/my-parking" className="nav-link">My Parking</Link>
                  <Link to="/vehicles" className="nav-link">Vehicles</Link>
                  <Link to="/visitors" className="nav-link">Visitors</Link>
                  <Link to="/reservations" className="nav-link">Reservations</Link>
                  <Link to="/shared-parking" className="nav-link">Shared Parking</Link>
                  <Link to="/share-my-parking" className="nav-link">Share My Space</Link>
                  <Link to="/share-requests" className="nav-link">Requests</Link>
                </>
              )}
              {user?.role === 'security' && (
                <>
                  <Link to="/security/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/security/calendar" className="nav-link">Calendar</Link>
                  <Link to="/security/verify" className="nav-link">Visitor Verification</Link>
                  <Link to="/security/active" className="nav-link">Active Visitors</Link>
                  <Link to="/security/history" className="nav-link">Gate History</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Analytics</Link>
                  <Link to="/admin/calendar" className="nav-link">Calendar</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/parking" className="nav-link">Parking</Link>
                  <Link to="/admin/logs" className="nav-link">Logs</Link>
                  <Link to="/admin/reports" className="nav-link">Reports</Link>
                  <Link to="/admin/settings" className="nav-link">Settings</Link>
                </>
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
              <NotificationBell />
              <Link to="/profile" className="nav-link">Profile</Link>
              {user?.role === 'resident' && (
                <Link to="/settings" className="nav-link">Settings</Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle">
          {isAuthenticated && <NotificationBell />}
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
                <>
                  <Link to="/resident/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/resident/calendar" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Calendar</Link>
                  <Link to="/resident/history" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>History</Link>
                  <Link to="/resident/favorites" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Favorites</Link>
                  <Link to="/my-parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Parking</Link>
                  <Link to="/vehicles" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Vehicles</Link>
                  <Link to="/visitors" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Visitors</Link>
                  <Link to="/reservations" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Reservations</Link>
                  <Link to="/shared-parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Shared Parking</Link>
                  <Link to="/share-my-parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Share My Space</Link>
                  <Link to="/share-requests" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Requests</Link>
                </>
              )}
              {user?.role === 'security' && (
                <>
                  <Link to="/security/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/security/calendar" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Calendar</Link>
                  <Link to="/security/verify" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Visitor Verification</Link>
                  <Link to="/security/active" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Active Visitors</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link>
                  <Link to="/admin/calendar" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Calendar</Link>
                  <Link to="/admin/users" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
                  <Link to="/admin/parking" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Parking</Link>
                  <Link to="/admin/logs" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Logs</Link>
                  <Link to="/admin/reports" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Reports</Link>
                  <Link to="/admin/settings" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
                </>
              )}
            </>
          )}
          <div className="mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="btn btn-outline mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                {user?.role === 'resident' && (
                  <Link to="/settings" className="btn btn-outline mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
                )}
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
