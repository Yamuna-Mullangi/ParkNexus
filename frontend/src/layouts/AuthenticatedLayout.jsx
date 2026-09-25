import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/navigation/AppSidebar';
import AppHeader from '../components/navigation/AppHeader';
import './Layouts.css';

const AuthenticatedLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      <AppSidebar isMobileOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
      
      <div className="app-main">
        <AppHeader toggleMobileMenu={toggleMobileMenu} />
        
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
