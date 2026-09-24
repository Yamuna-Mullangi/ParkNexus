import React from 'react';

const ParkingLegend = () => {
  return (
    <div className="parking-legend">
      <div className="legend-item"><span className="dot">🟢</span> Available</div>
      <div className="legend-item"><span className="dot">🔴</span> Occupied</div>
      <div className="legend-item"><span className="dot">🔵</span> Assigned</div>
      <div className="legend-item"><span className="dot">🟡</span> Reserved</div>
      <div className="legend-item"><span className="dot">⚪</span> Maintenance</div>
    </div>
  );
};

export default ParkingLegend;
