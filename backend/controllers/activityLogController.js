const { getLogs } = require('../services/activityLogService');

const getActivityLogs = async (req, res) => {
  try {
    const { action, entityType, actor, startDate, endDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filters = { action, entityType, actor, startDate, endDate };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const result = await getLogs(filters, page, limit, sortBy, sortOrder);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getActivityLogs
};
