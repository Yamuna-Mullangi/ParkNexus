import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import favoriteParkingService from '../../services/favoriteParkingService';
import recentParkingService from '../../services/recentParkingService';
import FavoriteButton from '../../components/parking/FavoriteButton';
import { useSocket } from '../../context/SocketContext';

const FavoriteParkingPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { registerListener, unregisterListener } = useSocket();

  const loadData = async () => {
    try {
      setLoading(true);
      const [favsRes, recentRes] = await Promise.all([
        favoriteParkingService.getFavorites(),
        recentParkingService.getRecentViews(5)
      ]);
      setFavorites(favsRes.data || []);
      setRecentViews(recentRes.data || []);
    } catch (err) {
      console.error('Failed to load favorites and recent views');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleParkingUpdate = (updatedSpot) => {
      setFavorites(prev => prev.map(fav => {
        if (fav.parkingSpot && fav.parkingSpot._id === updatedSpot._id) {
          return { ...fav, parkingSpot: updatedSpot };
        }
        return fav;
      }));
      setRecentViews(prev => prev.map(recent => {
        if (recent.parkingSpot && recent.parkingSpot._id === updatedSpot._id) {
          return { ...recent, parkingSpot: updatedSpot };
        }
        return recent;
      }));
    };

    registerListener('parking:updated', handleParkingUpdate);
    return () => {
      unregisterListener('parking:updated', handleParkingUpdate);
    };
  }, [registerListener, unregisterListener]);

  const handleRemoveFavorite = (spotId) => {
    setFavorites(prev => prev.filter(f => f.parkingSpot && f.parkingSpot._id !== spotId));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'assigned': return '#3b82f6';
      case 'reserved': return '#f59e0b';
      case 'maintenance': return '#9ca3af';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading preferences...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Saved & Recent Parking</h1>
        <p>Quick access to your favorite and recently viewed parking spots.</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>Favorite Parking Spots</h2>
        {favorites.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            No favorite parking spots yet. <br/><br/>
            Save parking spots you use often for quick access.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favorites.map(fav => {
              const spot = fav.parkingSpot;
              if (!spot) return null;
              
              return (
                <div key={fav._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Spot {spot.spotNumber}</h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {spot.block} • Floor {spot.floor} • {spot.type}
                      </div>
                    </div>
                    <FavoriteButton parkingSpotId={spot._id} initialIsFavorite={true} onToggle={() => handleRemoveFavorite(spot._id)} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 'bold', color: !spot.isActive ? 'var(--text-secondary)' : getStatusColor(spot.status) }}>
                    ● {!spot.isActive ? 'Deactivated' : spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => navigate(`/resident/parking?search=${spot.spotNumber}`)}
                    >
                      View Map
                    </button>
                    <button 
                      className="btn btn-primary" 
                      disabled={spot.status !== 'available' || !spot.isActive}
                      onClick={() => navigate(`/resident/parking?search=${spot.spotNumber}`)} // Simple redirection for reservation, real flow can be handled on map
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2>Recently Viewed</h2>
        {recentViews.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            No recently viewed parking yet.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {recentViews.map(recent => {
              const spot = recent.parkingSpot;
              if (!spot) return null;
              
              return (
                <div 
                  key={recent._id} 
                  style={{ minWidth: '200px', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => navigate(`/resident/parking?search=${spot.spotNumber}`)}
                >
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{spot.spotNumber}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{spot.block}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: getStatusColor(spot.status) }}>
                    {spot.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteParkingPage;
