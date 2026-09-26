import React, { useState } from 'react';
import ParkingRecommendationForm from './ParkingRecommendationForm';
import parkingService from '../../services/parkingService';
import ReservationModal from './ReservationModal';
import { useSocket } from '../../context/SocketContext';

const ParkingRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  // For reservation flow
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { registerListener, unregisterListener } = useSocket();

  React.useEffect(() => {
    const handleParkingUpdated = () => {
      // If a spot is updated, we re-fetch recommendations to ensure accuracy
      if (searchParams) {
        handleSearch(searchParams);
      }
    };
    
    registerListener('parking:updated', handleParkingUpdated);
    registerListener('reservation:updated', handleParkingUpdated);
    
    return () => {
      unregisterListener('parking:updated', handleParkingUpdated);
      unregisterListener('reservation:updated', handleParkingUpdated);
    };
  }, [searchParams, registerListener, unregisterListener]);

  const handleSearch = async (formData) => {
    setSearchParams(formData);
    setLoading(true);
    setError(null);
    try {
      const data = await parkingService.getParkingRecommendations(formData);
      setRecommendations(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load parking recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = (spot) => {
    setSelectedSpot(spot);
    setIsModalOpen(true);
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <ParkingRecommendationForm onSearch={handleSearch} loading={loading} />

      {loading && !recommendations && (
        <div className="loading-state">Finding suitable parking...</div>
      )}

      {error && (
        <div className="error-state">{error}</div>
      )}

      {recommendations && (
        <div className="glass-panel">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            Top Recommendations
          </h3>
          
          {recommendations.length === 0 ? (
            <div className="empty-state">
              <h4>No suitable parking spots found.</h4>
              <p>Try:</p>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>• another time</li>
                <li>• another zone</li>
                <li>• another parking type</li>
                <li>• removing some preferences</li>
              </ul>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {recommendations.map((rec, index) => (
                <div key={rec.spot._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderBottomLeftRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      BEST MATCH
                    </div>
                  )}
                  
                  <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{rec.spot.spotNumber}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: rec.score >= 80 ? '#10b981' : rec.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {rec.score}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {rec.spot.block} Block • {rec.spot.floor} • {rec.spot.zone} Zone
                    </div>
                  </div>
                  
                  <div style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>Why this spot?</p>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {rec.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => handleReserveClick(rec.spot)}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '1.25rem' }}
                    >
                      Reserve Spot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedSpot && (
        <ReservationModal 
          spot={selectedSpot} 
          onClose={() => setIsModalOpen(false)}
          prefilledData={{
            startTime: searchParams?.startTime,
            endTime: searchParams?.endTime,
            vehicle: searchParams?.vehicleId
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            if (searchParams) handleSearch(searchParams);
          }}
        />
      )}
    </div>
  );
};

export default ParkingRecommendations;
