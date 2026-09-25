import api from './api';

const vehicleService = {
  createVehicle: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my');
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  updateVehicle: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  
  setPrimaryVehicle: async (id) => {
    const response = await api.put(`/vehicles/${id}/primary`);
    return response.data.data !== undefined ? response.data.data : response.data;
  }
};

export default vehicleService;
