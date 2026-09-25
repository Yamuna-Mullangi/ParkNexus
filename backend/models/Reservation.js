const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
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
    enum: ['pending', 'approved', 'active', 'completed', 'cancelled', 'expired', 'rejected'],
    default: 'pending'
  },
  purpose: {
    type: String
  }
}, { timestamps: true });

reservationSchema.index({ parkingSpot: 1 });
reservationSchema.index({ user: 1 });
reservationSchema.index({ startTime: 1, endTime: 1 });
reservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
