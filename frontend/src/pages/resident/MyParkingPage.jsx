import React, { useState, useEffect } from 'react';
import parkingService from '../../services/parkingService';

const MyParkingPage = () => {
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyParking();
  }, []);

  const fetchMyParking = async () => {
    try {
      const data = await parkingService.getMyParking();
      setSpot(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSpot(null);
      } else {
        setError('Failed to load your assigned parking space.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Parking</h1>
        <p>View your assigned parking space details.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading your parking details...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : !spot ? (
        <div className="empty-state">
          <p>You don't have an assigned parking space yet.</p>
          <p>Your assigned parking space will appear here once your community administrator assigns one.</p>
        </div>
      ) : (
        <div className="my-parking-card" style={{
          background: 'var(--bg-card)', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2>Your Assigned Space</h2>
          <div style={{
            margin: '2rem auto',
            width: '120px', height: '160px',
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            background: '#eff6ff',
            color: '#1e3a8a'
          }}>
            {spot.spotNumber}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>{spot.block}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{spot.floor}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '500' }}>
            <span>🔵</span> Assigned
          </div>
        </div>
      )}
    </div>
  );
};

export default MyParkingPage;
