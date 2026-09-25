import api from './api';

const parkingShareService = {
  getAvailableSharedSpots: async () => {
    const response = await api.get('/parking/shared');
    return response.data;
  },
  
  getMyShares: async () => {
    const response = await api.get('/parking/shares/my');
    return response.data;
  },
  
  getReceivedRequests: async () => {
    const response = await api.get('/parking/share-requests/received');
    return response.data;
  },
  
  getSentRequests: async () => {
    const response = await api.get('/parking/share-requests/sent');
    return response.data;
  },
  
  createShare: async (spotId, data) => {
    const response = await api.post(`/parking/${spotId}/share`, data);
    return response.data;
  },
  
  cancelShare: async (id) => {
    const response = await api.delete(`/parking/shares/${id}`);
    return response.data;
  },
  
  requestShare: async (shareId, data) => {
    const response = await api.post(`/parking/shares/${shareId}/request`, data);
    return response.data;
  },
  
  approveShareRequest: async (requestId) => {
    const response = await api.put(`/parking/share-requests/${requestId}/approve`);
    return response.data;
  },
  
  rejectShareRequest: async (requestId) => {
    const response = await api.put(`/parking/share-requests/${requestId}/reject`);
    return response.data;
  }
};

export default parkingShareService;
