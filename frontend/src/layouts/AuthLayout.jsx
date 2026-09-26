import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Car } from 'lucide-react';
import './Layouts.css';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  // If already authenticated, redirect to dashboard based on role
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'security') return <Navigate to="/security/dashboard" replace />;
    return <Navigate to="/resident/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-layout-inner">
        <div className="auth-logo-container">
          <Link to="/" className="auth-brand-centered">
            <Car className="brand-icon" size={32} />
            <span className="brand-text">ParkNexus</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
