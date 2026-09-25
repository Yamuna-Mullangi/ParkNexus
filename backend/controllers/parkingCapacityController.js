const parkingCapacityService = require('../services/parkingCapacityService');

exports.getCapacity = async (req, res) => {
  try {
    const filters = req.query || {};
    const capacity = await parkingCapacityService.getGlobalCapacity(filters);
    res.status(200).json({ success: true, data: capacity });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCapacityBreakdown = async (req, res) => {
  try {
    const { groupBy, ...filters } = req.query;
    
    if (!['zone', 'block', 'floor', 'type'].includes(groupBy)) {
      return res.status(400).json({ success: false, error: 'Invalid groupBy parameter' });
    }

    const breakdown = await parkingCapacityService.getCapacityBreakdown(groupBy, filters);
    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
