import React, { useState, useEffect } from 'react';
import parkingService from '../../services/parkingService';
import ParkingSpotCard from './ParkingSpotCard';
import ParkingLegend from './ParkingLegend';
import ParkingFilters from './ParkingFilters';
import ParkingDetails from './ParkingDetails';
import ParkingStats from './ParkingStats';

const ParkingMap = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filters, setFilters] = useState({
    block: 'All',
    floor: 'All',
    status: 'All',
    type: 'All',
    search: ''
  });

  useEffect(() => {
    fetchSpots();
  }, [filters]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getAllParkingSpots(filters);
      // Client side search filter
      const searchStr = filters.search.toLowerCase();
      const filteredData = data.filter(s => 
        s.spotNumber.toLowerCase().includes(searchStr) ||
        s.block.toLowerCase().includes(searchStr)
      );
      setSpots(filteredData);
      setError(null);
    } catch (err) {
      setError('Failed to load parking spaces.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
  };

  // Group spots by block
  const groupedSpots = spots.reduce((acc, spot) => {
    if (!acc[spot.block]) acc[spot.block] = [];
    acc[spot.block].push(spot);
    return acc;
  }, {});

  return (
    <div className="parking-map-container">
      <div className="parking-sidebar">
        <ParkingStats spots={spots} />
        <ParkingFilters filters={filters} setFilters={setFilters} />
        <ParkingLegend />
      </div>
      
      <div className="parking-main">
        {loading ? (
          <div className="loading-state">Loading parking spaces...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : spots.length === 0 ? (
          <div className="empty-state">No parking spaces match your search.</div>
        ) : (
          <div className="parking-blocks">
            {Object.keys(groupedSpots).map(block => (
              <div key={block} className="parking-block-group">
                <h3 className="block-title">{block}</h3>
                <div className="parking-grid">
                  {groupedSpots[block].map(spot => (
                    <ParkingSpotCard 
                      key={spot._id} 
                      spot={spot} 
                      onClick={handleSpotClick}
                      isSelected={selectedSpot && selectedSpot._id === spot._id}
                    />
                  ))}
                </div>
                <div className="driveway-marker">════════════ DRIVEWAY ════════════</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSpot && (
        <div className="parking-details-overlay">
          <ParkingDetails spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
        </div>
      )}
    </div>
  );
};

export default ParkingMap;
