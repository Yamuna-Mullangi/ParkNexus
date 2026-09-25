import api from './api';

const visitorPassService = {
  createPass: async (visitorId) => {
    const response = await api.post(`/visitors/${visitorId}/passes`);
    return response.data.data || response.data;
  },
  
  getPass: async (visitorId, passId) => {
    const response = await api.get(`/visitors/${visitorId}/passes/${passId}`);
    return response.data.data || response.data;
  },
  
  cancelPass: async (visitorId, passId) => {
    const response = await api.put(`/visitors/${visitorId}/passes/${passId}/cancel`);
    return response.data.data || response.data;
  },
  
  validatePass: async (token) => {
    const response = await api.post('/visitors/passes/validate', { token });
    return response.data.data || response.data;
  }
};

export default visitorPassService;
