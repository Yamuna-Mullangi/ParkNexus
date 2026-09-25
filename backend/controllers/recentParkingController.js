const recentParkingService = require('../services/recentParkingService');

exports.recordView = async (req, res) => {
  try {
    const recent = await recentParkingService.recordView(req.user.id, req.params.parkingSpotId);
    res.status(201).json({ success: true, data: recent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRecentViews = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const recents = await recentParkingService.getRecentViews(req.user.id, limit);
    res.status(200).json({ success: true, data: recents });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.clearRecentViews = async (req, res) => {
  try {
    await recentParkingService.clearRecentViews(req.user.id);
    res.status(200).json({ success: true, message: 'Recent views cleared' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
