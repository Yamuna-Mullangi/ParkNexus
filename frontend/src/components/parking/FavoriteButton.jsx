import React, { useState, useEffect } from 'react';
import favoriteParkingService from '../../services/favoriteParkingService';

const FavoriteButton = ({ parkingSpotId, initialIsFavorite = false, onToggle }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await favoriteParkingService.checkFavorite(parkingSpotId);
        setIsFavorite(res.data.isFavorite);
      } catch (err) {
        console.error('Failed to check favorite status');
      }
    };
    checkStatus();
  }, [parkingSpotId]);

  const toggleFavorite = async (e) => {
    e.stopPropagation(); // prevent card click
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteParkingService.removeFavorite(parkingSpotId);
        setIsFavorite(false);
      } else {
        await favoriteParkingService.addFavorite(parkingSpotId);
        setIsFavorite(true);
      }
      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1.25rem',
        color: isFavorite ? '#f59e0b' : 'var(--text-secondary)',
        padding: '0.25rem',
        transition: 'transform 0.2s'
      }}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
};

export default FavoriteButton;
