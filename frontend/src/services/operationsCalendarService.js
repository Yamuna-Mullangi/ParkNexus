import api from './api';

const getCalendarEvents = async (params) => {
  const res = await api.get('/operations/calendar', { params });
  return res.data.data !== undefined ? res.data.data : res.data;
};

export default {
  getCalendarEvents
};
