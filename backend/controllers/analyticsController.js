const analyticsService = require('../services/analyticsService');

const getOverview = async (req, res) => {
  try {
    const daysQuery = parseInt(req.query.days, 10);
    const days = isNaN(daysQuery) ? 7 : daysQuery;
    const overviewData = await analyticsService.getOverview(days);
    
    res.status(200).json({
      success: true,
      data: overviewData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getOverview
};
