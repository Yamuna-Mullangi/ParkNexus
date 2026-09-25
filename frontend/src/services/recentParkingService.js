import api from './api';

const recordView = async (parkingSpotId) => {
  const res = await api.post(`/parking/recent/${parkingSpotId}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

const getRecentViews = async (limit = 5) => {
  const res = await api.get(`/parking/recent?limit=${limit}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

const clearRecentViews = async () => {
  const res = await api.delete('/parking/recent');
  return res.data.data !== undefined ? res.data.data : res.data;
};

export default {
  recordView,
  getRecentViews,
  clearRecentViews
};
