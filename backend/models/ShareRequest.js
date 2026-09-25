const mongoose = require('mongoose');

const shareRequestSchema = new mongoose.Schema({
  parkingShare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingShare',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String
  }
}, { timestamps: true });

shareRequestSchema.index({ parkingShare: 1 });
shareRequestSchema.index({ requester: 1 });
shareRequestSchema.index({ owner: 1 });
shareRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ShareRequest', shareRequestSchema);
