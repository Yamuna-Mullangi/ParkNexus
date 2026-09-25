import React from 'react';
import './Auth.css';

const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-card-container animate-fade-in">
      <div className="auth-card">
        <h2 className="auth-title">{title}</h2>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        <div className="auth-body">
          {children}
        </div>
        {footer && (
          <div className="auth-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCard;
