import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import AuthCard from './AuthCard';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedInUser?.role === 'security') {
        navigate('/security/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Invalid email or password.');
      } else if (err.request) {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <span>
      Don't have an account? <Link to="/register" className="auth-link">Register</Link>
    </span>
  );

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your ParkNexus account" footer={footer}>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isSubmitting}
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
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
        
        <button 
          type="submit" 
          className="btn btn-primary btn-large auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthCard>
  );
};

export default LoginForm;


