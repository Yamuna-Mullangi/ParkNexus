import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from './ThemeToggle';
import './AppHeader.css';

const AppHeader = ({ toggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('parknexus-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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
    <header className="app-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
      </div>

      <div className="header-right">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        
        <NotificationBell />
        
        <div className="user-menu-container">
          <div className="user-profile-btn">
            <UserCircle size={24} />
            <span className="user-name hide-mobile">{user?.name}</span>
          </div>
          <div className="user-dropdown">
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

