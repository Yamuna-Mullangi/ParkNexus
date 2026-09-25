const parkingService = require('../services/parkingService');
const { emitToAll } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

const getParkingSpots = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.block && req.query.block !== 'All') filter.block = req.query.block;
    if (req.query.floor && req.query.floor !== 'All') filter.floor = req.query.floor;
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
    if (req.query.type && req.query.type !== 'All') filter.type = req.query.type;
    
    // Default to active spots unless admin explicitly requests otherwise
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const spots = await parkingService.getAllParkingSpots(filter);
    res.json(spots);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getParkingSpot = async (req, res, next) => {
  try {
    const spot = await parkingService.getParkingSpotById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }
    res.json(spot);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getMyParking = async (req, res, next) => {
  try {
    const spot = await parkingService.getResidentAssignedSpot(req.user._id);
    if (!spot) {
      return res.status(404).json({ message: 'No assigned parking spot found for this user.' });
    }
    res.json(spot);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const createParkingSpot = async (req, res, next) => {
  try {
    const spot = await parkingService.createParkingSpot(req.body);
    
    await logActivity({
      actor: req.user._id,
      action: 'PARKING_CREATED',
      entityType: 'ParkingSpot',
      entityId: spot._id,
      description: `Created parking spot ${spot.spotNumber}`,
      ipAddress: req.ip
    });
    
    emitToAll('parking:updated', spot);
    res.status(201).json(spot);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const updateParkingSpot = async (req, res, next) => {
  try {
    const spot = await parkingService.updateParkingSpot(req.params.id, req.body);
    
    await logActivity({
      actor: req.user._id,
      action: 'PARKING_UPDATED',
      entityType: 'ParkingSpot',
      entityId: spot._id,
      description: `Updated parking spot ${spot.spotNumber}`,
      ipAddress: req.ip
    });
    
    emitToAll('parking:updated', spot);
    res.json(spot);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const assignParkingSpot = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const spot = await parkingService.assignParkingToResident(req.params.id, userId);
    
    await logActivity({
      actor: req.user._id,
      action: 'PARKING_UPDATED',
      entityType: 'ParkingSpot',
      entityId: spot._id,
      description: `Assigned parking spot ${spot.spotNumber} to user`,
      ipAddress: req.ip
    });
    
    emitToAll('parking:updated', spot);
    res.json(spot);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const deactivateParkingSpot = async (req, res, next) => {
  try {
    const spot = await parkingService.deactivateParkingSpot(req.params.id);
    
    await logActivity({
      actor: req.user._id,
      action: 'PARKING_DEACTIVATED',
      entityType: 'ParkingSpot',
      entityId: spot._id,
      description: `Deactivated parking spot ${spot.spotNumber}`,
      ipAddress: req.ip
    });
    
    emitToAll('parking:updated', spot);
    res.json(spot);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

module.exports = {
  getParkingSpots,
  getParkingSpot,
  getMyParking,
  createParkingSpot,
  updateParkingSpot,
  assignParkingSpot,
  deactivateParkingSpot,
};
