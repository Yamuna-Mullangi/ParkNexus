import api from './api';

const activityLogService = {
  getLogs: async (params = {}) => {
    // Remove empty parameters to keep query clean
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    const response = await api.get(`/activity-logs?${queryString}`);
    return response.data;
  }
};

export default activityLogService;
