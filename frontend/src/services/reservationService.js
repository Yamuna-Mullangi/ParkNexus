import api from './api';

const reservationService = {
  createReservation: async (data) => {
    const response = await api.post('/reservations', data);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  getMyReservations: async (params = {}) => {
    const response = await api.get('/reservations/my', { params });
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  getReservation: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  cancelReservation: async (id) => {
    const response = await api.put(`/reservations/${id}/cancel`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  getAllReservations: async (params = {}) => {
    const response = await api.get('/reservations', { params });
    return response.data.data !== undefined ? response.data.data : response.data;
  }
};

export default reservationService;
