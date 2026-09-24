import api from './api';

const parkingService = {
  getAllParkingSpots: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'All') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/parking?${params.toString()}`);
    return response.data;
  },

  getParkingSpotById: async (id) => {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },

  getMyParking: async () => {
    const response = await api.get('/parking/my');
    return response.data;
  },

  createParkingSpot: async (data) => {
    const response = await api.post('/parking', data);
    return response.data;
  },

  updateParkingSpot: async (id, data) => {
    const response = await api.put(`/parking/${id}`, data);
    return response.data;
  },

  assignParkingSpot: async (id, userId) => {
    const response = await api.put(`/parking/${id}/assign`, { userId });
    return response.data;
  },

  deactivateParkingSpot: async (id) => {
    const response = await api.delete(`/parking/${id}`);
    return response.data;
  }
};

export default parkingService;
