import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import AuthCard from './AuthCard';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'resident'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <span>
      Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
    </span>
  );

  return (
    <AuthCard title="Create your account" footer={footer}>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role">Role</label>
          <select 
            id="role" 
            className="form-select" 
            value={formData.role} 
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="resident">Resident</option>
            {/* Note: Admin and Security roles should normally not be registerable from public page, but included here based on requirements if a selector is shown, wait the requirements said: "If a role selector is displayed, do not expose unrestricted admin registration." So I will only show resident. */}
          </select>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-large auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
