import React, { useState, useEffect } from 'react';

const VehicleForm = ({ onSubmit, onCancel, initialData = null, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    color: '',
    vehicleType: 'car',
    year: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        registrationNumber: initialData.registrationNumber || '',
        make: initialData.make || '',
        model: initialData.model || '',
        color: initialData.color || '',
        vehicleType: initialData.vehicleType || 'car',
        year: initialData.year || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="vehicle-form-container" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
      
      {error && <div className="error-state" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Registration Number</label>
            <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. AP 39 AB 1234" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div className="form-group">
            <label>Vehicle Type</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="scooter">Scooter</option>
              <option value="bicycle">Bicycle</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Make</label>
            <input type="text" name="make" required value={formData.make} onChange={handleChange} placeholder="e.g. Honda" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder="e.g. City" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Color</label>
            <input type="text" name="color" required value={formData.color} onChange={handleChange} placeholder="e.g. White" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
          <div className="form-group">
            <label>Year (Optional)</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2022" min="1900" max={new Date().getFullYear() + 1} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Vehicle' : 'Add Vehicle')}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
