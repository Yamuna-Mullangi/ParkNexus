import api from './api';

const systemSettingService = {
  getSystemSettings: async () => {
    const response = await api.get('/settings');
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  updateSystemSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  resetSystemSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data.data !== undefined ? response.data.data : response.data;
  }
};

export default systemSettingService;
