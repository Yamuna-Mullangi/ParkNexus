import React from 'react';

const ParkingStats = ({ spots }) => {
  const stats = {
    total: spots.length,
    available: spots.filter(s => s.status === 'available').length,
    occupied: spots.filter(s => s.status === 'occupied').length,
    assigned: spots.filter(s => s.status === 'assigned').length,
    maintenance: spots.filter(s => s.status === 'maintenance').length,
  };

  return (
    <div className="parking-stats-card">
      <h3>Parking Overview</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Spots</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label dot-available">Available</span>
          <span className="stat-value">{stats.available}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label dot-occupied">Occupied</span>
          <span className="stat-value">{stats.occupied}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label dot-assigned">Assigned</span>
          <span className="stat-value">{stats.assigned}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label dot-maintenance">Maintenance</span>
          <span className="stat-value">{stats.maintenance}</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingStats;
