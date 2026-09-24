import React from 'react';
import ParkingMap from '../../components/parking/ParkingMap';

const ParkingMapPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Parking Map</h1>
        <p>Explore the community parking layout and view space availability.</p>
      </div>
      <ParkingMap />
    </div>
  );
};

export default ParkingMapPage;
