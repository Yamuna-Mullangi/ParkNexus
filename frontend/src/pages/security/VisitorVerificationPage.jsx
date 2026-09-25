import React, { useState, useEffect } from 'react';
import visitorPassService from '../../services/visitorPassService';
import gateService from '../../services/gateService';
import parkingService from '../../services/parkingService';

const VisitorVerificationPage = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch available parking spots
    const fetchSpots = async () => {
      try {
        const spots = await parkingService.getAllParkingSpots({ status: 'available' });
        setParkingSpots(spots || []);
      } catch (err) {
        console.error('Failed to load parking spots');
      }
    };
    fetchSpots();
  }, []);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    setCheckInSuccess(false);
    setSelectedSpot('');
    setNotes('');
    
    try {
      const response = await visitorPassService.validatePass(tokenInput.trim());
      setResult(response);
    } catch (err) {
      setResult({ valid: false, reason: 'Network or Server Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const payload = {
        passToken: tokenInput.trim(),
        notes
      };
      if (selectedSpot) {
        payload.parkingSpotId = selectedSpot;
      }
      
      await gateService.checkInVisitor(payload);
      setCheckInSuccess(true);
      setResult(null);
      setTokenInput('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check in visitor');
    } finally {
      setCheckInLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Visitor Verification</h1>

      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Enter or scan the visitor pass code to verify its validity.
        </p>

        <form onSubmit={handleValidate} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <input 
            type="text" 
            placeholder="e.g. PARKNEXUS-VISITOR-XXXX..." 
            value={tokenInput} 
            onChange={(e) => setTokenInput(e.target.value)}
            style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '1rem', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
          />
          <button 
            type="submit" 
            disabled={loading || !tokenInput.trim()}
            style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Verify Pass Code'}
          </button>
        </form>
      </div>

      {checkInSuccess && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '2rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem' }}>
          <h2>✓ Visitor Checked In Successfully</h2>
          <p>The gate entry has been recorded.</p>
        </div>
      )}

      {result && !checkInSuccess && (
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {result.valid ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 style={{ color: '#166534', margin: '0 0 1.5rem 0' }}>✓ Visitor Pass Valid</h2>
              
              <div style={{ textAlign: 'left', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <div style={{ marginBottom: '1rem' }}><strong>Visitor:</strong> {result.passDetails.visitor.fullName}</div>
                <div style={{ marginBottom: '1rem' }}><strong>Resident:</strong> {result.passDetails.issuedBy.name}</div>
                <div style={{ marginBottom: '1rem' }}><strong>Visit:</strong> {new Date(result.passDetails.validFrom).toLocaleString()} to {new Date(result.passDetails.validUntil).toLocaleString()}</div>
                {result.passDetails.visitor.vehicle && (
                  <div style={{ marginBottom: '1rem' }}><strong>Vehicle:</strong> {result.passDetails.visitor.vehicle.registrationNumber}</div>
                )}
                {result.passDetails.visitor.vehicleNumber && !result.passDetails.visitor.vehicle && (
                  <div style={{ marginBottom: '1rem' }}><strong>Vehicle:</strong> {result.passDetails.visitor.vehicleNumber}</div>
                )}
                <div><strong>Status:</strong> <span style={{ color: '#166534', fontWeight: 'bold' }}>ACTIVE</span></div>
                
                {result.passDetails.visitor.status === 'inside' ? (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', textAlign: 'center' }}>
                    <strong>Visitor Currently Inside</strong>
                    <br />
                    View Active Visitors to check them out.
                  </div>
                ) : (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Check In</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Assign Parking (Optional)</label>
                      <select 
                        value={selectedSpot} 
                        onChange={(e) => setSelectedSpot(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      >
                        <option value="">No parking assigned</option>
                        {parkingSpots.map(spot => (
                          <option key={spot._id} value={spot._id}>
                            {spot.spotNumber} - {spot.block} {spot.floor} ({spot.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Security Notes (Optional)</label>
                      <input 
                        type="text" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Arrived with two-wheeler"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    
                    <button 
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                      style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {checkInLoading ? 'Checking In...' : 'Check In Visitor'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <h2 style={{ color: '#991b1b', margin: '0 0 0.5rem 0' }}>Visitor Pass Invalid</h2>
              <p style={{ fontSize: '1.2rem', color: '#991b1b', fontWeight: 'bold', marginBottom: '1.5rem' }}>Reason: {result.reason}</p>
              
              {result.passDetails && (
                <div style={{ textAlign: 'left', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', opacity: 0.8, color: 'var(--text-primary)' }}>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Visitor:</strong> {result.passDetails.visitor.fullName}</div>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Resident:</strong> {result.passDetails.issuedBy.name}</div>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Valid Until:</strong> {new Date(result.passDetails.validUntil).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorVerificationPage;
