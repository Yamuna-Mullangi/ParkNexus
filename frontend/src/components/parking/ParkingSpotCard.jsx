import React from 'react';
import './Parking.css'; // We will create this

const statusConfig = {
  available: { color: '#10b981', label: 'Available', dot: '🟢' },
  occupied: { color: '#ef4444', label: 'Occupied', dot: '🔴' },
  assigned: { color: '#3b82f6', label: 'Assigned', dot: '🔵' },
  reserved: { color: '#f59e0b', label: 'Reserved', dot: '🟡' },
  maintenance: { color: '#9ca3af', label: 'Maintenance', dot: '⚪' }
};

const ParkingSpotCard = ({ spot, onClick, isSelected }) => {
  const config = statusConfig[spot.status] || statusConfig.available;

  return (
    <div 
      className={`parking-spot-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(spot)}
      style={{ borderColor: isSelected ? config.color : 'transparent' }}
    >
      <div className="spot-number">{spot.spotNumber}</div>
      <div className="spot-status-icon">{config.dot}</div>
    </div>
  );
};

export default ParkingSpotCard;
