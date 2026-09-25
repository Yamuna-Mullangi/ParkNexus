import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import gateService from '../../services/gateService';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import ActiveFilters from '../../components/common/ActiveFilters';
import Pagination from '../../components/common/Pagination';
import SortSelect from '../../components/common/SortSelect';
import DateRangeFilter from '../../components/common/DateRangeFilter';

const GateHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    sortBy: searchParams.get('sortBy') || 'entryTime',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  useEffect(() => {
    fetchHistory(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  const fetchHistory = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await gateService.getGateHistory({
        ...filters,
        ...sort,
        page: pageToFetch,
        limit: pagination.limit
      });
      // Handle array vs paginated object response
      if (Array.isArray(res)) {
        setHistory(res);
        setPagination(prev => ({ ...prev, page: 1, total: res.length, totalPages: 1 }));
      } else {
        setHistory(res.data);
        setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      }
      
      // Sync URL
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      if (sort.sortBy !== 'entryTime') newParams.set('sortBy', sort.sortBy);
      if (sort.sortOrder !== 'desc') newParams.set('sortOrder', sort.sortOrder);
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All Time') newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
      
      setError(null);
    } catch (err) {
      setError('Failed to load gate history.');
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

  const getStatusStyle = (status) => {
    switch(status) {
      case 'checked_in': return { bg: '#dcfce7', color: '#166534', label: 'CHECKED IN' };
      case 'checked_out': return { bg: '#e0f2fe', color: '#075985', label: 'CHECKED OUT' };
      case 'denied': return { bg: '#fee2e2', color: '#991b1b', label: 'DENIED' };
      case 'cancelled': return { bg: '#f1f5f9', color: '#475569', label: 'CANCELLED' };
      default: return { bg: '#f1f5f9', color: '#475569', label: status.toUpperCase() };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gate History</h1>
        <p>View the historical log of all visitor entries and exits.</p>
      </div>
      
      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

      <FilterBar>
        <SearchBar 
          value={filters.search} 
          onChange={handleFilterChange} 
          placeholder="Search by visitor or resident name..." 
        />
        <FilterSelect 
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          defaultLabel="All Statuses"
          options={[
            { value: 'checked_in', label: 'Checked In' },
            { value: 'checked_out', label: 'Checked Out' },
            { value: 'denied', label: 'Denied' }
          ]}
        />
        <DateRangeFilter value={filters.dateRange} onChange={handleFilterChange} />
        <SortSelect 
          sortBy={sort.sortBy}
          sortOrder={sort.sortOrder}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'entryTime', label: 'Entry Time' },
            { value: 'actualExitTime', label: 'Exit Time' }
          ]}
        />
      </FilterBar>

      {loading ? (
        <div className="loading-state">Loading gate history...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : history.length === 0 ? (
        <div className="empty-state">No gate history records match your criteria.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Date & Time</th>
                <th style={{ padding: '1rem' }}>Visitor</th>
                <th style={{ padding: '1rem' }}>Resident</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Exit Time</th>
                <th style={{ padding: '1rem' }}>Gate / Security</th>
              </tr>
            </thead>
            <tbody>
              {history.map(entry => {
                const style = getStatusStyle(entry.status);
                return (
                  <tr key={entry._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {new Date(entry.entryTime).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      <strong>{entry.visitor?.fullName || 'Unknown'}</strong>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {entry.resident?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: style.bg, color: style.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {entry.actualExitTime ? new Date(entry.actualExitTime).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {entry.entryGate}<br/>
                      <small>By: {entry.securityUser?.name || 'Unknown'}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination 
            page={pagination.page} 
            totalPages={pagination.totalPages} 
            totalItems={pagination.total} 
            onPageChange={(p) => fetchHistory(p)} 
          />
        </div>
      )}
    </div>
  );
};

export default GateHistoryPage;
