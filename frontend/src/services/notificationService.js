import api from './api';

const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data.data || response.data || [];
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data.data !== undefined ? response.data.data : response.data;
  }
};

export default notificationService;
