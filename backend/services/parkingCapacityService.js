const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const GateEntry = require('../models/GateEntry');

const getGlobalCapacity = async (filters = {}) => {
  const matchQuery = { isActive: true };
  
  if (filters.zone) matchQuery.zone = filters.zone;
  if (filters.block) matchQuery.block = filters.block;
  if (filters.floor) matchQuery.floor = filters.floor;
  if (filters.type) matchQuery.type = filters.type;
  if (filters.status) matchQuery.status = filters.status;

  const result = await ParkingSpot.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalCapacity: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
        visitorCapacity: { $sum: { $cond: [{ $eq: ['$type', 'visitor'] }, 1, 0] } },
        visitorAvailable: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'visitor'] }, { $eq: ['$status', 'available'] }] }, 1, 0] } },
        visitorOccupied: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'visitor'] }, { $eq: ['$status', 'occupied'] }] }, 1, 0] } }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      totalCapacity: 0,
      usableCapacity: 0,
      available: 0,
      occupied: 0,
      reserved: 0,
      assigned: 0,
      maintenance: 0,
      occupancyRate: 0,
      visitorCapacity: 0,
      visitorAvailable: 0,
      visitorOccupied: 0
    };
  }

  const data = result[0];
  const usableCapacity = data.totalCapacity - data.maintenance;
  
  // Calculate occupancy based on spots that are currently occupied, assigned or reserved (if reserved implies unavailable)
  // According to standard logic: occupied is what actually is physically filled.
  const occupancyRate = usableCapacity > 0 ? ((data.occupied + data.assigned) / usableCapacity) * 100 : 0;

  return {
    totalCapacity: data.totalCapacity,
    usableCapacity,
    available: data.available,
    occupied: data.occupied,
    reserved: data.reserved,
    assigned: data.assigned,
    maintenance: data.maintenance,
    occupancyRate: Math.round(occupancyRate * 100) / 100, // round to 2 decimal places
    visitorCapacity: data.visitorCapacity,
    visitorAvailable: data.visitorAvailable,
    visitorOccupied: data.visitorOccupied
  };
};

const getCapacityBreakdown = async (groupBy, filters = {}) => {
  const matchQuery = { isActive: true };

  if (filters.zone) matchQuery.zone = filters.zone;
  if (filters.block) matchQuery.block = filters.block;
  if (filters.floor) matchQuery.floor = filters.floor;
  if (filters.type) matchQuery.type = filters.type;

  // valid groupBys: 'zone', 'block', 'floor', 'type'
  let groupStage = { _id: `$${groupBy}` };
  if (groupBy === 'block') {
    groupStage = { _id: { zone: '$zone', block: '$block' } }; // Block usually makes sense within a zone
  }

  const result = await ParkingSpot.aggregate([
    { $match: matchQuery },
    {
      $group: {
        ...groupStage,
        totalCapacity: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return result.map(item => {
    const usableCapacity = item.totalCapacity - item.maintenance;
    const occupancyRate = usableCapacity > 0 ? ((item.occupied + item.assigned) / usableCapacity) * 100 : 0;
    
    // Formatting ID based on grouping
    let name = item._id;
    if (groupBy === 'block' && item._id) {
      name = `${item._id.zone} / ${item._id.block}`;
    } else if (!name) {
      name = 'Unspecified';
    }

    return {
      group: name,
      totalCapacity: item.totalCapacity,
      usableCapacity,
      available: item.available,
      occupied: item.occupied,
      reserved: item.reserved,
      assigned: item.assigned,
      maintenance: item.maintenance,
      occupancyRate: Math.round(occupancyRate * 100) / 100
    };
  });
};

module.exports = {
  getGlobalCapacity,
  getCapacityBreakdown
};
