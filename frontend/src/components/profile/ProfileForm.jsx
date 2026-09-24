import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import '../auth/Auth.css'; // Reuse form styles

const ProfileForm = () => {
  const { user, updateUserContext } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send allowed update fields
      const updatedData = {
        name: formData.name,
        phone: formData.phone
      };
      
      const updatedUser = await userService.updateProfile(updatedData);
      updateUserContext(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-details animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 className="profile-details-title">Profile Information</h3>
      
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email (Read Only)</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={formData.email}
            disabled={true}
            style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed' }}
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
        
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
