const SystemSetting = require('../models/SystemSetting');

let _cachedSettings = null;

const getDefaultSettings = () => {
  return new SystemSetting({
    reservationSettings: {
      maxReservationDuration: 240,
      minReservationDuration: 30,
      maxActiveReservationsPerUser: 3,
      allowSameDayReservation: true,
      allowFutureReservations: true
    },
    visitorSettings: {
      defaultVisitorPassDuration: 120,
      maxVisitorPassDuration: 1440,
      allowVisitorVehicle: true,
      allowVisitorParking: true
    },
    parkingSettings: {
      allowResidentAssignment: true,
      allowVisitorParking: true,
      defaultParkingView: "map"
    },
    recommendationSettings: {
      recommendationsEnabled: true,
      maxRecommendations: 5
    },
    notificationSettings: {
      notificationsEnabled: true
    }
  });
};

const getSettings = async () => {
  if (_cachedSettings) {
    return _cachedSettings;
  }
  
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await getDefaultSettings().save();
  }
  
  _cachedSettings = settings;
  return settings;
};

const updateSettings = async (data) => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = getDefaultSettings();
  }
  
  // Safe merge avoiding prototype pollution and keeping schema valid
  if (data.reservationSettings) {
    Object.assign(settings.reservationSettings, data.reservationSettings);
  }
  if (data.visitorSettings) {
    Object.assign(settings.visitorSettings, data.visitorSettings);
  }
  if (data.parkingSettings) {
    Object.assign(settings.parkingSettings, data.parkingSettings);
  }
  if (data.recommendationSettings) {
    Object.assign(settings.recommendationSettings, data.recommendationSettings);
  }
  if (data.notificationSettings) {
    Object.assign(settings.notificationSettings, data.notificationSettings);
  }

  const saved = await settings.save();
  _cachedSettings = saved;
  return saved;
};

const resetSettings = async () => {
  await SystemSetting.deleteMany({});
  const settings = await getDefaultSettings().save();
  _cachedSettings = settings;
  return settings;
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
