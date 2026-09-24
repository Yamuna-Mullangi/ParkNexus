import React from 'react';
import Navbar from '../../components/navigation/Navbar';
import ProfileCard from '../../components/profile/ProfileCard';
import ProfileForm from '../../components/profile/ProfileForm';

const ProfilePage = () => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="profile-page">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h1 className="section-title">My Profile</h1>
          </div>
          
          <div className="profile-container">
            <ProfileCard />
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
