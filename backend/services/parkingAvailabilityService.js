const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const ParkingShare = require('../models/ParkingShare');
const GateEntry = require('../models/GateEntry');
const Vehicle = require('../models/Vehicle');

const checkSpotAvailability = async (spotId, startTime, endTime, requesterId = null, vehicleId = null) => {
  const spot = await ParkingSpot.findById(spotId);
  if (!spot) {
    return { available: false, conflictType: 'invalid', reasons: ['Parking spot not found'] };
  }

  const reqStart = new Date(startTime);
  const reqEnd = new Date(endTime);

  if (reqStart >= reqEnd) {
    return { available: false, conflictType: 'invalid_time', reasons: ['Start time must be before end time'] };
  }
  if (reqStart < new Date()) {
    return { available: false, conflictType: 'invalid_time', reasons: ['Start time cannot be in the past'] };
  }

  // 1. Basic Status Checks
  if (!spot.isActive) {
    return { available: false, conflictType: 'inactive', reasons: ['Parking spot is deactivated'] };
  }
  if (spot.status === 'maintenance') {
    return { available: false, conflictType: 'maintenance', reasons: ['Parking spot is under maintenance'] };
  }
  
  // Note: spot.status === 'occupied' generally means physically occupied right now.
  // If the request is for the future, it might be available later, but for simplicity, 
  // if we strictly follow existing occupancy rules without future prediction:
  // If request is within next hour, and it's occupied, maybe block? 
  // We'll trust the reservation overlaps more reliably for future checks.

  // 2. Assignment & Sharing Logic
  let isShareProvidingAvailability = false;

  if (spot.status === 'assigned') {
    const isOwner = requesterId && spot.assignedTo && spot.assignedTo.toString() === requesterId.toString();
    
    // Find any active shares overlapping the requested time
    const overlappingShares = await ParkingShare.find({
      parkingSpot: spot._id,
      status: 'active',
      $or: [
        { startTime: { $lt: reqEnd }, endTime: { $gt: reqStart } }
      ]
    });

    if (isOwner) {
      if (overlappingShares.length > 0) {
        return { 
          available: false, 
          conflictType: 'parking_share', 
          reasons: ['You have shared this spot during the requested time.'] 
        };
      }
      // Owner can use their un-shared spot
    } else {
      // Non-owner requesting an assigned spot. Must be fully covered by a single share.
      const coveringShare = overlappingShares.find(s => 
        new Date(s.startTime) <= reqStart && new Date(s.endTime) >= reqEnd
      );

      if (!coveringShare) {
        return { 
          available: false, 
          conflictType: 'assigned', 
          reasons: ['This spot is assigned to another resident and not shared for this full period.'] 
        };
      }
      isShareProvidingAvailability = true;
    }
  } else if (spot.status === 'available' || spot.status === 'reserved') {
    // If it's a standard available spot, check if there's any stray share blocking it (rare but possible if status got out of sync)
    const blockingShares = await ParkingShare.find({
      parkingSpot: spot._id,
      status: 'active',
      $or: [
        { startTime: { $lt: reqEnd }, endTime: { $gt: reqStart } }
      ]
    });
    if (blockingShares.length > 0 && requesterId && blockingShares.some(s => s.owner.toString() === requesterId.toString())) {
       return { available: false, conflictType: 'parking_share', reasons: ['You have shared this spot during the requested time.'] };
    }
  }

  // 3. Check Reservations
  const overlappingReservations = await Reservation.find({
    parkingSpot: spot._id,
    status: { $in: ['pending', 'approved', 'active'] },
    $or: [
      { startTime: { $lt: reqEnd }, endTime: { $gt: reqStart } }
    ]
  });

  if (overlappingReservations.length > 0) {
    return { 
      available: false, 
      conflictType: 'reservation', 
      conflicts: overlappingReservations,
      reasons: ['Overlapping reservation exists for this time.'] 
    };
  }

  // 4. Check Vehicle Compatibility (if provided)
  if (vehicleId && requesterId) {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: requesterId, isActive: true });
    if (!vehicle) {
      return { available: false, conflictType: 'invalid_vehicle', reasons: ['Vehicle not found or unauthorized'] };
    }

    const vType = vehicle.vehicleType.toLowerCase();
    const sType = spot.type.toLowerCase();
    let vCompat = false;
    
    if (vType === 'car') {
      if (['standard', 'large', 'accessible'].includes(sType)) vCompat = true;
    } else if (vType === 'motorcycle' || vType === 'scooter') {
      if (['standard', 'compact', 'motorcycle'].includes(sType)) vCompat = true;
    } else {
      vCompat = true;
    }

    if (!vCompat) {
      return { 
        available: false, 
        conflictType: 'vehicle_incompatible', 
        reasons: [`Spot type '${spot.type}' is not suitable for vehicle type '${vehicle.vehicleType}'.`] 
      };
    }
  }

  // Next available calculation logic (optional lightweight)
  // If we made it here, it's available
  return {
    available: true,
    status: spot.status,
    conflictType: 'none',
    parkingSpot: spot,
    reasons: ['Available for requested time']
  };
};

const getAvailableParkingSpots = async (startTime, endTime, requesterId = null, vehicleId = null) => {
  // Broad filter first
  const spots = await ParkingSpot.find({ isActive: true, status: { $ne: 'maintenance' } });
  
  const results = [];
  for (const spot of spots) {
    // Light weight checks
    const avail = await checkSpotAvailability(spot._id, startTime, endTime, requesterId, vehicleId);
    if (avail.available) {
      results.push(avail);
    }
  }
  return results;
};

module.exports = {
  checkSpotAvailability,
  getAvailableParkingSpots
};
