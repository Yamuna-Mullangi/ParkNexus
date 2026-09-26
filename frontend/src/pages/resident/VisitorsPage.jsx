import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import visitorService from '../../services/visitorService';
import visitorPassService from '../../services/visitorPassService';
import VisitorCard from '../../components/visitors/VisitorCard';
import VisitorForm from '../../components/visitors/VisitorForm';
import { useSocket } from '../../context/SocketContext';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ActiveFilters from '../../components/common/ActiveFilters';
import Pagination from '../../components/common/Pagination';
import SortSelect from '../../components/common/SortSelect';

const VisitorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
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
    sortBy: searchParams.get('sortBy') || 'expectedArrival',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  
  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    fetchVisitors(pagination.page);
    
    const handleVisitorUpdated = () => {
      fetchVisitors(pagination.page);
    };
    
    registerListener('visitor:updated', handleVisitorUpdated);
    
    return () => {
      unregisterListener('visitor:updated', handleVisitorUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, registerListener, unregisterListener]);

  const fetchVisitors = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await visitorService.getMyVisitors({
        ...filters,
        ...sort,
        page: pageToFetch,
        limit: pagination.limit
      });
      setVisitors(res.data);
      setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      
      // Sync URL
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      if (sort.sortBy !== 'expectedArrival') newParams.set('sortBy', sort.sortBy);
      if (sort.sortOrder !== 'desc') newParams.set('sortOrder', sort.sortOrder);
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'All Time') newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
      
      setError(null);
    } catch (err) {
      setError('Failed to load visitors.');
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

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const newVisitor = await visitorService.createVisitor(formData);
      
      setShowForm(false);
      
      const pass = await visitorPassService.createPass(newVisitor._id);
      alert('Visitor registered and pass generated successfully!');
      fetchVisitors(); 
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelVisitor = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this visitor?')) return;
    try {
      await visitorService.cancelVisitor(id);
      fetchVisitors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel visitor');
    }
  };

  const handleGeneratePass = async (id) => {
    try {
      await visitorPassService.createPass(id);
      fetchVisitors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate pass');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Visitors</h1>
          <p>Manage upcoming visitors and visitor access passes.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Visitor
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <VisitorForm 
            onSubmit={handleSubmit} 
            onCancel={() => setShowForm(false)}
            loading={formLoading}
            error={formError}
          />
        </div>
      )}

      {!showForm && (
        <>
          <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

          <FilterBar>
            <SearchBar 
              value={filters.search} 
              onChange={handleFilterChange} 
              placeholder="Search visitor name or phone..." 
            />
            <FilterSelect 
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              defaultLabel="All Statuses"
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'active', label: 'Active' },
                { value: 'inside', label: 'Inside' },
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
                { value: 'expectedArrival', label: 'Expected Arrival' },
                { value: 'visitDate', label: 'Visit Date' },
                { value: 'createdAt', label: 'Created Date' }
              ]}
            />
          </FilterBar>
        </>
      )}

      {loading ? (
        <div className="loading-state">Loading visitors...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : visitors.length === 0 && !showForm ? (
        <div className="empty-state glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h3>No visitors found matching your current filters.</h3>
        </div>
      ) : !showForm ? (
        <div>
          <div className="visitors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {visitors.map(visitor => (
              <VisitorCard 
                key={visitor._id} 
                visitor={visitor} 
                onCancel={handleCancelVisitor}
                onGeneratePass={handleGeneratePass}
              />
            ))}
          </div>
          <Pagination 
            page={pagination.page} 
            totalPages={pagination.totalPages} 
            totalItems={pagination.total} 
            onPageChange={(p) => fetchVisitors(p)} 
          />
        </div>
      ) : null}
    </div>
  );
};

export default VisitorsPage;
