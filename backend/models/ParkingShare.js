const mongoose = require('mongoose');

const parkingShareSchema = new mongoose.Schema({
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

parkingShareSchema.index({ parkingSpot: 1 });
parkingShareSchema.index({ owner: 1 });
parkingShareSchema.index({ startTime: 1, endTime: 1 });
parkingShareSchema.index({ status: 1 });

module.exports = mongoose.model('ParkingShare', parkingShareSchema);
