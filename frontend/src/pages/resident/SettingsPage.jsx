import React, { useState, useEffect } from 'react';
import preferenceService from '../../services/preferenceService';
import vehicleService from '../../services/vehicleService';

const SettingsPage = () => {
  const [preferences, setPreferences] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefs, myVehicles] = await Promise.all([
        preferenceService.getPreferences(),
        vehicleService.getMyVehicles()
      ]);
      setPreferences(prefs);
      setVehicles(myVehicles || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load preferences.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notif_')) {
      const key = name.split('_')[1];
      setPreferences(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [key]: checked
        }
      }));
    } else if (name.startsWith('dash_')) {
      const key = name.split('_')[1];
      setPreferences(prev => ({
        ...prev,
        dashboardPreferences: {
          ...prev.dashboardPreferences,
          [key]: checked
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await preferenceService.updatePreferences({
        preferredZone: preferences.preferredZone,
        preferredBlock: preferences.preferredBlock,
        preferredFloor: preferences.preferredFloor,
        preferredParkingType: preferences.preferredParkingType,
        preferredVehicle: preferences.preferredVehicle ? (typeof preferences.preferredVehicle === 'object' ? preferences.preferredVehicle._id : preferences.preferredVehicle) : null,
        preferredReservationDuration: Number(preferences.preferredReservationDuration),
        defaultStartTime: preferences.defaultStartTime,
        notificationPreferences: preferences.notificationPreferences,
        dashboardPreferences: preferences.dashboardPreferences
      });
      setPreferences(updated);
      setMessage({ type: 'success', text: 'Preferences saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all preferences to default?')) {
      setSaving(true);
      try {
        const resetPrefs = await preferenceService.resetPreferences();
        setPreferences(resetPrefs);
        setMessage({ type: 'success', text: 'Preferences reset to defaults.' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to reset preferences.' });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading settings...</div></div>;
  }

  if (!preferences) {
    return <div className="page-container"><div className="error-state">Failed to load preferences.</div></div>;
  }

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Settings & Preferences</h1>
        <p>Personalize your parking recommendations, defaults, and notifications.</p>
      </div>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '4px', background: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#b91c1c' : '#047857' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Parking Preferences */}
        <div className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Parking Preferences</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Preferred Zone</label>
              <input type="text" name="preferredZone" value={preferences.preferredZone || ''} onChange={handleChange} className="form-input" placeholder="e.g. Zone A" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Block</label>
              <input type="text" name="preferredBlock" value={preferences.preferredBlock || ''} onChange={handleChange} className="form-input" placeholder="e.g. Block 1" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Floor</label>
              <input type="text" name="preferredFloor" value={preferences.preferredFloor || ''} onChange={handleChange} className="form-input" placeholder="e.g. Ground" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Parking Type</label>
              <select name="preferredParkingType" value={preferences.preferredParkingType || ''} onChange={handleChange} className="form-select">
                <option value="">Any</option>
                <option value="Standard">Standard</option>
                <option value="Compact">Compact</option>
                <option value="Large">Large</option>
                <option value="Accessible">Accessible</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservation Defaults */}
        <div className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Reservation Defaults</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Default Vehicle</label>
              <select 
                name="preferredVehicle" 
                value={preferences.preferredVehicle ? (typeof preferences.preferredVehicle === 'object' ? preferences.preferredVehicle._id : preferences.preferredVehicle) : ''} 
                onChange={handleChange} 
                className="form-select"
              >
                <option value="">None (Select at booking)</option>
                {vehicles.filter(v => v.isActive).map(v => (
                  <option key={v._id} value={v._id}>{v.make} {v.model} - {v.licensePlate}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Reservation Duration</label>
              <select name="preferredReservationDuration" value={preferences.preferredReservationDuration} onChange={handleChange} className="form-select">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Start Time (Optional)</label>
              <input type="time" name="defaultStartTime" value={preferences.defaultStartTime || ''} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Notification Preferences */}
          <div className="glass-panel">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Notification Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(preferences.notificationPreferences).map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                  <input type="checkbox" name={`notif_${key}`} checked={preferences.notificationPreferences[key]} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          {/* Dashboard Preferences */}
          <div className="glass-panel">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Dashboard Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(preferences.dashboardPreferences).map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                  <input type="checkbox" name={`dash_${key}`} checked={preferences.dashboardPreferences[key]} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                  {key.replace('show', 'Show ').replace(/([A-Z])/g, ' $1').trim()}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset} disabled={saving}>
            Reset Preferences
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
