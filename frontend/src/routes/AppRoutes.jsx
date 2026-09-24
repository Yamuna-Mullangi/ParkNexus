import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ParkingMapPage from '../pages/resident/ParkingMapPage';
import MyParkingPage from '../pages/resident/MyParkingPage';
import ParkingManagementPage from '../pages/admin/ParkingManagementPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Parking Routes */}
        <Route path="/parking-map" element={<ParkingMapPage />} />
        <Route path="/my-parking" element={<MyParkingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/parking" element={<ParkingManagementPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
