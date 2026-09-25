const mongoose = require('mongoose');

const favoriteParkingSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true,
  }
);

favoriteParkingSchema.index({ user: 1, parkingSpot: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteParking', favoriteParkingSchema);
