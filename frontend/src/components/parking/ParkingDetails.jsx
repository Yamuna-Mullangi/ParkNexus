import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import ReservationForm from '../reservations/ReservationForm';
import FavoriteButton from './FavoriteButton';
import recentParkingService from '../../services/recentParkingService';

const ParkingDetails = ({ spot, onClose }) => {
  const { user } = useAuth();
  const [showReserveForm, setShowReserveForm] = useState(false);
  
  useEffect(() => {
    if (spot && user && user.role === 'resident') {
      recentParkingService.recordView(spot._id).catch(err => {
        console.error('Failed to record parking view', err);
      });
    }
  }, [spot, user]);

  const [currentAvail, setCurrentAvail] = useState(null);

  useEffect(() => {
    if (spot) {
      const fetchAvail = async () => {
        try {
          const { default: parkingAvailabilityService } = await import('../../services/parkingAvailabilityService');
          const now = new Date();
          const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
          const res = await parkingAvailabilityService.getSpotAvailability(spot._id, {
            startDate: now.toISOString(),
            endDate: nextHour.toISOString()
          });
          setCurrentAvail(res.data);
        } catch (err) {
          console.error('Failed to get spot availability', err);
        }
      };
      fetchAvail();
    }
  }, [spot]);

  if (!spot) return null;

  const isAssignedToMe = spot.assignedTo && user && spot.assignedTo._id === user._id;

  return (
    <div className="parking-details-modal glass-panel" style={{ minWidth: "300px" }}>
      <div className="parking-details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Parking {spot.spotNumber}
          {user && user.role === 'resident' && <FavoriteButton parkingSpotId={spot._id} />}
        </h3>
        <button className="close-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
      </div>
      
      {showReserveForm ? (
        <ReservationForm spot={spot} onSuccess={onClose} onCancel={() => setShowReserveForm(false)} />
      ) : (
        <div className="parking-details-content">
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="detail-label" style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span className={`detail-value status-${spot.status}`} style={{ fontWeight: 'bold' }}>
              {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
            </span>
          </div>

          {currentAvail && !currentAvail.available && (
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
              <span className="detail-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>Conflict</span>
              <span className="detail-value" style={{ color: '#ef4444', textAlign: 'right', fontSize: '0.85rem' }}>
                {currentAvail.reasons[0]}
                {currentAvail.conflictType === 'reservation' && currentAvail.conflicts && user.role === 'admin' && (
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Until {new Date(currentAvail.conflicts[0].endTime).toLocaleTimeString()}
                  </div>
                )}
              </span>
            </div>
          )}
          
          {isAssignedToMe && (
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="detail-label" style={{ color: 'var(--text-secondary)' }}>Assigned To</span>
              <span className="detail-value">You</span>
            </div>
          )}

          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="detail-label" style={{ color: 'var(--text-secondary)' }}>Zone</span>
            <span className="detail-value">{spot.block} &bull; {spot.floor}</span>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span className="detail-label" style={{ color: 'var(--text-secondary)' }}>Type</span>
            <span className="detail-value">{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</span>
          </div>
          
          {spot.status === 'available' && spot.isActive && (
            <button 
              onClick={() => setShowReserveForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reserve Spot
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingDetails;
