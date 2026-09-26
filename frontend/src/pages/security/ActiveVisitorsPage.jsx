import React, { useState, useEffect } from 'react';
import gateService from '../../services/gateService';
import { useSocket } from '../../context/SocketContext';

const ActiveVisitorsPage = () => {
  const [activeEntries, setActiveEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [checkingOut, setCheckingOut] = useState(null);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  
  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    fetchActiveVisitors();
    
    const handleGateUpdated = () => {
      fetchActiveVisitors();
    };
    
    registerListener('gate:updated', handleGateUpdated);
    
    return () => {
      unregisterListener('gate:updated', handleGateUpdated);
    };
  }, [registerListener, unregisterListener]);

  const fetchActiveVisitors = async () => {
    try {
      setLoading(true);
      const data = await gateService.getActiveVisitors();
      setActiveEntries(data);
      setError(null);
    } catch (err) {
      setError('Failed to load active visitors.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (gateEntryId) => {
    try {
      setCheckingOut(gateEntryId);
      await gateService.checkOutVisitor(gateEntryId, { notes: checkoutNotes });
      setCheckoutNotes('');
      fetchActiveVisitors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check out visitor');
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Active Visitors</h1>
          <p>Monitor visitors currently inside the premises.</p>
        </div>
        <button onClick={fetchActiveVisitors} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading active visitors...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : activeEntries.length === 0 ? (
        <div className="empty-state">No visitors currently inside.</div>
      ) : (
        <div className="vehicles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {activeEntries.map(entry => (
            <div key={entry._id} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{entry.visitor.fullName}</h3>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  INSIDE
                </span>
              </div>
              
              <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Resident:</strong> {entry.resident?.name}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Entry Time:</strong> {new Date(entry.entryTime).toLocaleTimeString()}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Expected Exit:</strong> {new Date(entry.expectedExitTime).toLocaleTimeString()}</p>
                {entry.parkingSpot && (
                  <p style={{ margin: '0.5rem 0' }}><strong>Assigned Parking:</strong> {entry.parkingSpot.spotNumber}</p>
                )}
                {entry.vehicle && (
                  <p style={{ margin: '0.5rem 0' }}><strong>Vehicle:</strong> {entry.vehicle.registrationNumber}</p>
                )}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Checkout notes (optional)"
                  value={checkingOut === entry._id ? checkoutNotes : ''}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  disabled={checkingOut && checkingOut !== entry._id}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
                <button 
                  onClick={() => handleCheckOut(entry._id)}
                  disabled={checkingOut === entry._id}
                  style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {checkingOut === entry._id ? 'Checking Out...' : 'Check Out Visitor'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveVisitorsPage;
