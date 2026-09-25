const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const ParkingShare = require('../models/ParkingShare');
const { checkReservationConflict } = require('./reservationService');

const getRecommendations = async (params) => {
  const {
    user,
    startTime,
    endTime,
    vehicleId,
    preferredZone,
    preferredBlock,
    preferredFloor,
    preferredType,
    accessibilityRequired,
    limit = 5
  } = params;

  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Start time must be before end time');
  }
  if (new Date(startTime) < new Date()) {
    throw new Error('Start time cannot be in the past');
  }

  const { getSettings } = require('./systemSettingService');
  const settings = await getSettings();
  const recSettings = settings.recommendationSettings;

  if (!recSettings.recommendationsEnabled) {
    return []; // Return empty array if disabled
  }

  const safeLimit = Math.min(parseInt(limit, 10) || 5, recSettings.maxRecommendations);

  // Fetch preferences
  const UserPreference = require('../models/UserPreference');
  const prefs = await UserPreference.findOne({ user });

  // Merge preferences if not explicitly overridden by params
  const finalZone = preferredZone || prefs?.preferredZone;
  const finalBlock = preferredBlock || prefs?.preferredBlock;
  const finalFloor = preferredFloor || prefs?.preferredFloor;
  const finalType = preferredType || prefs?.preferredParkingType;
  
  // Use preference vehicle if not explicitly provided
  const finalVehicleId = vehicleId || (prefs?.preferredVehicle ? prefs.preferredVehicle.toString() : null);

  // 1. Fetch user's vehicle details if vehicleId provided
  let vehicle = null;
  if (finalVehicleId) {
    vehicle = await Vehicle.findOne({ _id: finalVehicleId, owner: user, isActive: true });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');
  }

  // 2. Fetch all active and non-maintenance spots
  const standardAvailableSpots = await ParkingSpot.find({
    isActive: true,
    status: { $in: ['available'] }
  });

  const activeShares = await ParkingShare.find({
    status: 'active',
    startTime: { $lte: new Date(startTime) },
    endTime: { $gte: new Date(endTime) }
  }).populate('parkingSpot');

  const sharedSpots = activeShares.map(share => share.parkingSpot).filter(spot => spot && spot.isActive);

  // Combine unique spots
  const spotMap = new Map();
  standardAvailableSpots.forEach(s => spotMap.set(s._id.toString(), s));
  sharedSpots.forEach(s => spotMap.set(s._id.toString(), s));
  
  const candidateSpots = Array.from(spotMap.values());

  // Fetch user favorites and recent views
  const FavoriteParking = require('../models/FavoriteParking');
  const RecentParkingView = require('../models/RecentParkingView');
  
  const [userFavorites, userRecents] = await Promise.all([
    FavoriteParking.find({ user }).populate('parkingSpot'),
    RecentParkingView.find({ user }).populate('parkingSpot')
  ]);

  const favoriteSpotIds = new Set(userFavorites.map(f => f.parkingSpot?._id.toString()));
  const favoriteZones = new Set(userFavorites.map(f => f.parkingSpot?.zone).filter(Boolean));
  const favoriteBlocks = new Set(userFavorites.map(f => f.parkingSpot?.block).filter(Boolean));
  const recentSpotIds = new Set(userRecents.map(r => r.parkingSpot?._id.toString()));

  // 3. Score and Filter candidates
  const scoredSpots = [];

  for (const spot of candidateSpots) {
    // Check Unified Availability
    const { checkSpotAvailability } = require('./parkingAvailabilityService');
    const availability = await checkSpotAvailability(spot._id, startTime, endTime, user, vehicle?._id);
    if (!availability.available) continue;

    let score = 30; // Base score for availability
    const reasons = ['Available for your requested time'];
    let isCompatible = true;

    // Accessibility
    if (accessibilityRequired === 'true' || accessibilityRequired === true) {
      if (spot.type === 'accessible') {
        score += 20;
        reasons.push('Meets accessibility requirements');
      } else {
        score -= 10;
      }
    } else if (spot.type === 'accessible') {
      score -= 15;
    }

    // Vehicle compatibility is now checked in unified availability, but we keep the scoring bonuses here
    if (vehicle) {
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

      if (vCompat) {
        score += 25;
        reasons.push('Suitable for your vehicle');
      }
    } else {
      score += 15;
    }

    // Explicit Preferences
    if (finalZone && spot.zone === finalZone) {
      score += 15;
      reasons.push(`Matches preferred zone (${spot.zone})`);
    }
    if (finalBlock && spot.block === finalBlock) {
      score += 10;
      reasons.push(`Matches preferred block (${spot.block})`);
    }
    if (finalFloor && spot.floor === finalFloor) {
      score += 5;
      reasons.push(`Matches preferred floor (${spot.floor})`);
    }
    if (finalType && spot.type === finalType) {
      score += 10;
      reasons.push(`Matches preferred parking type (${spot.type})`);
    }

    // Phase 19: Favorite Signals
    const spotIdStr = spot._id.toString();
    if (favoriteSpotIds.has(spotIdStr)) {
      score += 15;
      reasons.push('Favorite parking location');
    } else if (favoriteZones.has(spot.zone)) {
      score += 5;
      reasons.push('In a favorite zone');
    } else if (favoriteBlocks.has(spot.block)) {
      score += 5;
      reasons.push('In a favorite block');
    }

    // Phase 19: Recent View Signal
    if (recentSpotIds.has(spotIdStr)) {
      score += 5;
      reasons.push('Recently viewed location');
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, score));

    scoredSpots.push({
      spot,
      score: finalScore,
      reasons,
      availability: true,
      compatibility: true
    });
  }

  // 4. Sort and return top-K
  scoredSpots.sort((a, b) => b.score - a.score);
  
  return scoredSpots.slice(0, safeLimit);
};

module.exports = {
  getRecommendations
};
