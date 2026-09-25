import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ParkingMapPage from '../pages/resident/ParkingMapPage';
import MyParkingPage from '../pages/resident/MyParkingPage';
import VehiclesPage from '../pages/resident/VehiclesPage';
import ReservationsPage from '../pages/resident/ReservationsPage';
import ParkingSharingPage from '../pages/resident/ParkingSharingPage';
import SharedParkingPage from '../pages/resident/SharedParkingPage';
import ShareRequestsPage from '../pages/resident/ShareRequestsPage';
import ParkingManagementPage from '../pages/admin/ParkingManagementPage';
import VisitorsPage from '../pages/resident/VisitorsPage';
import VisitorPassPage from '../pages/resident/VisitorPassPage';
import VisitorVerificationPage from '../pages/security/VisitorVerificationPage';
import SecurityDashboardPage from '../pages/security/SecurityDashboardPage';
import ActiveVisitorsPage from '../pages/security/ActiveVisitorsPage';
import GateHistoryPage from '../pages/security/GateHistoryPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import ResidentDashboardPage from '../pages/resident/ResidentDashboardPage';
import SettingsPage from '../pages/resident/SettingsPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import FavoriteParkingPage from '../pages/resident/FavoriteParkingPage';
import OperationsCalendarPage from '../pages/calendar/OperationsCalendarPage';
import ActivityHistoryPage from '../pages/activity/ActivityHistoryPage';
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
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Parking Routes */}
        <Route path="/parking-map" element={<ParkingMapPage />} />
        <Route path="/my-parking" element={<MyParkingPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/share-my-parking" element={<ParkingSharingPage />} />
        <Route path="/shared-parking" element={<SharedParkingPage />} />
        <Route path="/share-requests" element={<ShareRequestsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/calendar" element={<OperationsCalendarPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/parking" element={<ParkingManagementPage />} />
        <Route path="/admin/logs" element={<ActivityLogsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/settings" element={<SystemSettingsPage />} />

        {/* Resident Routes */}
        <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
        <Route path="/resident/calendar" element={<OperationsCalendarPage />} />
        <Route path="/resident/history" element={<ActivityHistoryPage />} />
        <Route path="/resident/parking" element={<ParkingMapPage />} />
        <Route path="/resident/favorites" element={<FavoriteParkingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Visitor Routes */}
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/visitor-passes/:id" element={<VisitorPassPage />} />

        {/* Security Routes */}
        <Route path="/security/dashboard" element={<SecurityDashboardPage />} />
        <Route path="/security/calendar" element={<OperationsCalendarPage />} />
        <Route path="/security/verify" element={<VisitorVerificationPage />} />
        <Route path="/security/active" element={<ActiveVisitorsPage />} />
        <Route path="/security/history" element={<GateHistoryPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
