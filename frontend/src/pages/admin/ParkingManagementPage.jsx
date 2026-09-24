import React, { useState, useEffect } from 'react';
import parkingService from '../../services/parkingService';

const ParkingManagementPage = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For the sake of simplicity in Phase 3, we just show a list.
  // "Add Parking" form can be a simple modal.
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    spotNumber: '',
    block: 'Block A',
    floor: 'Ground Floor',
    type: 'standard',
    status: 'available'
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      // Get all including inactive if we wanted, but let's just get all
      const data = await parkingService.getAllParkingSpots();
      setSpots(data);
    } catch (err) {
      setError('Failed to load parking spaces.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await parkingService.createParkingSpot(formData);
      setShowAddForm(false);
      fetchSpots();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating parking spot');
    }
  };

  const deactivateSpot = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this spot?')) {
      try {
        await parkingService.deactivateParkingSpot(id);
        fetchSpots();
      } catch (err) {
        alert('Error deactivating spot');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Parking Management</h1>
          <p>Manage all community parking spaces.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          + Add Parking
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>Add Parking Space</h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Spot Number</label>
              <input type="text" className="form-input" required value={formData.spotNumber} onChange={(e) => setFormData({...formData, spotNumber: e.target.value})} placeholder="e.g. A-25" />
            </div>
            <div className="form-group">
              <label className="form-label">Block</label>
              <select className="form-input" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})}>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Floor</label>
              <select className="form-input" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})}>
                <option value="Ground Floor">Ground Floor</option>
                <option value="Basement">Basement</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="standard">Standard</option>
                <option value="compact">Compact</option>
                <option value="large">Large</option>
                <option value="accessible">Accessible</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading parking spaces...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Spot</th>
                <th style={{ padding: '1rem' }}>Block</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Assigned</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spots.map(spot => (
                <tr key={spot._id} style={{ borderBottom: '1px solid var(--border-color)', opacity: spot.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{spot.spotNumber}</td>
                  <td style={{ padding: '1rem' }}>{spot.block}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{spot.type}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge status-${spot.status}`}>{spot.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {spot.assignedTo ? spot.assignedTo.name : '—'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {spot.isActive && (
                      <button className="btn btn-secondary btn-small" onClick={() => deactivateSpot(spot._id)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParkingManagementPage;
