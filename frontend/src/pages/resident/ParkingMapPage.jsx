import React from 'react';
import ParkingMap from '../../components/parking/ParkingMap';
import ParkingRecommendations from '../../components/parking/ParkingRecommendations';

const ParkingMapPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Parking Map</h1>
        <p>Find recommendations or explore the community parking layout manually.</p>
      </div>
      
      <ParkingRecommendations />
      
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Manual Map Search</h2>
      </div>
      <ParkingMap />
    </div>
  );
};

export default ParkingMapPage;
