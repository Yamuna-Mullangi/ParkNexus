const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const Visitor = require('../models/Visitor');
const GateEntry = require('../models/GateEntry');
const mongoose = require('mongoose');

const getOverview = async (days = 7) => {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Parking Overview
  const parkingStats = await ParkingSpot.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } }
      }
    }
  ]);
  const overview = parkingStats[0] || { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0, assigned: 0 };
  const activeForUtilization = overview.total - overview.maintenance;
  const utilization = {
    rate: activeForUtilization > 0 ? Math.round((overview.occupied / activeForUtilization) * 100) : 0
  };

  // 2. Zone Utilization
  const zoneStats = await ParkingSpot.aggregate([
    { $match: { isActive: true, status: { $ne: 'maintenance' } } },
    {
      $group: {
        _id: '$zone',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const zones = zoneStats.map(z => ({
    name: z._id || 'Unassigned',
    rate: z.total > 0 ? Math.round((z.occupied / z.total) * 100) : 0
  }));

  // 3. Reservations Overview
  const resStats = await Reservation.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        today: { $sum: { $cond: [{ $gte: ['$createdAt', todayStart] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
      }
    }
  ]);
  const reservations = resStats[0] || { total: 0, today: 0, active: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, expired: 0, rejected: 0 };

  // 4. Visitors & Gate Overview
  const visitorsToday = await Visitor.countDocuments({ createdAt: { $gte: todayStart } });
  
  const gateStats = await GateEntry.aggregate([
    { $match: { createdAt: { $gte: todayStart } } },
    {
      $group: {
        _id: null,
        entriesToday: { $sum: { $cond: [{ $eq: ['$status', 'checked_in'] }, 1, 0] } },
        exitsToday: { $sum: { $cond: [{ $eq: ['$status', 'checked_out'] }, 1, 0] } },
        deniedToday: { $sum: { $cond: [{ $eq: ['$status', 'denied'] }, 1, 0] } }
      }
    }
  ]);
  const gate = gateStats[0] || { entriesToday: 0, exitsToday: 0, deniedToday: 0 };
  
  // Currently inside: based on gate entries that haven't exited
  const currentlyInside = await GateEntry.countDocuments({ status: 'checked_in' });

  // 5. Reservation Trends (by day)
  const trends = await Reservation.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 6. User Stats
  const User = require('../models/User');
  const userStats = await User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        residents: { $sum: { $cond: [{ $eq: ['$role', 'resident'] }, 1, 0] } },
        security: { $sum: { $cond: [{ $eq: ['$role', 'security'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } }
      }
    }
  ]);
  const users = userStats[0] || { total: 0, residents: 0, security: 0, admins: 0, active: 0, inactive: 0 };

  // 7. Attention Panel Data
  const overdueVisitors = await GateEntry.countDocuments({ status: 'checked_in', expectedExitTime: { $lt: now } });

  return {
    overview,
    utilization,
    zones,
    reservations,
    visitors: {
      today: visitorsToday,
      currentlyInside,
      overdue: overdueVisitors
    },
    users,
    gate,
    trends: trends.map(t => ({ date: t._id, reservations: t.count }))
  };
};

module.exports = {
  getOverview
};
