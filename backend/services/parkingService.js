const ParkingSpot = require('../models/ParkingSpot');
const ParkingShare = require('../models/ParkingShare');

const getAllParkingSpots = async (query = {}) => {
  const spots = await ParkingSpot.find(query).populate('assignedTo', 'name email').lean();
  const now = new Date();
  const activeShares = await ParkingShare.find({
    status: 'active',
    endTime: { $gt: now },
    startTime: { $lte: now }
  }).lean();
  
  const sharedSpotIds = new Set(activeShares.map(s => s.parkingSpot.toString()));
  return spots.map(spot => ({
    ...spot,
    isShared: sharedSpotIds.has(spot._id.toString())
  }));
};

const getParkingSpotById = async (id) => {
  const spot = await ParkingSpot.findById(id).populate('assignedTo', 'name email').lean();
  if (!spot) return null;
  const now = new Date();
  const activeShare = await ParkingShare.findOne({
    parkingSpot: id,
    status: 'active',
    endTime: { $gt: now },
    startTime: { $lte: now }
  });
  return { ...spot, isShared: !!activeShare };
};

const getResidentAssignedSpot = async (userId) => {
  return await ParkingSpot.findOne({ assignedTo: userId, isActive: true });
};

const createParkingSpot = async (data) => {
  // Check if spot number already exists
  const exists = await ParkingSpot.findOne({ spotNumber: data.spotNumber });
  if (exists) {
    throw new Error('Parking spot number already exists');
  }
  return await ParkingSpot.create(data);
};

const updateParkingSpot = async (id, data) => {
  if (data.spotNumber) {
    const exists = await ParkingSpot.findOne({ spotNumber: data.spotNumber, _id: { $ne: id } });
    if (exists) {
      throw new Error('Parking spot number already exists');
    }
  }

  const spot = await ParkingSpot.findById(id);
  if (!spot) throw new Error('Parking spot not found');

  Object.assign(spot, data);
  await spot.save();
  return spot;
};

const assignParkingToResident = async (spotId, userId) => {
  const { getSettings } = require('./systemSettingService');
  const settings = await getSettings();
  if (userId && !settings.parkingSettings.allowResidentAssignment) {
    throw new Error('Resident parking assignments are currently disabled by administration.');
  }

  // Check if user already has an assigned spot
  if (userId) {
    const currentAssigned = await ParkingSpot.findOne({ assignedTo: userId, _id: { $ne: spotId } });
    if (currentAssigned) {
      throw new Error('Resident already has an assigned parking spot');
    }
  }

  const spot = await ParkingSpot.findById(spotId);
  if (!spot) throw new Error('Parking spot not found');

  if (userId) {
    spot.assignedTo = userId;
    spot.status = 'assigned';
  } else {
    spot.assignedTo = null;
    spot.status = 'available'; // Set back to available when unassigned
  }
  
  await spot.save();
  return spot.populate('assignedTo', 'name email');
};

const deactivateParkingSpot = async (id) => {
  const spot = await ParkingSpot.findById(id);
  if (!spot) throw new Error('Parking spot not found');

  spot.isActive = false;
  spot.status = 'maintenance';
  await spot.save();
  return spot;
};

module.exports = {
  getAllParkingSpots,
  getParkingSpotById,
  getResidentAssignedSpot,
  createParkingSpot,
  updateParkingSpot,
  assignParkingToResident,
  deactivateParkingSpot,
};
