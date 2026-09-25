import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import userService from '../../services/userService';
import { useSocket } from '../../context/SocketContext';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import FilterSelect from '../../components/common/FilterSelect';
import Pagination from '../../components/common/Pagination';
import ActiveFilters from '../../components/common/ActiveFilters';

const UserManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({ 
    search: searchParams.get('search') || '', 
    role: searchParams.get('role') || '', 
    status: searchParams.get('status') || '' 
  });
  
  const [pagination, setPagination] = useState({ 
    page: parseInt(searchParams.get('page')) || 1, 
    limit: 20, 
    total: 0, 
    totalPages: 1 
  });
  
  // For confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { registerListener, unregisterListener } = useSocket();

  const fetchUsers = async (pageToFetch = pagination.page) => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        ...filters,
        page: pageToFetch,
        limit: pagination.limit
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
      
      // Update URL parameters safely
      const newParams = new URLSearchParams();
      if (pageToFetch > 1) newParams.set('page', pageToFetch);
      Object.keys(filters).forEach(key => {
        if (filters[key]) newParams.set(key, filters[key]);
      });
      setSearchParams(newParams, { replace: true });
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    // Optionally listen to user updates if socket has it, but not strictly required.
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const handleClearAll = () => {
    setFilters({ search: '', role: '', status: '' });
  };

  const executeStatusChange = async (userId, newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      setConfirmDialog(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status');
      setConfirmDialog(null);
    }
  };

  const executeRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setConfirmDialog(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
      setConfirmDialog(null);
    }
  };

  const promptStatusChange = (user) => {
    const newStatus = !user.isActive;
    setConfirmDialog({
      title: `${newStatus ? 'Activate' : 'Deactivate'} User`,
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.name}?`,
      onConfirm: () => executeStatusChange(user._id, newStatus)
    });
  };

  const promptRoleChange = (user, newRole) => {
    setConfirmDialog({
      title: `Change Role`,
      message: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      onConfirm: () => executeRoleChange(user._id, newRole)
    });
  };

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users, roles, and account statuses.</p>
      </div>

      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />

      <FilterBar>
        <SearchBar 
          value={filters.search} 
          onChange={handleFilterChange} 
          placeholder="Search by name or email..." 
        />
        <FilterSelect 
          name="role" 
          value={filters.role} 
          onChange={handleFilterChange}
          defaultLabel="All Roles"
          options={[
            { value: 'resident', label: 'Resident' },
            { value: 'security', label: 'Security' },
            { value: 'admin', label: 'Admin' }
          ]}
        />
        <FilterSelect 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange}
          defaultLabel="All Statuses"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
      </FilterBar>

      {error && <div className="error-state">{error}</div>}

      {loading && !users.length ? (
        <div className="loading-state">Loading users...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Created</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={user.role} 
                      onChange={(e) => promptRoleChange(user, e.target.value)}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      <option value="resident">Resident</option>
                      <option value="security">Security</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: user.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: user.isActive ? '#10b981' : '#ef4444'
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => promptStatusChange(user)}
                      className={user.isActive ? 'btn-secondary' : 'btn-primary'}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No users found matching your filters.
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination 
        page={pagination.page} 
        totalPages={pagination.totalPages} 
        totalItems={pagination.total} 
        onPageChange={(p) => fetchUsers(p)} 
      />

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>{confirmDialog.title}</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmDialog(null)}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
