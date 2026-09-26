import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';

const ParkingRecommendationForm = ({ onSearch, loading }) => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    vehicleId: '',
    preferredZone: '',
    preferredBlock: '',
    preferredFloor: '',
    preferredType: '',
    accessibilityRequired: false
  });

  useEffect(() => {
    // Set default times (start now, end in 2 hours)
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    // Format to YYYY-MM-DDThh:mm
    const formatDateTime = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    };

    setFormData(prev => ({
      ...prev,
      startTime: formatDateTime(now),
      endTime: formatDateTime(later)
    }));

    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getMyVehicles();
      const activeVehicles = data.filter(v => v.isActive);
      setVehicles(activeVehicles);
      
      const primary = activeVehicles.find(v => v.isPrimary);
      if (primary) {
        setFormData(prev => ({ ...prev, vehicleId: primary._id }));
      } else if (activeVehicles.length > 0) {
        setFormData(prev => ({ ...prev, vehicleId: activeVehicles[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load vehicles');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ marginBottom: "2rem" }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Smart Parking Recommendations</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Start Time *</label>
          <input 
            type="datetime-local" 
            name="startTime" 
            value={formData.startTime} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>End Time *</label>
          <input 
            type="datetime-local" 
            name="endTime" 
            value={formData.endTime} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Vehicle (Optional)</label>
          <select 
            name="vehicleId" 
            value={formData.vehicleId} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <option value="">No specific vehicle</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber} ({v.make} {v.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Preferred Zone</label>
          <select name="preferredZone" value={formData.preferredZone} onChange={handleChange} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">Any</option>
            <option value="Community">Community</option>
            <option value="Commercial">Commercial</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Preferred Block</label>
          <select name="preferredBlock" value={formData.preferredBlock} onChange={handleChange} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">Any</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Preferred Floor</label>
          <select name="preferredFloor" value={formData.preferredFloor} onChange={handleChange} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">Any</option>
            <option value="Ground">Ground</option>
            <option value="Basement 1">Basement 1</option>
            <option value="Basement 2">Basement 2</option>
            <option value="Level 1">Level 1</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Parking Type</label>
          <select name="preferredType" value={formData.preferredType} onChange={handleChange} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">Any</option>
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
            <option value="large">Large</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              name="accessibilityRequired" 
              checked={formData.accessibilityRequired} 
              onChange={handleChange}
              style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
            />
            Require Accessible Spot
          </label>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
        >
          {loading ? 'Finding spots...' : 'Find Recommendations'}
        </button>
      </div>
    </form>
  );
};

export default ParkingRecommendationForm;
