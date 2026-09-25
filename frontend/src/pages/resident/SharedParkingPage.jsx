import React, { useState, useEffect } from 'react';
import parkingShareService from '../../services/parkingShareService';
import useAuth from '../../hooks/useAuth';

const SharedParkingPage = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const [requestingShare, setRequestingShare] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const data = await parkingShareService.getAvailableSharedSpots();
      // Filter out own shares
      setSpots(data.filter(s => s.owner._id !== user._id));
    } catch (err) {
      setError('Failed to load shared parking spaces.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!requestingShare) return;
    try {
      await parkingShareService.requestShare(requestingShare._id, { message });
      alert('Request sent successfully!');
      setRequestingShare(null);
      setMessage('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request parking space');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Shared Parking</h1>
        <p>Discover and request parking spaces shared by other residents.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : spots.length === 0 ? (
        <div className="empty-state">No shared parking spaces are currently available.</div>
      ) : (
        <div className="parking-grid">
          {spots.map(spot => (
            <div key={spot._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Spot: {spot.parkingSpot.spotNumber}</h3>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Shared</span>
              </div>
              <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
                <strong>Zone:</strong> {spot.parkingSpot.block} &bull; {spot.parkingSpot.floor}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>From:</strong> {new Date(spot.startTime).toLocaleString()}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>To:</strong> {new Date(spot.endTime).toLocaleString()}
              </p>
              
              <button 
                onClick={() => setRequestingShare(spot)}
                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Request Spot
              </button>
            </div>
          ))}
        </div>
      )}

      {requestingShare && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2>Request Parking Spot</h2>
            <p>Spot {requestingShare.parkingSpot.spotNumber} from {new Date(requestingShare.startTime).toLocaleTimeString()} to {new Date(requestingShare.endTime).toLocaleTimeString()}</p>
            <form onSubmit={handleRequest} style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Message (Optional)</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="E.g., I have visitors coming over..."
                  style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>Send Request</button>
                <button type="button" onClick={() => setRequestingShare(null)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedParkingPage;
