const mongoose = require('mongoose');

const recentParkingViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parkingSpot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpot',
      required: true,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    }
  }
);

recentParkingViewSchema.index({ user: 1, parkingSpot: 1 }, { unique: true });
recentParkingViewSchema.index({ user: 1, lastViewedAt: -1 });

module.exports = mongoose.model('RecentParkingView', recentParkingViewSchema);
