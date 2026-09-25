import React, { useState, useEffect } from 'react';
import reservationService from '../../services/reservationService';
import vehicleService from '../../services/vehicleService';
import preferenceService from '../../services/preferenceService';

const ReservationForm = ({ spot, onSuccess, onCancel, prefilledData }) => {
  const [formData, setFormData] = useState({
    startDate: prefilledData?.startDate || '',
    startTime: prefilledData?.startTime || '',
    endDate: prefilledData?.endDate || '',
    endTime: prefilledData?.endTime || '',
    purpose: prefilledData?.purpose || '',
    vehicle: prefilledData?.vehicle || ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vehiclesData, prefs] = await Promise.all([
          vehicleService.getMyVehicles(),
          preferenceService.getPreferences()
        ]);
        
        const safeVehiclesData = Array.isArray(vehiclesData) ? vehiclesData : [];
        setVehicles(safeVehiclesData);
        
        setFormData(prev => {
          const newData = { ...prev };
          
          if (!newData.vehicle) {
            if (prefs?.preferredVehicle) {
              newData.vehicle = typeof prefs.preferredVehicle === 'object' ? prefs.preferredVehicle._id : prefs.preferredVehicle;
            } else {
              const primary = safeVehiclesData.find(v => v.isPrimary);
              if (primary) newData.vehicle = primary._id;
            }
          }
          
          if (!newData.startTime && !newData.startDate && prefs?.defaultStartTime) {
            newData.startTime = prefs.defaultStartTime;
            // Set start date to today if we have a default start time but no prefilled date
            if (!newData.startDate) {
              newData.startDate = new Date().toISOString().split('T')[0];
            }
          }
          
          if (!newData.endTime && !newData.endDate && newData.startDate && newData.startTime && prefs?.preferredReservationDuration) {
             const startObj = new Date(`${newData.startDate}T${newData.startTime}`);
             startObj.setMinutes(startObj.getMinutes() + prefs.preferredReservationDuration);
             newData.endDate = startObj.toISOString().split('T')[0];
             newData.endTime = startObj.toTimeString().slice(0, 5);
          }

          return newData;
        });

      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [availabilityCheck, setAvailabilityCheck] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAvailability = async () => {
      if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        setAvailabilityCheck(null);
        return;
      }
      
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime || startDateTime < new Date()) {
        setAvailabilityCheck({ available: false, reasons: ['Invalid time range selected.'] });
        return;
      }

      setCheckingAvailability(true);
      try {
        const { default: parkingAvailabilityService } = await import('../../services/parkingAvailabilityService');
        const res = await parkingAvailabilityService.getSpotAvailability(spot._id, {
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          vehicleId: formData.vehicle || undefined
        });
        
        if (isMounted) {
          setAvailabilityCheck(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setAvailabilityCheck({ available: false, reasons: ['Failed to check availability.'] });
        }
      } finally {
        if (isMounted) {
          setCheckingAvailability(false);
        }
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime, formData.vehicle, spot._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime) {
        throw new Error('Start time must be before end time');
      }

      const payload = {
        parkingSpot: spot._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: formData.purpose
      };

      if (formData.vehicle) {
        payload.vehicle = formData.vehicle;
      }

      await reservationService.createReservation(payload);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message || err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-form">
      <h4>Reserve {spot.spotNumber}</h4>
      {error && <div className="error-state" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Start Date</label>
          <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Start Time</label>
          <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>End Date</label>
          <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>End Time</label>
          <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Vehicle (Optional)</label>
          <select name="vehicle" value={formData.vehicle} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">No Vehicle Selected</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.registrationNumber} {v.isPrimary ? '(Primary)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Purpose (Optional)</label>
          <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        {/* Availability Badge */}
        <div style={{ padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', background: checkingAvailability ? 'var(--bg-secondary)' : (availabilityCheck?.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'), border: `1px solid ${checkingAvailability ? 'var(--border-color)' : (availabilityCheck?.available ? '#10b981' : '#ef4444')}` }}>
          {checkingAvailability ? (
            <span style={{ color: 'var(--text-secondary)' }}>Checking availability...</span>
          ) : availabilityCheck ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 'bold', color: availabilityCheck.available ? '#10b981' : '#ef4444' }}>
                {availabilityCheck.available ? '✓ Available for the selected time' : '⚠ Not available for the selected time'}
              </span>
              {!availabilityCheck.available && availabilityCheck.reasons?.length > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {availabilityCheck.reasons[0]}
                </span>
              )}
            </div>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>Select a complete time range to check availability.</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={loading || checkingAvailability || (availabilityCheck && !availabilityCheck.available)} className="btn-primary" style={{ flex: 1, padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', opacity: (loading || checkingAvailability || (availabilityCheck && !availabilityCheck.available)) ? 0.5 : 1 }}>
            {loading ? 'Reserving...' : 'Confirm'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
