import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import activityLogService from '../../services/activityLogService';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import ActiveFilters from '../../components/common/ActiveFilters';
import Pagination from '../../components/common/Pagination';
import SortSelect from '../../components/common/SortSelect';

const ActivityLogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    action: searchParams.get('action') || '',
    entityType: searchParams.get('entityType') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  });
  
  const [pagination, setPagination] = useState({ 
    page: parseInt(searchParams.get('page')) || 1, 
    limit: 20, 
    total: 0, 
    totalPages: 1 
  });

  const [sort, setSort] = useState({
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const fetchLogs = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await activityLogService.getLogs({
        ...filters,
        ...sort,
        page: pageToFetch,
        limit: pagination.limit
      });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
      
      // Sync URL
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      if (sort.sortBy !== 'createdAt') newParams.set('sortBy', sort.sortBy);
      if (sort.sortOrder !== 'desc') newParams.set('sortOrder', sort.sortOrder);
      Object.keys(filters).forEach(key => {
        if (filters[key]) newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setSort({ sortBy, sortOrder });
  };

  const handleClearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));
  const handleClearAll = () => setFilters({ action: '', entityType: '', startDate: '', endDate: '' });

  const getActionBadgeStyle = (action) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) return { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
    if (action.includes('DEACTIVATED') || action.includes('CANCELLED') || action.includes('REJECTED') || action.includes('DENIED')) return { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
    if (action.includes('UPDATED') || action.includes('CHANGED')) return { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
    return { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
  };

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Activity Logs</h1>
        <p>Audit trail of system administrative and operational actions.</p>
      </div>

      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

      <FilterBar>
        <SearchBar 
          value={filters.action} 
          onChange={handleFilterChange} 
          name="action"
          placeholder="Search action..." 
        />
        <FilterSelect 
          name="entityType" 
          value={filters.entityType} 
          onChange={handleFilterChange}
          defaultLabel="All Entities"
          options={[
            { value: 'User', label: 'User' },
            { value: 'ParkingSpot', label: 'Parking Spot' },
            { value: 'Reservation', label: 'Reservation' },
            { value: 'Visitor', label: 'Visitor' },
            { value: 'GateEntry', label: 'Gate Entry' }
          ]}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>From:</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>To:</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <SortSelect 
          sortBy={sort.sortBy}
          sortOrder={sort.sortOrder}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'createdAt', label: 'Date' }
          ]}
        />
      </FilterBar>

      {error && <div className="error-state">{error}</div>}

      {loading && !logs.length ? (
        <div className="loading-state">Loading activity logs...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem' }}>Time</th>
                <th style={{ padding: '1rem' }}>Actor</th>
                <th style={{ padding: '1rem' }}>Action</th>
                <th style={{ padding: '1rem' }}>Entity Type</th>
                <th style={{ padding: '1rem' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {log.actor ? `${log.actor.name} (${log.actor.role})` : 'System'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      ...getActionBadgeStyle(log.action)
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.entityType}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No activity logs found for the selected criteria.
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination 
        page={pagination.page} 
        totalPages={pagination.totalPages} 
        totalItems={pagination.total} 
        onPageChange={(p) => fetchLogs(p)} 
      />
    </div>
  );
};

export default ActivityLogsPage;
