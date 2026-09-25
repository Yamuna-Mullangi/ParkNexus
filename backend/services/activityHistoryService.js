const Reservation = require('../models/Reservation');
const Visitor = require('../models/Visitor');
const VisitorPass = require('../models/VisitorPass');
const GateEntry = require('../models/GateEntry');
const ParkingShare = require('../models/ParkingShare');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const { getDateRangeQuery } = require('../utils/dateUtils');

const getUserActivityHistory = async ({ user, role, filters = {} }) => {
  const { 
    page = 1, 
    limit = 10, 
    type = 'all', 
    status = 'all',
    startDate,
    endDate,
    search = ''
  } = filters;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const fetchLimit = (pageNum - 1) * limitNum + limitNum;

  // Build base queries per collection
  let queries = {
    reservation: {},
    visitor: {},
    visitorPass: {},
    gateEntry: {},
    parkingShare: {},
    notification: {},
    activityLog: {}
  };

  // 1. Role-based isolation
  if (role === 'resident') {
    queries.reservation.user = user;
    queries.visitor.resident = user;
    // VisitorPass and GateEntry require populated visitor logic, handled via aggregate or post-filter.
    // For simplicity, we first find resident's visitors:
    const myVisitors = await Visitor.find({ resident: user }).select('_id');
    const myVisitorIds = myVisitors.map(v => v._id);
    queries.visitorPass.visitor = { $in: myVisitorIds };
    queries.gateEntry.visitor = { $in: myVisitorIds };
    queries.parkingShare.owner = user;
    queries.notification.user = user;
    queries.activityLog = null; // Residents don't see system activity logs
  } else if (role === 'security') {
    // Security sees all visitors, passes, gates, but not reservations/shares/notifications
    queries.reservation = null;
    queries.parkingShare = null;
    queries.notification = null;
    queries.activityLog = null;
  } else if (role === 'admin') {
    // Admin sees everything
  }

  // 2. Date Filtering
  const dateQuery = {};
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      dateQuery.$gte = s;
      dateQuery.$lte = e;
    }
  } else if (filters.dateRange && filters.dateRange !== 'All Time') {
    Object.assign(dateQuery, getDateRangeQuery(filters.dateRange, 'createdAt').createdAt);
  }

  const applyDate = (q) => {
    if (q && Object.keys(dateQuery).length > 0) {
      q.createdAt = { ...q.createdAt, ...dateQuery };
    }
  };
  Object.values(queries).forEach(applyDate);

  // 3. Status Filtering
  if (status && status !== 'all') {
    if (queries.reservation) queries.reservation.status = status;
    if (queries.visitor) queries.visitor.status = status;
    if (queries.visitorPass) queries.visitorPass.status = status;
    if (queries.gateEntry) queries.gateEntry.status = status;
    if (queries.parkingShare) queries.parkingShare.status = status;
    // notification and activityLog don't have standard status matching
  }

  // 4. Type filtering
  const allowedTypes = type !== 'all' ? type.split(',') : ['reservation', 'visitor', 'visitorPass', 'gateEntry', 'parkingShare', 'notification', 'activityLog'];

  let allActivities = [];

  const fetchPromises = [];

  // Reservations
  if (queries.reservation && allowedTypes.includes('reservation')) {
    fetchPromises.push(
      Reservation.find(queries.reservation)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate('parkingSpot', 'spotNumber zone block floor')
        .populate('vehicle', 'registrationNumber make model')
        .then(res => res.map(r => ({
          id: r._id,
          type: 'reservation',
          title: `Reservation ${r.status}`,
          description: `Spot ${r.parkingSpot?.spotNumber || 'Unknown'} from ${new Date(r.startTime).toLocaleString()} to ${new Date(r.endTime).toLocaleString()}`,
          timestamp: r.createdAt,
          status: r.status,
          relatedEntityId: r._id,
          relatedEntityType: 'Reservation',
          parkingSpot: r.parkingSpot,
          metadata: { vehicle: r.vehicle }
        })))
    );
  }

  // Visitors
  if (queries.visitor && allowedTypes.includes('visitor')) {
    fetchPromises.push(
      Visitor.find(queries.visitor)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .then(res => res.map(v => ({
          id: v._id,
          type: 'visitor',
          title: `Visitor Registered`,
          description: `${v.fullName} expected on ${new Date(v.expectedArrival).toLocaleDateString()}`,
          timestamp: v.createdAt,
          status: v.status,
          relatedEntityId: v._id,
          relatedEntityType: 'Visitor',
          metadata: { visitorName: v.fullName, purpose: v.purpose }
        })))
    );
  }

  // Gate Entry
  if (queries.gateEntry && allowedTypes.includes('gateEntry')) {
    fetchPromises.push(
      GateEntry.find(queries.gateEntry)
        .sort({ entryTime: -1 }) // Gate entries are better sorted by entryTime
        .limit(fetchLimit)
        .populate('visitor', 'fullName')
        .populate('gateAssigned')
        .then(res => res.map(g => ({
          id: g._id,
          type: 'gateEntry',
          title: `Gate Activity`,
          description: `${g.visitor?.fullName || 'Unknown'} at Gate ${g.gateAssigned?.name || 'Unknown'}`,
          timestamp: g.entryTime || g.createdAt,
          status: g.status,
          relatedEntityId: g._id,
          relatedEntityType: 'GateEntry',
          metadata: { exitTime: g.exitTime, checkInMethod: g.checkInMethod }
        })))
    );
  }

  // Parking Share
  if (queries.parkingShare && allowedTypes.includes('parkingShare')) {
    fetchPromises.push(
      ParkingShare.find(queries.parkingShare)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate('parkingSpot', 'spotNumber')
        .then(res => res.map(p => ({
          id: p._id,
          type: 'parkingShare',
          title: `Parking Shared`,
          description: `Spot ${p.parkingSpot?.spotNumber || 'Unknown'} shared from ${new Date(p.startTime).toLocaleDateString()}`,
          timestamp: p.createdAt,
          status: p.status,
          relatedEntityId: p._id,
          relatedEntityType: 'ParkingShare',
          parkingSpot: p.parkingSpot
        })))
    );
  }

  // Notifications
  if (queries.notification && allowedTypes.includes('notification')) {
    fetchPromises.push(
      Notification.find(queries.notification)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .then(res => res.map(n => ({
          id: n._id,
          type: 'notification',
          title: n.title,
          description: n.message,
          timestamp: n.createdAt,
          status: n.isRead ? 'read' : 'unread',
          relatedEntityId: n._id,
          relatedEntityType: 'Notification'
        })))
    );
  }

  // ActivityLogs (Admin only typically)
  if (queries.activityLog && allowedTypes.includes('activityLog')) {
    fetchPromises.push(
      ActivityLog.find(queries.activityLog)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate('user', 'name email')
        .then(res => res.map(a => ({
          id: a._id,
          type: 'activityLog',
          title: `Audit: ${a.action}`,
          description: `By ${a.user?.name || 'System'} on ${a.entityType}`,
          timestamp: a.createdAt,
          status: 'logged',
          relatedEntityId: a.entityId,
          relatedEntityType: a.entityType
        })))
    );
  }

  const results = await Promise.all(fetchPromises);
  results.forEach(arr => {
    allActivities = allActivities.concat(arr);
  });

  // Client-side search (fallback for complex multi-collection text search)
  if (search) {
    const s = search.toLowerCase();
    allActivities = allActivities.filter(a => 
      (a.title && a.title.toLowerCase().includes(s)) || 
      (a.description && a.description.toLowerCase().includes(s)) ||
      (a.parkingSpot && a.parkingSpot.spotNumber && a.parkingSpot.spotNumber.toLowerCase().includes(s)) ||
      (a.metadata?.visitorName && a.metadata.visitorName.toLowerCase().includes(s))
    );
  }

  // Sort by timestamp descending
  allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination slice
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedItems = allActivities.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      total: allActivities.length, // Note: This is total fetched, not absolute total in DB. Good enough for continuous scroll / Next page if length == limit.
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(allActivities.length / limitNum)
    }
  };
};

const getUserActivitySummary = async ({ user, role }) => {
  const summary = {};

  if (role === 'resident') {
    summary.reservations = await Reservation.countDocuments({ user });
    summary.parkingShares = await ParkingShare.countDocuments({ owner: user });
    summary.visitors = await Visitor.countDocuments({ resident: user });
    summary.notifications = await Notification.countDocuments({ user, isRead: false });
  } else if (role === 'security') {
    const today = new Date();
    today.setHours(0,0,0,0);
    summary.entriesToday = await GateEntry.countDocuments({ entryTime: { $gte: today } });
    summary.activeVisitors = await GateEntry.countDocuments({ status: 'entered' });
    summary.denied = await GateEntry.countDocuments({ status: 'denied', entryTime: { $gte: today } });
  } else if (role === 'admin') {
    summary.totalReservations = await Reservation.countDocuments();
    summary.totalVisitors = await Visitor.countDocuments();
    summary.activeShares = await ParkingShare.countDocuments({ status: 'active' });
    summary.auditLogs = await ActivityLog.countDocuments();
  }

  return summary;
};

module.exports = {
  getUserActivityHistory,
  getUserActivitySummary
};
