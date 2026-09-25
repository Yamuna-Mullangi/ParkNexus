const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: String
  },
  description: {
    type: String
  },
  metadata: {
    type: Object
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

activityLogSchema.index({ actor: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
