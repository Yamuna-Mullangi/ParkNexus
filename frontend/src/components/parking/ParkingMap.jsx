import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import parkingService from '../../services/parkingService';
import ParkingSpotCard from './ParkingSpotCard';
import ParkingLegend from './ParkingLegend';
import ParkingFilters from './ParkingFilters';
import ParkingDetails from './ParkingDetails';
import ParkingStats from './ParkingStats';
import { useSocket } from '../../context/SocketContext';

const ParkingMap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [spots, setSpots] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  const [filters, setFilters] = useState({
    block: searchParams.get('block') || 'All',
    floor: searchParams.get('floor') || 'All',
    status: searchParams.get('status') || 'All',
    type: searchParams.get('type') || 'All',
    search: searchParams.get('search') || ''
  });

  const { registerListener, unregisterListener } = useSocket();

  useEffect(() => {
    // Update URL params
    const newParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'All') {
        newParams.set(key, filters[key]);
      }
    });
    setSearchParams(newParams, { replace: true });
    
    fetchSpots();
  }, [filters]);

  useEffect(() => {
    const handleParkingUpdated = (updatedSpot) => {
      setSpots(prevSpots => {
        // Only update if it exists in current view (could be advanced filtering logic here)
        // But for simplicity we just map and replace the matching spot.
        const exists = prevSpots.find(s => s._id === updatedSpot._id);
        if (exists) {
          return prevSpots.map(s => s._id === updatedSpot._id ? updatedSpot : s);
        } else {
          // It might be a new spot, check filters (naive implementation)
          if ((filters.block === 'All' || filters.block === updatedSpot.block) &&
              (filters.status === 'All' || filters.status === updatedSpot.status) &&
              (filters.type === 'All' || filters.type === updatedSpot.type)) {
            return [...prevSpots, updatedSpot];
          }
          return prevSpots;
        }
      });
      
      // Update selected spot if it was modified
      setSelectedSpot(prev => prev?._id === updatedSpot._id ? updatedSpot : prev);
    };

    registerListener('parking:updated', handleParkingUpdated);

    return () => {
      unregisterListener('parking:updated', handleParkingUpdated);
    };
  }, [registerListener, unregisterListener, filters]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      
      const { default: parkingCapacityService } = await import('../../services/parkingCapacityService');
      
      const [data, capacityData] = await Promise.all([
        parkingService.getAllParkingSpots(filters),
        parkingCapacityService.getParkingCapacity(filters)
      ]);
      
      // Client side search filter
      const searchStr = filters.search.toLowerCase();
      const filteredData = data.filter(s => 
        s.spotNumber.toLowerCase().includes(searchStr) ||
        s.block.toLowerCase().includes(searchStr)
      );
      
      setSpots(filteredData);
      setCapacity(capacityData.data);
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
        <ParkingStats spots={spots} capacity={capacity} />
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
