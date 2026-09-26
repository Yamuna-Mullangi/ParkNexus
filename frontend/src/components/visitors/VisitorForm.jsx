import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';

const VisitorForm = ({ onSubmit, onCancel, initialData = null, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    purpose: '',
    arrivalDate: '',
    arrivalTime: '',
    departureDate: '',
    departureTime: '',
    vehicle: '',
    vehicleNumber: '',
    notes: ''
  });
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getMyVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Parse dates
      const arrival = new Date(initialData.expectedArrival);
      const departure = new Date(initialData.expectedDeparture);
      
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        purpose: initialData.purpose || '',
        arrivalDate: arrival.toISOString().split('T')[0],
        arrivalTime: arrival.toTimeString().slice(0,5),
        departureDate: departure.toISOString().split('T')[0],
        departureTime: departure.toTimeString().slice(0,5),
        vehicle: initialData.vehicle?._id || initialData.vehicle || '',
        vehicleNumber: initialData.vehicleNumber || '',
        notes: initialData.notes || ''
      });
    } else {
      // Default to today and +3 hours
      const now = new Date();
      const later = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        arrivalDate: now.toISOString().split('T')[0],
        arrivalTime: now.toTimeString().slice(0,5),
        departureDate: later.toISOString().split('T')[0],
        departureTime: later.toTimeString().slice(0,5)
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      expectedArrival: new Date(`${formData.arrivalDate}T${formData.arrivalTime}`).toISOString(),
      expectedDeparture: new Date(`${formData.departureDate}T${formData.departureTime}`).toISOString(),
    };
    
    // Clean up
    if (!payload.vehicle) delete payload.vehicle;
    delete payload.arrivalDate;
    delete payload.arrivalTime;
    delete payload.departureDate;
    delete payload.departureTime;

    onSubmit(payload);
  };

  return (
    <div className="visitor-form-container glass-panel">
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{initialData ? 'Edit Visitor' : 'Register Visitor'}</h3>
      
      {error && <div className="error-state" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="e.g. John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. john@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div className="form-group">
            <label>Purpose (Optional)</label>
            <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="e.g. Delivery, Guest" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>

        <h4 style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>Visit Timing</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Arrival Date *</label>
            <input type="date" name="arrivalDate" required value={formData.arrivalDate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div className="form-group">
            <label>Arrival Time *</label>
            <input type="time" name="arrivalTime" required value={formData.arrivalTime} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Departure Date *</label>
            <input type="date" name="departureDate" required value={formData.departureDate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div className="form-group">
            <label>Departure Time *</label>
            <input type="time" name="departureTime" required value={formData.departureTime} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>

        <h4 style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>Vehicle Information (Optional)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Assign My Vehicle</label>
            <select name="vehicle" value={formData.vehicle} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">No Vehicle Selected</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} - {v.registrationNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Or Visitor's Vehicle No.</label>
            <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="e.g. AP 39 EF 3003" disabled={!!formData.vehicle} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: formData.vehicle ? 'var(--bg-secondary)' : 'var(--color-surface)' }} />
          </div>
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}></textarea>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? (initialData ? 'Updating...' : 'Registering...') : (initialData ? 'Update Visitor' : 'Register Visitor')}
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

export default VisitorForm;
