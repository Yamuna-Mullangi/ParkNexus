import React, { useState, useEffect } from 'react';
import systemSettingService from '../../services/systemSettingService';

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load system settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await systemSettingService.updateSystemSettings({
        reservationSettings: {
          maxReservationDuration: Number(settings.reservationSettings.maxReservationDuration),
          minReservationDuration: Number(settings.reservationSettings.minReservationDuration),
          maxActiveReservationsPerUser: Number(settings.reservationSettings.maxActiveReservationsPerUser),
          allowSameDayReservation: Boolean(settings.reservationSettings.allowSameDayReservation),
          allowFutureReservations: Boolean(settings.reservationSettings.allowFutureReservations),
        },
        visitorSettings: {
          defaultVisitorPassDuration: Number(settings.visitorSettings.defaultVisitorPassDuration),
          maxVisitorPassDuration: Number(settings.visitorSettings.maxVisitorPassDuration),
          allowVisitorVehicle: Boolean(settings.visitorSettings.allowVisitorVehicle),
          allowVisitorParking: Boolean(settings.visitorSettings.allowVisitorParking),
        },
        parkingSettings: {
          allowResidentAssignment: Boolean(settings.parkingSettings.allowResidentAssignment),
          allowVisitorParking: Boolean(settings.parkingSettings.allowVisitorParking),
          defaultParkingView: settings.parkingSettings.defaultParkingView,
          highOccupancyThreshold: Number(settings.parkingSettings.highOccupancyThreshold),
          nearFullThreshold: Number(settings.parkingSettings.nearFullThreshold)
        },
        recommendationSettings: {
          recommendationsEnabled: Boolean(settings.recommendationSettings.recommendationsEnabled),
          maxRecommendations: Number(settings.recommendationSettings.maxRecommendations)
        },
        notificationSettings: {
          notificationsEnabled: Boolean(settings.notificationSettings.notificationsEnabled)
        }
      });
      setSettings(updated);
      setMessage({ type: 'success', text: 'System settings saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all operational rules to default?')) {
      setSaving(true);
      try {
        const resetData = await systemSettingService.resetSystemSettings();
        setSettings(resetData);
        setMessage({ type: 'success', text: 'Settings reset to defaults.' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to reset settings.' });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading settings...</div></div>;
  }

  if (!settings) {
    return <div className="page-container"><div className="error-state">Failed to load settings.</div></div>;
  }

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Operational Rules</h1>
        <p>Configure system-wide parking, reservation, and visitor rules.</p>
      </div>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '4px', background: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#b91c1c' : '#047857' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Reservation Rules */}
        <div className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Reservation Rules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Minimum Duration (minutes)</label>
              <input type="number" min="1" value={settings.reservationSettings.minReservationDuration} onChange={(e) => handleChange('reservationSettings', 'minReservationDuration', e.target.value)} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Duration (minutes)</label>
              <input type="number" min="1" value={settings.reservationSettings.maxReservationDuration} onChange={(e) => handleChange('reservationSettings', 'maxReservationDuration', e.target.value)} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Max Active Reservations Per User</label>
              <input type="number" min="1" value={settings.reservationSettings.maxActiveReservationsPerUser} onChange={(e) => handleChange('reservationSettings', 'maxActiveReservationsPerUser', e.target.value)} className="form-input" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={settings.reservationSettings.allowSameDayReservation} onChange={(e) => handleChange('reservationSettings', 'allowSameDayReservation', e.target.checked)} />
              Allow Same-Day Reservations
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={settings.reservationSettings.allowFutureReservations} onChange={(e) => handleChange('reservationSettings', 'allowFutureReservations', e.target.checked)} />
              Allow Future Reservations
            </label>
          </div>
        </div>

        {/* Visitor Rules */}
        <div className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Visitor Rules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Default Pass Duration (minutes)</label>
              <input type="number" min="1" value={settings.visitorSettings.defaultVisitorPassDuration} onChange={(e) => handleChange('visitorSettings', 'defaultVisitorPassDuration', e.target.value)} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Pass Duration (minutes)</label>
              <input type="number" min="1" value={settings.visitorSettings.maxVisitorPassDuration} onChange={(e) => handleChange('visitorSettings', 'maxVisitorPassDuration', e.target.value)} className="form-input" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={settings.visitorSettings.allowVisitorVehicle} onChange={(e) => handleChange('visitorSettings', 'allowVisitorVehicle', e.target.checked)} />
              Allow Visitor Vehicle Entry
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={settings.visitorSettings.allowVisitorParking} onChange={(e) => handleChange('visitorSettings', 'allowVisitorParking', e.target.checked)} />
              Allow Visitor Parking
            </label>
          </div>
        </div>

        {/* Parking Rules & Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Parking Rules</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={settings.parkingSettings.allowResidentAssignment} onChange={(e) => handleChange('parkingSettings', 'allowResidentAssignment', e.target.checked)} />
                Allow Resident Parking Assignment
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={settings.parkingSettings.allowVisitorParking} onChange={(e) => handleChange('parkingSettings', 'allowVisitorParking', e.target.checked)} />
                Allow Visitor Parking (Global)
              </label>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Default Parking View</label>
                <select value={settings.parkingSettings.defaultParkingView} onChange={(e) => handleChange('parkingSettings', 'defaultParkingView', e.target.value)} className="form-select">
                  <option value="map">Interactive Map</option>
                  <option value="list">List View</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">High Occupancy Threshold (%)</label>
                  <input type="number" min="1" max="100" value={settings.parkingSettings.highOccupancyThreshold} onChange={(e) => handleChange('parkingSettings', 'highOccupancyThreshold', e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Near Full Threshold (%)</label>
                  <input type="number" min="1" max="100" value={settings.parkingSettings.nearFullThreshold} onChange={(e) => handleChange('parkingSettings', 'nearFullThreshold', e.target.value)} className="form-input" required />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Recommendation Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={settings.recommendationSettings.recommendationsEnabled} onChange={(e) => handleChange('recommendationSettings', 'recommendationsEnabled', e.target.checked)} />
                Enable Smart Recommendations
              </label>
              <div className="form-group">
                <label className="form-label">Maximum Recommendations</label>
                <input type="number" min="1" max="20" value={settings.recommendationSettings.maxRecommendations} onChange={(e) => handleChange('recommendationSettings', 'maxRecommendations', e.target.value)} className="form-input" required />
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        <div className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Notification Settings</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={settings.notificationSettings.notificationsEnabled} onChange={(e) => handleChange('notificationSettings', 'notificationsEnabled', e.target.checked)} />
            Enable In-App Notifications (Global)
          </label>
          <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Note: Critical security and system notifications cannot be disabled.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset} disabled={saving}>
            Reset to Defaults
          </button>
        </div>

      </form>
    </div>
  );
};

export default SystemSettingsPage;
