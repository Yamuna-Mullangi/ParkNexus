const getDateRangeQuery = (dateRange, field = 'createdAt') => {
  if (!dateRange) return {};
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate = null;
  let endDate = null;
  
  switch (dateRange) {
    case 'today':
      startDate = startOfToday;
      endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'tomorrow':
      startDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      endDate = new Date(startOfToday.getTime() + 48 * 60 * 60 * 1000);
      break;
    case 'thisWeek':
      // From Monday to Sunday
      const day = startOfToday.getDay();
      const diff = startOfToday.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate = new Date(startOfToday.setDate(diff));
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'next7Days':
      startDate = startOfToday;
      endDate = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'past7Days':
      startDate = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    default:
      return {};
  }
  
  return { [field]: { $gte: startDate, $lt: endDate } };
};

module.exports = { getDateRangeQuery };
