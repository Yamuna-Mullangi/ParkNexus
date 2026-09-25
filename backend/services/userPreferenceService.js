const UserPreference = require('../models/UserPreference');
const Vehicle = require('../models/Vehicle');

const getDefaultPreferences = (userId) => {
  return new UserPreference({
    user: userId,
    preferredZone: '',
    preferredBlock: '',
    preferredFloor: '',
    preferredParkingType: '',
    preferredVehicle: null,
    preferredReservationDuration: 60,
    defaultStartTime: '',
    notificationPreferences: {
      reservationUpdates: true,
      parkingUpdates: true,
      visitorUpdates: true,
      gateUpdates: true,
      sharedParkingUpdates: true,
      systemNotifications: true
    },
    dashboardPreferences: {
      showParkingOverview: true,
      showUpcomingReservations: true,
      showVisitorSection: true,
      showRecommendationSection: true,
      showNotificationPreview: true
    }
  });
};

const getPreferences = async (userId) => {
  let prefs = await UserPreference.findOne({ user: userId }).populate('preferredVehicle', 'make model licensePlate isActive color');
  
  if (!prefs) {
    prefs = await getDefaultPreferences(userId).save();
    prefs = await UserPreference.findById(prefs._id).populate('preferredVehicle', 'make model licensePlate isActive color');
  }

  // Gracefully handle inactive or deleted vehicles
  if (prefs.preferredVehicle && !prefs.preferredVehicle.isActive) {
    prefs.preferredVehicle = null;
    await prefs.save();
  }

  return prefs;
};

const updatePreferences = async (userId, data) => {
  let prefs = await UserPreference.findOne({ user: userId });
  
  if (!prefs) {
    prefs = getDefaultPreferences(userId);
  }

  // Handle vehicle ownership validation
  if (data.preferredVehicle) {
    const vehicle = await Vehicle.findOne({ _id: data.preferredVehicle, owner: userId, isActive: true });
    if (!vehicle) {
      throw new Error('Invalid vehicle selected or vehicle does not belong to you.');
    }
    prefs.preferredVehicle = vehicle._id;
  } else if (data.preferredVehicle === null || data.preferredVehicle === '') {
    prefs.preferredVehicle = null;
  }

  // Update flat fields
  if (data.preferredZone !== undefined) prefs.preferredZone = data.preferredZone;
  if (data.preferredBlock !== undefined) prefs.preferredBlock = data.preferredBlock;
  if (data.preferredFloor !== undefined) prefs.preferredFloor = data.preferredFloor;
  if (data.preferredParkingType !== undefined) prefs.preferredParkingType = data.preferredParkingType;
  if (data.preferredReservationDuration !== undefined) prefs.preferredReservationDuration = data.preferredReservationDuration;
  if (data.defaultStartTime !== undefined) prefs.defaultStartTime = data.defaultStartTime;

  // Update notification preferences
  if (data.notificationPreferences) {
    prefs.notificationPreferences = {
      ...prefs.notificationPreferences,
      ...data.notificationPreferences
    };
  }

  // Update dashboard preferences
  if (data.dashboardPreferences) {
    prefs.dashboardPreferences = {
      ...prefs.dashboardPreferences,
      ...data.dashboardPreferences
    };
  }

  await prefs.save();
  
  return await UserPreference.findById(prefs._id).populate('preferredVehicle', 'make model licensePlate isActive color');
};

const resetPreferences = async (userId) => {
  await UserPreference.findOneAndDelete({ user: userId });
  const prefs = await getDefaultPreferences(userId).save();
  return prefs;
};

module.exports = {
  getPreferences,
  updatePreferences,
  resetPreferences
};
