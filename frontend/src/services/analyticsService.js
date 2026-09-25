import api from './api';

const analyticsService = {
  getOverview: async (days = 7) => {
    const response = await api.get(`/analytics/overview?days=${days}`);
    return response.data;
  }
};

export default analyticsService;
