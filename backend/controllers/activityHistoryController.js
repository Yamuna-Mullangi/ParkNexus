const activityHistoryService = require('../services/activityHistoryService');

const getActivityHistory = async (req, res) => {
  try {
    const filters = req.query;
    const history = await activityHistoryService.getUserActivityHistory({
      user: req.user.id,
      role: req.user.role,
      filters
    });
    res.json({ success: true, ...history });
  } catch (err) {
    console.error('Error in getActivityHistory:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getActivitySummary = async (req, res) => {
  try {
    const summary = await activityHistoryService.getUserActivitySummary({
      user: req.user.id,
      role: req.user.role
    });
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('Error in getActivitySummary:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getActivityHistory,
  getActivitySummary
};
