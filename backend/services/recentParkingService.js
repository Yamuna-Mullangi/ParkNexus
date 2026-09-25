const RecentParkingView = require('../models/RecentParkingView');
const ParkingSpot = require('../models/ParkingSpot');

const recordView = async (userId, parkingSpotId) => {
  const spot = await ParkingSpot.findById(parkingSpotId);
  if (!spot) throw new Error('Parking spot not found');

  const recent = await RecentParkingView.findOneAndUpdate(
    { user: userId, parkingSpot: parkingSpotId },
    { lastViewedAt: Date.now() },
    { upsert: true, new: true }
  );

  // Keep history bounded to 15 items to prevent unbounded growth
  const count = await RecentParkingView.countDocuments({ user: userId });
  if (count > 15) {
    const oldest = await RecentParkingView.find({ user: userId })
      .sort({ lastViewedAt: 1 })
      .limit(count - 15);
    
    const oldestIds = oldest.map(o => o._id);
    await RecentParkingView.deleteMany({ _id: { $in: oldestIds } });
  }

  return recent;
};

const getRecentViews = async (userId, limit = 5) => {
  return await RecentParkingView.find({ user: userId })
    .populate('parkingSpot')
    .sort({ lastViewedAt: -1 })
    .limit(limit);
};

const clearRecentViews = async (userId) => {
  return await RecentParkingView.deleteMany({ user: userId });
};

module.exports = {
  recordView,
  getRecentViews,
  clearRecentViews
};
