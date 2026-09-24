import React from 'react';
import useAuth from '../../hooks/useAuth';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-card animate-fade-in">
      <div className="profile-avatar">
        {getInitials(user?.name)}
      </div>
      <h2 className="profile-name">{user?.name}</h2>
      <div className="profile-role">{user?.role}</div>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handleLogout} 
          className="btn btn-outline" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
