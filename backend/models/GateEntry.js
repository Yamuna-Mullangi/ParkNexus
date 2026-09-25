const mongoose = require('mongoose');

const gateEntrySchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  visitorPass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitorPass',
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  securityUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  entryTime: {
    type: Date,
    required: true
  },
  expectedExitTime: {
    type: Date,
    required: true
  },
  actualExitTime: {
    type: Date
  },
  entryGate: {
    type: String,
    trim: true,
    default: 'Main Gate'
  },
  exitGate: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['checked_in', 'checked_out', 'denied', 'cancelled'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  overdueNotified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

gateEntrySchema.index({ visitor: 1 });
gateEntrySchema.index({ visitorPass: 1 });
gateEntrySchema.index({ resident: 1 });
gateEntrySchema.index({ securityUser: 1 });
gateEntrySchema.index({ parkingSpot: 1 });
gateEntrySchema.index({ entryTime: -1 });
gateEntrySchema.index({ status: 1 });

module.exports = mongoose.model('GateEntry', gateEntrySchema);
