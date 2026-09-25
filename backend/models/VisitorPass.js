const mongoose = require('mongoose');

const visitorPassSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  passToken: {
    type: String,
    required: true,
    unique: true
  },
  qrPayload: {
    type: String,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'used'],
    default: 'active'
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

visitorPassSchema.index({ visitor: 1 });
visitorPassSchema.index({ status: 1 });
visitorPassSchema.index({ validUntil: 1 });

module.exports = mongoose.model('VisitorPass', visitorPassSchema);
