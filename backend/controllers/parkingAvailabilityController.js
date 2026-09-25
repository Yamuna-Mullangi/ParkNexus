const { checkSpotAvailability, getAvailableParkingSpots } = require('../services/parkingAvailabilityService');

const getAvailability = async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const availableSpots = await getAvailableParkingSpots(startDate, endDate, req.user.id, vehicleId);
    res.json({ success: true, data: availableSpots });
  } catch (err) {
    console.error('Error fetching parking availability:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Error' });
  }
};

const getSpotAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, vehicleId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const availability = await checkSpotAvailability(id, startDate, endDate, req.user.id, vehicleId);
    res.json({ success: true, data: availability });
  } catch (err) {
    console.error('Error checking spot availability:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Error' });
  }
};

module.exports = {
  getAvailability,
  getSpotAvailability
};
