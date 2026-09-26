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
      <video 
        autoPlay 
        muted 
        loop 
        className="auth-video-bg"
      >
        <source src="/gemini_generated_video_134dcde1.mp4" type="video/mp4" />
      </video>
      <div className="auth-overlay"></div>
      
      <div className="auth-layout-inner auth-content-wrapper">
        <div className="auth-logo-container" style={{ alignSelf: 'flex-start', marginLeft: '10px' }}>
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
