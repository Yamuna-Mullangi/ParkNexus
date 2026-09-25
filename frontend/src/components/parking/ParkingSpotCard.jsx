import React from 'react';
import './Parking.css'; // We will create this
import FavoriteButton from './FavoriteButton';
import useAuth from '../../hooks/useAuth';

const statusConfig = {
  available: { color: '#10b981', label: 'Available', dot: '🟢' },
  occupied: { color: '#ef4444', label: 'Occupied', dot: '🔴' },
  assigned: { color: '#3b82f6', label: 'Assigned', dot: '🔵' },
  reserved: { color: '#f59e0b', label: 'Reserved', dot: '🟡' },
  maintenance: { color: '#9ca3af', label: 'Maintenance', dot: '⚪' }
};

const ParkingSpotCard = ({ spot, onClick, isSelected }) => {
  const { user } = useAuth();
  const config = statusConfig[spot.status] || statusConfig.available;

  return (
    <button 
      className={`parking-spot-card ${isSelected ? 'selected' : ''} ${spot.isShared ? 'shared' : ''}`}
      onClick={() => onClick(spot)}
      style={{ borderColor: isSelected ? config.color : 'transparent', position: 'relative', display: 'flex', flexDirection: 'column' }}
      aria-label={`Parking Spot ${spot.spotNumber}, Status: ${config.label}`}
      title={`${spot.spotNumber} - ${config.label}`}
    >
      {spot.isShared && (
        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#8b5cf6', color: 'white', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', zIndex: 1 }}>
          Shared
        </span>
      )}
      <div className="spot-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {spot.spotNumber}
        {user && user.role === 'resident' && <FavoriteButton parkingSpotId={spot._id} />}
      </div>
      <div className="spot-status-icon">{config.dot}</div>
    </button>
  );
};

export default ParkingSpotCard;
