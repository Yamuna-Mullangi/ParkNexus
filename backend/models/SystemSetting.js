const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  reservationSettings: {
    maxReservationDuration: { type: Number, default: 240 },
    minReservationDuration: { type: Number, default: 30 },
    maxActiveReservationsPerUser: { type: Number, default: 3 },
    allowSameDayReservation: { type: Boolean, default: true },
    allowFutureReservations: { type: Boolean, default: true }
  },
  visitorSettings: {
    defaultVisitorPassDuration: { type: Number, default: 120 },
    maxVisitorPassDuration: { type: Number, default: 1440 },
    allowVisitorVehicle: { type: Boolean, default: true },
    allowVisitorParking: { type: Boolean, default: true }
  },
  parkingSettings: {
    allowResidentAssignment: { type: Boolean, default: true },
    allowVisitorParking: { type: Boolean, default: true },
    defaultParkingView: { type: String, enum: ['map', 'list'], default: 'map' },
    highOccupancyThreshold: { type: Number, default: 80 },
    nearFullThreshold: { type: Number, default: 95 }
  },
  recommendationSettings: {
    recommendationsEnabled: { type: Boolean, default: true },
    maxRecommendations: { type: Number, default: 5 }
  },
  notificationSettings: {
    notificationsEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
