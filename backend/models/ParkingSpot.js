const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema(
  {
    spotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    zone: {
      type: String,
      required: true,
      default: 'Community',
    },
    block: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['standard', 'compact', 'large', 'accessible', 'visitor'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'assigned', 'reserved', 'maintenance'],
      default: 'available',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
parkingSpotSchema.index({ spotNumber: 1 });
parkingSpotSchema.index({ status: 1 });
parkingSpotSchema.index({ block: 1, floor: 1 });

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);
module.exports = ParkingSpot;
