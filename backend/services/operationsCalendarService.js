const Reservation = require('../models/Reservation');
const Visitor = require('../models/Visitor');
const VisitorPass = require('../models/VisitorPass');
const GateEntry = require('../models/GateEntry');
const ParkingShare = require('../models/ParkingShare');

const getCalendarEvents = async ({ user, role, startDate, endDate, types }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date parameters');
  }

  // Ensure reasonable date range (e.g., max 60 days)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 60) {
    throw new Error('Date range exceeds maximum allowed limit of 60 days');
  }

  const allowedTypes = types ? types.split(',') : ['reservation', 'visitor', 'visitorPass', 'gateEntry', 'parkingShare'];
  let events = [];

  // Resident role isolation
  const isResident = role === 'resident';
  const isSecurity = role === 'security';
  const isAdmin = role === 'admin';

  if (allowedTypes.includes('reservation') && !isSecurity) {
    const query = {
      startTime: { $lte: end },
      endTime: { $gte: start },
    };
    if (isResident) query.user = user;

    const reservations = await Reservation.find(query)
      .populate('parkingSpot')
      .populate('vehicle');

    reservations.forEach(res => {
      events.push({
        id: res._id,
        type: 'reservation',
        title: `Reservation: Spot ${res.parkingSpot?.spotNumber}`,
        startTime: res.startTime,
        endTime: res.endTime,
        status: res.status,
        relatedEntityId: res._id,
        relatedEntityType: 'Reservation',
        parkingSpot: res.parkingSpot,
        metadata: { vehicle: res.vehicle }
      });
    });
  }

  if (allowedTypes.includes('visitor')) {
    const query = {
      expectedArrival: { $lte: end },
      expectedDeparture: { $gte: start },
    };
    if (isResident) query.resident = user;

    const visitors = await Visitor.find(query).populate('resident');

    visitors.forEach(v => {
      events.push({
        id: v._id,
        type: 'visitor',
        title: `Visitor: ${v.fullName}`,
        startTime: v.expectedArrival,
        endTime: v.expectedDeparture,
        status: v.status,
        relatedEntityId: v._id,
        relatedEntityType: 'Visitor',
        visitor: v,
        metadata: { resident: v.resident?.name, visitorType: v.visitorType }
      });
    });
  }

  if (allowedTypes.includes('visitorPass') && !isSecurity) {
    const query = {
      validFrom: { $lte: end },
      validUntil: { $gte: start },
    };
    // To filter visitor passes for a resident, we first need their visitors
    let passQuery = query;
    if (isResident) {
      const myVisitors = await Visitor.find({ resident: user }).select('_id');
      passQuery.visitor = { $in: myVisitors.map(v => v._id) };
    }

    const passes = await VisitorPass.find(passQuery).populate('visitor');

    passes.forEach(p => {
      if (!p.visitor) return;
      events.push({
        id: p._id,
        type: 'visitorPass',
        title: `Pass: ${p.visitor.fullName}`,
        startTime: p.validFrom,
        endTime: p.validUntil,
        status: p.status,
        relatedEntityId: p._id,
        relatedEntityType: 'VisitorPass',
        visitor: p.visitor,
        metadata: { accessLevel: p.accessLevel }
      });
    });
  }

  if (allowedTypes.includes('gateEntry') && !isResident) {
    const query = {
      entryTime: { $lte: end, $gte: start }
    };
    const gateEntries = await GateEntry.find(query).populate('visitor').populate('securityPersonnel');

    gateEntries.forEach(g => {
      events.push({
        id: g._id,
        type: 'gateEntry',
        title: `Gate Activity: ${g.visitor?.fullName || 'Unknown'}`,
        startTime: g.entryTime,
        endTime: g.exitTime || new Date(g.entryTime.getTime() + 60 * 60 * 1000), // Default 1 hour block if no exit
        status: g.status,
        relatedEntityId: g._id,
        relatedEntityType: 'GateEntry',
        visitor: g.visitor,
        metadata: { security: g.securityPersonnel?.name, gate: g.gateAssigned }
      });
    });
  }

  if (allowedTypes.includes('parkingShare') && !isSecurity) {
    const query = {
      startTime: { $lte: end },
      endTime: { $gte: start },
    };
    if (isResident) query.owner = user;

    const shares = await ParkingShare.find(query).populate('parkingSpot');

    shares.forEach(s => {
      events.push({
        id: s._id,
        type: 'parkingShare',
        title: `Share: Spot ${s.parkingSpot?.spotNumber}`,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        relatedEntityId: s._id,
        relatedEntityType: 'ParkingShare',
        parkingSpot: s.parkingSpot,
        metadata: {}
      });
    });
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return events;
};

module.exports = {
  getCalendarEvents
};
