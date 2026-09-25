import api from './api';

/**
 * Fetch global parking capacity metrics
 * @param {Object} filters Optional filters (zone, block, floor, type, status)
 * @returns {Promise<Object>} Capacity data
 */
const getParkingCapacity = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const res = await api.get(`/parking/capacity?${queryParams}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

/**
 * Fetch parking capacity breakdown
 * @param {Object} params Must include groupBy (zone, block, floor, type) and optional filters
 * @returns {Promise<Object>} Capacity breakdown data
 */
const getParkingCapacityBreakdown = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const res = await api.get(`/parking/capacity/breakdown?${queryParams}`);
  return res.data.data !== undefined ? res.data.data : res.data;
};

export default {
  getParkingCapacity,
  getParkingCapacityBreakdown
};
