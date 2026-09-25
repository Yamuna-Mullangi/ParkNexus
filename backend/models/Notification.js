const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'RESERVATION_APPROVED',
        'RESERVATION_REJECTED',
        'RESERVATION_CANCELLED',
        'RESERVATION_CREATED',
        'RESERVATION_STARTED',
        'RESERVATION_COMPLETED',
        'RESERVATION_EXPIRED',
        'PARKING_SHARED',
        'SHARE_REQUESTED',
        'SHARE_REQUEST_APPROVED',
        'SHARE_REQUEST_REJECTED',
        'VISITOR_PASS_CREATED',
        'VISITOR_PASS_EXPIRING',
        'VISITOR_CHECKED_IN',
        'VISITOR_CHECKED_OUT',
        'PARKING_STATUS_CHANGED',
        'SYSTEM_ALERT',
        'VISITOR_STATUS_CHANGED',
        'VISITOR_OVERDUE'
      ]
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntityType'
    },
    relatedEntityType: {
      type: String,
      enum: ['Reservation', 'Visitor', 'GateEntry', 'VisitorPass', 'ParkingSpot', 'User']
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
