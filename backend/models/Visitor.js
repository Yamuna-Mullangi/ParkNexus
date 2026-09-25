const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  expectedArrival: {
    type: Date,
    required: true
  },
  expectedDeparture: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'inside', 'completed', 'cancelled', 'expired'],
    default: 'upcoming'
  },
  currentGateEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GateEntry'
  }
}, { timestamps: true });

visitorSchema.index({ resident: 1 });
visitorSchema.index({ visitDate: 1 });
visitorSchema.index({ status: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
