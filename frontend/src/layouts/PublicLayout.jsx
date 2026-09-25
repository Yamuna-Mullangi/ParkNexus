import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LandingNavbar from '../components/navigation/LandingNavbar';
import Footer from '../components/landing/Footer';

const PublicLayout = () => {
  const { isAuthenticated, user } = useAuth();

  // If user is logged in, optionally redirect them away from landing page
  // But usually landing page is accessible, so we just render the public navbar.
  // Actually, per requirements: 
  // "After successful login: redirect to the appropriate authenticated dashboard."
  // Wait, if they visit '/', should they be redirected? 
  // Let's just render the outlet, LandingNavbar handles showing "Go to Dashboard".
  
  return (
    <div className="public-layout">
      <LandingNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default PublicLayout;
