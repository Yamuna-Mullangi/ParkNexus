import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import ActiveFilters from '../../components/common/ActiveFilters';
import Pagination from '../../components/common/Pagination';
import SortSelect from '../../components/common/SortSelect';
import DateRangeFilter from '../../components/common/DateRangeFilter';

const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    dateRange: searchParams.get('dateRange') || ''
  });

  const [pagination, setPagination] = useState({ 
    page: parseInt(searchParams.get('page')) || 1, 
    limit: 10, 
    total: 0, 
    totalPages: 1 
  });

  const [sort, setSort] = useState({
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    fetchNotifications(pagination.page);

    const handleNewNotification = (notification) => {
      // Just re-fetch to keep pagination accurate or manually add if page=1 and sort=desc
      if (pagination.page === 1 && sort.sortBy === 'createdAt' && sort.sortOrder === 'desc') {
        fetchNotifications(1);
      }
    };

    registerListener('notification:new', handleNewNotification);

    return () => {
      unregisterListener('notification:new', handleNewNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, registerListener, unregisterListener]);

  const fetchNotifications = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        ...filters,
        ...sort,
        page: pageToFetch,
        limit: pagination.limit
      });
      // Handle array vs paginated object response
      if (Array.isArray(res)) {
        setNotifications(res);
        setPagination(prev => ({ ...prev, page: 1, total: res.length, totalPages: 1 }));
      } else {
        setNotifications(res.data);
        setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      }
      
      // Sync URL
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      if (sort.sortBy !== 'createdAt') newParams.set('sortBy', sort.sortBy);
      if (sort.sortOrder !== 'desc') newParams.set('sortOrder', sort.sortOrder);
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All Time') newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setSort({ sortBy, sortOrder });
  };

  const handleClearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));
  const handleClearAll = () => setFilters({ search: '', status: '', dateRange: '' });

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Notifications</h1>
          <p>Stay updated on your parking and visitor activities.</p>
        </div>
        <button 
          onClick={handleMarkAllAsRead} 
          className="btn btn-outline" 
          disabled={!notifications.some(n => !n.isRead)}
        >
          Mark all as read
        </button>
      </div>

      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

      <FilterBar>
        <SearchBar 
          value={filters.search} 
          onChange={handleFilterChange} 
          placeholder="Search notifications..." 
        />
        <FilterSelect 
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          defaultLabel="All Statuses"
          options={[
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' }
          ]}
        />
        <DateRangeFilter value={filters.dateRange} onChange={handleFilterChange} />
        <SortSelect 
          sortBy={sort.sortBy}
          sortOrder={sort.sortOrder}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'createdAt', label: 'Date' }
          ]}
        />
      </FilterBar>

      {loading ? (
        <div className="loading-state">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h3>No notifications match your filters</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              style={{ 
                background: notification.isRead ? 'var(--bg-card)' : 'rgba(59, 130, 246, 0.05)', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: notification.isRead ? '1px solid var(--border-color)' : '1px solid #3b82f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: !notification.isRead ? 'pointer' : 'default'
              }}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!notification.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>}
                  {notification.title}
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>{notification.message}</p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          <Pagination 
            page={pagination.page} 
            totalPages={pagination.totalPages} 
            totalItems={pagination.total} 
            onPageChange={(p) => fetchNotifications(p)} 
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
