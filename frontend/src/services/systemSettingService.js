import api from './api';

const systemSettingService = {
  getSystemSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSystemSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },

  resetSystemSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  }
};

export default systemSettingService;
