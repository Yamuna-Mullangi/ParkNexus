import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Car } from 'lucide-react';
import './Layouts.css'; // Will create this for simple Auth header

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
      <div className="auth-header">
        <Link to="/" className="auth-brand">
          <Car className="brand-icon" size={28} style={{ color: '#2563eb' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>ParkNexus</span>
        </Link>
      </div>
      <div className="auth-content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
