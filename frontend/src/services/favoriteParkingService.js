import api from './api';

const addFavorite = async (parkingSpotId) => {
  const res = await api.post(`/parking/favorites/${parkingSpotId}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

const removeFavorite = async (parkingSpotId) => {
  const res = await api.delete(`/parking/favorites/${parkingSpotId}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

const getFavorites = async () => {
  const res = await api.get('/parking/favorites');
  return res.data.data !== undefined ? res.data.data : res.data;
};

const checkFavorite = async (parkingSpotId) => {
  const res = await api.get(`/parking/favorites/check/${parkingSpotId}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

export default {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};
