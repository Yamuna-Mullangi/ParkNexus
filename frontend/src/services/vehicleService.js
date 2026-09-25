import api from './api';

const vehicleService = {
  createVehicle: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my');
    return response.data;
  },
  
  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  
  updateVehicle: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },
  
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
  
  setPrimaryVehicle: async (id) => {
    const response = await api.put(`/vehicles/${id}/primary`);
    return response.data;
  }
};

export default vehicleService;
