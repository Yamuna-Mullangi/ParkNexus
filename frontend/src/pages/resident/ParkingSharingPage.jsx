import React, { useState, useEffect } from 'react';
import parkingService from '../../services/parkingService';
import parkingShareService from '../../services/parkingShareService';

const ParkingSharingPage = () => {
  const [spot, setSpot] = useState(null);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ startDate: '', startTime: '', endDate: '', endTime: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const spotData = await parkingService.getMyParking();
      setSpot(spotData);
      const shareData = await parkingShareService.getMyShares();
      setShares(shareData);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load sharing details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!spot) return;
    
    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
      
      await parkingShareService.createShare(spot._id, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });
      
      setForm({ startDate: '', startTime: '', endDate: '', endTime: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelShare = async (id) => {
    if (!window.confirm('Cancel this share?')) return;
    try {
      await parkingShareService.cancelShare(id);
      fetchData();
    } catch (err) {
      alert('Failed to cancel share');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Share My Parking</h1>
        <p>Temporarily share your assigned parking space with other residents.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : !spot ? (
        <div className="empty-state">You don't have an assigned parking space to share.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Create New Share</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Sharing: {spot.spotNumber} ({spot.block}, Floor {spot.floor})</p>
            <form onSubmit={handleShare}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Start Date</label>
                <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Start Time</label>
                <input type="time" required value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>End Date</label>
                <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>End Time</label>
                <input type="time" required value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
                {isSubmitting ? 'Creating...' : 'Share Parking Space'}
              </button>
            </form>
          </div>

          <div>
            <h2>My Shares</h2>
            {shares.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>You have not shared your parking space yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shares.map(s => (
                  <div key={s._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${s.status === 'active' ? '#10b981' : '#6b7280'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{new Date(s.startTime).toLocaleDateString()}</span>
                      <span className={`status-${s.status}`}>{s.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {new Date(s.startTime).toLocaleTimeString()} - {new Date(s.endTime).toLocaleTimeString()}
                    </div>
                    {s.status === 'active' && (
                      <button onClick={() => handleCancelShare(s._id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel Share
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSharingPage;
