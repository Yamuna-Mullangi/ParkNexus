import api from './api';

const getCalendarEvents = async (params) => {
  const res = await api.get('/api/operations/calendar', { params });
  return res.data;
};

export default {
  getCalendarEvents
};
