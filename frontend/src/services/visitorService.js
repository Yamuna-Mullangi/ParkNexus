import api from './api';

const visitorService = {
  getMyVisitors: async (params = {}) => {
    const response = await api.get('/visitors/my', { params });
    // In our updated backend it returns { success, data, pagination }
    return response.data;
  },
  
  getUpcomingVisitors: async () => {
    const response = await api.get('/visitors/upcoming');
    return response.data.data || response.data;
  },
  
  getVisitorHistory: async () => {
    const response = await api.get('/visitors/history');
    return response.data.data || response.data;
  },
  
  getVisitor: async (id) => {
    const response = await api.get(`/visitors/${id}`);
    return response.data.data || response.data;
  },
  
  createVisitor: async (data) => {
    const response = await api.post('/visitors', data);
    return response.data.data || response.data;
  },
  
  updateVisitor: async (id, data) => {
    const response = await api.put(`/visitors/${id}`, data);
    return response.data.data || response.data;
  },
  
  cancelVisitor: async (id) => {
    const response = await api.put(`/visitors/${id}/cancel`);
    return response.data.data || response.data;
  }
};

export default visitorService;
