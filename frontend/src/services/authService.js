import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('parknexus-token', response.data.token);
    }
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('parknexus-token', response.data.token);
    }
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('parknexus-token');
    }
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('parknexus-token');
    if (!token) return null;
    
    try {
      const response = await api.get('/auth/me');
      return response.data.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      localStorage.removeItem('parknexus-token');
      throw error;
    }
  }
};

export default authService;
