import api from './api';

const addFavorite = async (parkingSpotId) => {
  const res = await api.post(`/api/parking/favorites/${parkingSpotId}`);
  return res.data;
};

const removeFavorite = async (parkingSpotId) => {
  const res = await api.delete(`/api/parking/favorites/${parkingSpotId}`);
  return res.data;
};

const getFavorites = async () => {
  const res = await api.get('/api/parking/favorites');
  return res.data;
};

const checkFavorite = async (parkingSpotId) => {
  const res = await api.get(`/api/parking/favorites/check/${parkingSpotId}`);
  return res.data;
};

export default {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};
