import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import activityHistoryService from '../../services/activityHistoryService';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import { useSocket } from '../../context/SocketContext';
import './ActivityHistoryPage.css';

const ActivityHistoryPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { registerListener, unregisterListener } = useSocket();
  
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const initialType = searchParams.get('type') || 'all';
  const initialStatus = searchParams.get('status') || 'all';
  const initialDateRange = searchParams.get('dateRange') || 'All Time';
  const initialSearch = searchParams.get('search') || '';

  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const [filters, setFilters] = useState({
    page: initialPage,
    type: initialType,
    status: initialStatus,
    dateRange: initialDateRange,
    search: initialSearch
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [historyRes, summaryRes] = await Promise.all([
        activityHistoryService.getActivityHistory(filters),
        activityHistoryService.getActivitySummary()
      ]);
      setActivities(historyRes.data || []);
      setPagination(historyRes.pagination || { page: 1, pages: 1 });
      setSummary(summaryRes.data || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Sync to URL
    const params = new URLSearchParams();
    if (filters.page > 1) params.set('page', filters.page);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.dateRange !== 'All Time') params.set('dateRange', filters.dateRange);
    if (filters.search) params.set('search', filters.search);
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const handleUpdate = () => loadData();
    registerListener('reservation:updated', handleUpdate);
    registerListener('visitor:updated', handleUpdate);
    registerListener('gate:updated', handleUpdate);
    registerListener('notification:new', handleUpdate);
    
    return () => {
      unregisterListener('reservation:updated', handleUpdate);
      unregisterListener('visitor:updated', handleUpdate);
      unregisterListener('gate:updated', handleUpdate);
      unregisterListener('notification:new', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerListener, unregisterListener]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const val = e.target.elements.searchInput.value;
    setFilters(prev => ({ ...prev, search: val, page: 1 }));
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) setFilters(prev => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{user.role === 'admin' ? 'System History' : 'Activity History'}</h1>
        <p>Review your past and upcoming events.</p>
      </div>

      <div className="activity-summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="card summary-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div className="summary-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
            <div className="summary-label" style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontSize: '0.85rem' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        ))}
      </div>

      <div className="filters-container card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input type="text" name="searchInput" defaultValue={filters.search} placeholder="Search activity..." className="form-input" style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <select name="type" value={filters.type} onChange={handleFilterChange} className="form-input">
          <option value="all">All Types</option>
          {user.role !== 'security' && <option value="reservation">Reservations</option>}
          <option value="visitor">Visitors</option>
          <option value="gateEntry">Gate Entries</option>
          {user.role !== 'security' && <option value="parkingShare">Parking Shares</option>}
          {user.role !== 'security' && <option value="notification">Notifications</option>}
          {user.role === 'admin' && <option value="activityLog">Audit Logs</option>}
        </select>
        <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="form-input">
          <option value="All Time">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
        </select>
      </div>

      {error ? (
        <div className="error-state">{error}</div>
      ) : loading && activities.length === 0 ? (
        <div className="loading-state">Loading history...</div>
      ) : (
        <ActivityTimeline activities={activities} role={user.role} />
      )}

      {activities.length > 0 && pagination.pages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-outline" onClick={handlePrevPage} disabled={pagination.page === 1}>Previous</button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button className="btn btn-outline" onClick={handleNextPage} disabled={pagination.page === pagination.pages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ActivityHistoryPage;
