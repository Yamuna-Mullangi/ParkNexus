import React from 'react';
import useAuth from '../../hooks/useAuth';

const ParkingDetails = ({ spot, onClose }) => {
  const { user } = useAuth();
  if (!spot) return null;

  const isAssignedToMe = spot.assignedTo && user && spot.assignedTo._id === user._id;

  return (
    <div className="parking-details-modal">
      <div className="parking-details-header">
        <h3>Parking {spot.spotNumber}</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <div className="parking-details-content">
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className={`detail-value status-${spot.status}`}>
            {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
          </span>
        </div>
        
        {isAssignedToMe && (
          <div className="detail-row">
            <span className="detail-label">Assigned To</span>
            <span className="detail-value">You</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Zone</span>
          <span className="detail-value">{spot.block} &bull; {spot.floor}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Type</span>
          <span className="detail-value">{spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingDetails;
