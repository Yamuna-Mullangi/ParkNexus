import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import { useSocket } from '../../context/SocketContext';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ActiveFilters from '../../components/common/ActiveFilters';
import Pagination from '../../components/common/Pagination';
import SortSelect from '../../components/common/SortSelect';

const ReservationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
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
    sortBy: searchParams.get('sortBy') || 'startTime',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  
  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    fetchReservations(pagination.page);
    
    const handleReservationUpdated = () => {
      fetchReservations(pagination.page);
    };
    
    registerListener('reservation:updated', handleReservationUpdated);
    
    return () => {
      unregisterListener('reservation:updated', handleReservationUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, registerListener, unregisterListener]);

  const fetchReservations = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await reservationService.getMyReservations({
        ...filters,
        ...sort,
        page: pageToFetch,
        limit: pagination.limit
      });
      setReservations(res.data);
      setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      
      // Sync URL
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      if (sort.sortBy !== 'startTime') newParams.set('sortBy', sort.sortBy);
      if (sort.sortOrder !== 'desc') newParams.set('sortOrder', sort.sortOrder);
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All Time') newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
      
    } catch (err) {
      setError('Failed to fetch reservations.');
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
  const handleClearAll = () => setFilters({ status: '', dateRange: '' });

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await reservationService.cancelReservation(id);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel reservation');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Reservations</h1>
        <p>Manage your parking space reservations.</p>
      </div>

      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

      <FilterBar>
        <FilterSelect 
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          defaultLabel="All Statuses"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'expired', label: 'Expired' }
          ]}
        />
        <DateRangeFilter value={filters.dateRange} onChange={handleFilterChange} />
        <SortSelect 
          sortBy={sort.sortBy}
          sortOrder={sort.sortOrder}
          onSortChange={handleSortChange}
          sortOptions={[
            { value: 'startTime', label: 'Start Time' },
            { value: 'endTime', label: 'End Time' },
            { value: 'createdAt', label: 'Created Date' },
            { value: 'status', label: 'Status' }
          ]}
        />
      </FilterBar>

      {loading ? (
        <div className="loading-state">Loading reservations...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">No reservations match your current filters.</div>
      ) : (
        <div className="reservations-content">
          <div className="parking-grid">
            {reservations.map(res => (
              <div key={res._id} className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Spot: {res.parkingSpot?.spotNumber}</h3>
                  <span className={`status-badge ${res.status}`}>{res.status.toUpperCase()}</span>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
                  <strong>From:</strong> {new Date(res.startTime).toLocaleString()}
                </p>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
                  <strong>To:</strong> {new Date(res.endTime).toLocaleString()}
                </p>
                {res.vehicle && (
                  <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
                    <strong>Vehicle:</strong> {res.vehicle.registrationNumber} ({res.vehicle.make} {res.vehicle.model})
                  </p>
                )}
                {res.purpose && <p style={{ margin: '0.5rem 0', fontStyle: 'italic' }}>Purpose: {res.purpose}</p>}
                
                {['pending', 'approved'].includes(res.status) && (
                  <button 
                    onClick={() => handleCancel(res._id)}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <Pagination 
            page={pagination.page} 
            totalPages={pagination.totalPages} 
            totalItems={pagination.total} 
            onPageChange={(p) => fetchReservations(p)} 
          />
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
