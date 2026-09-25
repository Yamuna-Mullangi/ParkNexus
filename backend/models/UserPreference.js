const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferredZone: { type: String, trim: true, default: '' },
  preferredBlock: { type: String, trim: true, default: '' },
  preferredFloor: { type: String, trim: true, default: '' },
  preferredParkingType: { type: String, enum: ['Standard', 'Compact', 'Large', 'Accessible', 'Visitor', ''], default: '' },
  preferredVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  preferredReservationDuration: { type: Number, default: 60 },
  defaultStartTime: { type: String, trim: true, default: '' },

  notificationPreferences: {
    reservationUpdates: { type: Boolean, default: true },
    parkingUpdates: { type: Boolean, default: true },
    visitorUpdates: { type: Boolean, default: true },
    gateUpdates: { type: Boolean, default: true },
    sharedParkingUpdates: { type: Boolean, default: true },
    systemNotifications: { type: Boolean, default: true }
  },

  dashboardPreferences: {
    showParkingOverview: { type: Boolean, default: true },
    showUpcomingReservations: { type: Boolean, default: true },
    showVisitorSection: { type: Boolean, default: true },
    showRecommendationSection: { type: Boolean, default: true },
    showNotificationPreview: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
