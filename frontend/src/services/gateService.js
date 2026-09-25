import api from './api';

const gateService = {
  checkInVisitor: async (data) => {
    const response = await api.post('/gate/check-in', data);
    return response.data.data || response.data;
  },

  checkOutVisitor: async (gateEntryId, data = {}) => {
    const response = await api.post(`/gate/check-out/${gateEntryId}`, data);
    return response.data.data || response.data;
  },

  getActiveVisitors: async () => {
    const response = await api.get('/gate/active');
    return response.data.data || response.data;
  },

  getTodayGateEntries: async () => {
    const response = await api.get('/gate/today');
    return response.data.data || response.data;
  },

  getGateHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/gate/history${query ? `?${query}` : ''}`);
    return response.data;
  },

  getGateEntry: async (id) => {
    const response = await api.get(`/gate/${id}`);
    return response.data.data || response.data;
  },

  getVisitorGateStatus: async (visitorId) => {
    const response = await api.get(`/gate/visitor/${visitorId}`);
    return response.data.data || response.data;
  }
};

export default gateService;
