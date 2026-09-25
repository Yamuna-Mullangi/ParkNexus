import api from './api';

const getActivityHistory = async (params) => {
  const res = await api.get('/activity-history', { params });
  return res.data;
};

const getActivitySummary = async () => {
  const res = await api.get('/activity-history/summary');
  return res.data;
};

export default {
  getActivityHistory,
  getActivitySummary
};
