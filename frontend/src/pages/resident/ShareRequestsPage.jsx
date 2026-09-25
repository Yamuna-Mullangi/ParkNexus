import React, { useState, useEffect } from 'react';
import parkingShareService from '../../services/parkingShareService';

const ShareRequestsPage = () => {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [receivedData, sentData] = await Promise.all([
        parkingShareService.getReceivedRequests(),
        parkingShareService.getSentRequests()
      ]);
      setReceived(receivedData);
      setSent(sentData);
    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await parkingShareService.approveShareRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await parkingShareService.rejectShareRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Share Requests</h1>
        <p>Manage your parking share requests.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2>Requests Received</h2>
            {received.length === 0 ? (
              <div className="empty-state">No requests received.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {received.map(req => (
                  <div key={req._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>{req.requester.name}</strong>
                      <span className={`status-${req.status}`}>{req.status.toUpperCase()}</span>
                    </div>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>Spot: {req.parkingShare?.parkingSpot?.spotNumber}</p>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(req.parkingShare?.startTime).toLocaleString()} - {new Date(req.parkingShare?.endTime).toLocaleString()}
                    </p>
                    {req.message && <p style={{ fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>"{req.message}"</p>}
                    
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => handleApprove(req._id)} style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleReject(req._id)} style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2>Requests Sent</h2>
            {sent.length === 0 ? (
              <div className="empty-state">No requests sent.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sent.map(req => (
                  <div key={req._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>Spot: {req.parkingShare?.parkingSpot?.spotNumber}</strong>
                      <span className={`status-${req.status}`}>{req.status.toUpperCase()}</span>
                    </div>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(req.parkingShare?.startTime).toLocaleString()} - {new Date(req.parkingShare?.endTime).toLocaleString()}
                    </p>
                    {req.message && <p style={{ fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>"{req.message}"</p>}
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

export default ShareRequestsPage;
