import api from './api';

const preferenceService = {
  getPreferences: async () => {
    const response = await api.get('/preferences');
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  updatePreferences: async (data) => {
    const response = await api.put('/preferences', data);
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  resetPreferences: async () => {
    const response = await api.post('/preferences/reset');
    return response.data.data !== undefined ? response.data.data : response.data;
  }
};

export default preferenceService;
