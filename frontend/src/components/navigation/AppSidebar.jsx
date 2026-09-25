import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  LayoutDashboard, Map, Calendar, History, Star, 
  CarFront, Users, Ticket, Share2, Send, 
  ShieldCheck, Activity, FileText, Settings, UserCircle, Car
} from 'lucide-react';
import './Sidebar.css';

const AppSidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const renderResidentLinks = () => (
    <>
      <Link to="/resident/dashboard" className={`sidebar-link ${isActive('/resident/dashboard')}`} onClick={closeMobileMenu}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link to="/parking-map" className={`sidebar-link ${isActive('/parking-map')}`} onClick={closeMobileMenu}>
        <Map size={20} /> Parking Map
      </Link>
      <Link to="/resident/calendar" className={`sidebar-link ${isActive('/resident/calendar')}`} onClick={closeMobileMenu}>
        <Calendar size={20} /> Calendar
      </Link>
      <Link to="/my-parking" className={`sidebar-link ${isActive('/my-parking')}`} onClick={closeMobileMenu}>
        <CarFront size={20} /> My Parking
      </Link>
      <Link to="/reservations" className={`sidebar-link ${isActive('/reservations')}`} onClick={closeMobileMenu}>
        <Ticket size={20} /> Reservations
      </Link>
      <Link to="/vehicles" className={`sidebar-link ${isActive('/vehicles')}`} onClick={closeMobileMenu}>
        <CarFront size={20} /> Vehicles
      </Link>
      <Link to="/visitors" className={`sidebar-link ${isActive('/visitors')}`} onClick={closeMobileMenu}>
        <Users size={20} /> Visitors
      </Link>
      <div className="sidebar-divider"></div>
      <div className="sidebar-group-title">Sharing</div>
      <Link to="/shared-parking" className={`sidebar-link ${isActive('/shared-parking')}`} onClick={closeMobileMenu}>
        <Share2 size={20} /> Shared Parking
      </Link>
      <Link to="/share-my-parking" className={`sidebar-link ${isActive('/share-my-parking')}`} onClick={closeMobileMenu}>
        <Send size={20} /> Share My Space
      </Link>
      <Link to="/share-requests" className={`sidebar-link ${isActive('/share-requests')}`} onClick={closeMobileMenu}>
        <History size={20} /> Requests
      </Link>
      <div className="sidebar-divider"></div>
      <Link to="/resident/favorites" className={`sidebar-link ${isActive('/resident/favorites')}`} onClick={closeMobileMenu}>
        <Star size={20} /> Favorites
      </Link>
      <Link to="/resident/history" className={`sidebar-link ${isActive('/resident/history')}`} onClick={closeMobileMenu}>
        <History size={20} /> History
      </Link>
      <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`} onClick={closeMobileMenu}>
        <UserCircle size={20} /> Profile
      </Link>
      <Link to="/settings" className={`sidebar-link ${isActive('/settings')}`} onClick={closeMobileMenu}>
        <Settings size={20} /> Settings
      </Link>
    </>
  );

  const renderSecurityLinks = () => (
    <>
      <Link to="/security/dashboard" className={`sidebar-link ${isActive('/security/dashboard')}`} onClick={closeMobileMenu}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link to="/security/calendar" className={`sidebar-link ${isActive('/security/calendar')}`} onClick={closeMobileMenu}>
        <Calendar size={20} /> Calendar
      </Link>
      <Link to="/security/verify" className={`sidebar-link ${isActive('/security/verify')}`} onClick={closeMobileMenu}>
        <ShieldCheck size={20} /> Visitor Verification
      </Link>
      <Link to="/security/active" className={`sidebar-link ${isActive('/security/active')}`} onClick={closeMobileMenu}>
        <Users size={20} /> Active Visitors
      </Link>
      <Link to="/security/history" className={`sidebar-link ${isActive('/security/history')}`} onClick={closeMobileMenu}>
        <History size={20} /> Gate History
      </Link>
      <div className="sidebar-divider"></div>
      <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`} onClick={closeMobileMenu}>
        <UserCircle size={20} /> Profile
      </Link>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard')}`} onClick={closeMobileMenu}>
        <LayoutDashboard size={20} /> Analytics
      </Link>
      <Link to="/admin/calendar" className={`sidebar-link ${isActive('/admin/calendar')}`} onClick={closeMobileMenu}>
        <Calendar size={20} /> Calendar
      </Link>
      <Link to="/admin/users" className={`sidebar-link ${isActive('/admin/users')}`} onClick={closeMobileMenu}>
        <Users size={20} /> Users
      </Link>
      <Link to="/admin/parking" className={`sidebar-link ${isActive('/admin/parking')}`} onClick={closeMobileMenu}>
        <Map size={20} /> Parking
      </Link>
      <Link to="/admin/logs" className={`sidebar-link ${isActive('/admin/logs')}`} onClick={closeMobileMenu}>
        <Activity size={20} /> Logs
      </Link>
      <Link to="/admin/reports" className={`sidebar-link ${isActive('/admin/reports')}`} onClick={closeMobileMenu}>
        <FileText size={20} /> Reports
      </Link>
      <Link to="/admin/settings" className={`sidebar-link ${isActive('/admin/settings')}`} onClick={closeMobileMenu}>
        <Settings size={20} /> Settings
      </Link>
      <div className="sidebar-divider"></div>
      <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`} onClick={closeMobileMenu}>
        <UserCircle size={20} /> Profile
      </Link>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}
      
      <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Car className="brand-icon" size={24} />
          <span className="brand-name">ParkNexus</span>
        </div>
        
        <div className="sidebar-content">
          {user?.role === 'resident' && renderResidentLinks()}
          {user?.role === 'security' && renderSecurityLinks()}
          {user?.role === 'admin' && renderAdminLinks()}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
