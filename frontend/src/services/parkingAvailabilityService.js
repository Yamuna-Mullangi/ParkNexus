import api from './api';

const getAvailability = async (params) => {
  const res = await api.get('/parking/availability', { params });
  return res.data.data !== undefined ? res.data.data : res.data;
};

const getSpotAvailability = async (id, params) => {
  const res = await api.get(`/parking/availability/${id}`, { params });
  return res.data.data !== undefined ? res.data.data : res.data;
};

export default {
  getAvailability,
  getSpotAvailability
};
