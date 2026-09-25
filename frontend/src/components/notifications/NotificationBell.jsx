import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import './Notifications.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    registerListener('notification:new', handleNewNotification);

    return () => {
      unregisterListener('notification:new', handleNewNotification);
    };
  }, [registerListener, unregisterListener]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      const safeData = Array.isArray(data) ? data : (data?.data || []);
      setNotifications(safeData);
      setUnreadCount(safeData.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notification.isRead && <div className="notification-dot"></div>}
                </div>
              ))
            )}
          </div>
          <div className="notification-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
