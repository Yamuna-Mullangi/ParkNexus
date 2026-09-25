const GateEntry = require('../models/GateEntry');
const Visitor = require('../models/Visitor');
const VisitorPass = require('../models/VisitorPass');
const ParkingSpot = require('../models/ParkingSpot');
const visitorPassService = require('../services/visitorPassService');
const { createAndEmitNotification, emitToRoom } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

const checkInVisitor = async (req, res) => {
  try {
    const { passToken, parkingSpotId, expectedExitTime, notes, gate } = req.body;
    
    // Validate pass via service logic
    const validation = await visitorPassService.validatePass(passToken);
    
    if (!validation.valid) {
      // Record denied entry
      if (validation.passDetails) {
        const deniedEntry = await GateEntry.create({
          visitor: validation.passDetails.visitor._id,
          visitorPass: validation.passDetails._id,
          resident: validation.passDetails.issuedBy._id,
          securityUser: req.user._id,
          entryTime: new Date(),
          expectedExitTime: new Date(),
          entryGate: gate || 'Main Gate',
          status: 'denied',
          notes: `Denied: ${validation.reason} ${notes ? '- ' + notes : ''}`
        });
        
        await logActivity({
          actor: req.user._id,
          action: 'VISITOR_ENTRY_DENIED',
          entityType: 'GateEntry',
          entityId: deniedEntry._id,
          description: `Visitor entry denied: ${validation.reason}`,
          ipAddress: req.ip
        });
        
        emitToRoom('role:security', 'gate:updated', deniedEntry);
      }
      return res.status(400).json({ success: false, error: validation.reason, isDenied: true });
    }
    
    const pass = validation.passDetails;
    const visitor = pass.visitor;
    
    if (visitor.status === 'inside' || visitor.currentGateEntry) {
      return res.status(400).json({ success: false, error: 'Visitor is already checked in.' });
    }
    
    // Assign parking spot if provided
    let assignedSpot = null;
    if (parkingSpotId) {
      const { getSettings } = require('../services/systemSettingService');
      const settings = await getSettings();
      if (!settings.visitorSettings.allowVisitorParking || !settings.parkingSettings.allowVisitorParking) {
        return res.status(400).json({ success: false, error: 'Visitor parking is currently disabled by administration.' });
      }

      const spot = await ParkingSpot.findById(parkingSpotId);
      if (!spot) {
        return res.status(400).json({ success: false, error: 'Parking spot not found.' });
      }
      if (spot.status === 'occupied') {
        return res.status(400).json({ success: false, error: 'Parking spot is already occupied.' });
      }
      // Assuming visitor parking spots can be occupied
      spot.status = 'occupied';
      await spot.save();
      assignedSpot = spot._id;
      // Emit parking update
      emitToRoom('role:admin', 'parking:updated', spot);
      emitToRoom('role:resident', 'parking:updated', spot);
    }
    
    // Create successful gate entry
    const entryTime = new Date();
    const expExit = expectedExitTime ? new Date(expectedExitTime) : pass.validUntil;
    
    const gateEntry = await GateEntry.create({
      visitor: visitor._id,
      visitorPass: pass._id,
      resident: pass.issuedBy._id,
      securityUser: req.user._id,
      parkingSpot: assignedSpot,
      vehicle: visitor.vehicle ? visitor.vehicle._id : null,
      entryTime: entryTime,
      expectedExitTime: expExit,
      entryGate: gate || 'Main Gate',
      status: 'checked_in',
      notes: notes || ''
    });
    
    // Update visitor pass
    await VisitorPass.findByIdAndUpdate(pass._id, { status: 'used', used: true });
    
    // Update visitor
    await Visitor.findByIdAndUpdate(visitor._id, { 
      status: 'inside',
      currentGateEntry: gateEntry._id 
    });
    
    await logActivity({
      actor: req.user._id,
      action: 'VISITOR_CHECKED_IN',
      entityType: 'GateEntry',
      entityId: gateEntry._id,
      description: `Visitor ${visitor.fullName} checked in`,
      ipAddress: req.ip
    });
    
    emitToRoom('role:security', 'gate:updated', gateEntry);
    emitToRoom(`user:${pass.issuedBy._id}`, 'visitor:updated', { visitorId: visitor._id, status: 'inside' });
    
    await createAndEmitNotification({
      recipient: pass.issuedBy._id,
      type: 'VISITOR_CHECKED_IN',
      title: 'Visitor Checked In',
      message: `Your visitor ${visitor.fullName} has checked in.`,
      relatedEntity: gateEntry._id,
      relatedEntityType: 'GateEntry'
    });
    
    res.status(201).json({ success: true, data: gateEntry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const checkOutVisitor = async (req, res) => {
  try {
    const gateEntry = await GateEntry.findById(req.params.id).populate('parkingSpot').populate('visitor');
    
    if (!gateEntry) {
      return res.status(404).json({ success: false, error: 'Gate entry not found' });
    }
    
    if (gateEntry.status !== 'checked_in') {
      return res.status(400).json({ success: false, error: 'Visitor has already checked out or entry is invalid.' });
    }
    
    const actualExitTime = new Date();
    gateEntry.actualExitTime = actualExitTime;
    gateEntry.exitGate = req.body.gate || 'Main Gate';
    gateEntry.status = 'checked_out';
    if (req.body.notes) {
      gateEntry.notes = gateEntry.notes ? `${gateEntry.notes}\nCheckout: ${req.body.notes}` : `Checkout: ${req.body.notes}`;
    }
    await gateEntry.save();
    
    // Release parking spot
    if (gateEntry.parkingSpot) {
      const spot = await ParkingSpot.findById(gateEntry.parkingSpot._id);
      if (spot) {
        spot.status = spot.assignedTo ? 'assigned' : 'available';
        await spot.save();
        emitToRoom('role:admin', 'parking:updated', spot);
        emitToRoom('role:resident', 'parking:updated', spot);
      }
    }
    
    // Update visitor status
    await Visitor.findByIdAndUpdate(gateEntry.visitor._id, {
      status: 'completed'
    });
    
    await logActivity({
      actor: req.user._id,
      action: 'VISITOR_CHECKED_OUT',
      entityType: 'GateEntry',
      entityId: gateEntry._id,
      description: `Visitor checked out`,
      ipAddress: req.ip
    });
    
    emitToRoom('role:security', 'gate:updated', gateEntry);
    emitToRoom(`user:${gateEntry.resident}`, 'visitor:updated', { visitorId: gateEntry.visitor._id, status: 'completed' });
    
    await createAndEmitNotification({
      recipient: gateEntry.resident,
      type: 'VISITOR_CHECKED_OUT',
      title: 'Visitor Checked Out',
      message: `Your visitor ${gateEntry.visitor.fullName} has checked out.`,
      relatedEntity: gateEntry._id,
      relatedEntityType: 'GateEntry'
    });
    
    res.status(200).json({ success: true, data: gateEntry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getActiveVisitors = async (req, res) => {
  try {
    const activeEntries = await GateEntry.find({ status: 'checked_in' })
      .populate('visitor')
      .populate({ path: 'resident', select: 'name email phone' })
      .populate('parkingSpot')
      .populate('vehicle')
      .sort({ entryTime: -1 });
      
    res.status(200).json({ success: true, data: activeEntries });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getTodayGateEntries = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await GateEntry.find({ entryTime: { $gte: today } })
      .populate('visitor')
      .populate({ path: 'resident', select: 'name email phone' })
      .populate('parkingSpot')
      .sort({ entryTime: -1 });
      
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getGateHistory = async (req, res) => {
  try {
    const { paginateAndSort } = require('../utils/dbUtils');
    const { getDateRangeQuery } = require('../utils/dateUtils');
    const User = require('../models/User');
    const Visitor = require('../models/Visitor');
    
    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.visitorId) {
      query.visitor = req.query.visitorId;
    }
    if (req.query.residentId) {
      query.resident = req.query.residentId;
    }
    
    if (req.query.dateRange && req.query.dateRange !== 'All Time') {
      Object.assign(query, getDateRangeQuery(req.query.dateRange, 'entryTime'));
    }

    if (req.query.search) {
      // Find matching users and visitors
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      const [users, visitors] = await Promise.all([
        User.find({ name: searchRegex }).select('_id'),
        Visitor.find({ fullName: searchRegex }).select('_id')
      ]);
      const userIds = users.map(u => u._id);
      const visitorIds = visitors.map(v => v._id);
      
      query.$or = [
        { resident: { $in: userIds } },
        { visitor: { $in: visitorIds } }
      ];
    }
    
    const filters = {
      ...req.query,
      allowedSortFields: ['entryTime', 'actualExitTime', 'createdAt', 'status']
    };
    
    const result = await paginateAndSort(GateEntry, query, filters, [
      'visitor',
      { path: 'resident', select: 'name email phone' },
      { path: 'securityUser', select: 'name' },
      'parkingSpot'
    ]);
      
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getGateEntry = async (req, res) => {
  try {
    const entry = await GateEntry.findById(req.params.id)
      .populate('visitor')
      .populate({ path: 'resident', select: 'name email phone' })
      .populate({ path: 'securityUser', select: 'name' })
      .populate('parkingSpot')
      .populate('vehicle');
      
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Gate entry not found' });
    }
    
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getVisitorGateStatus = async (req, res) => {
  try {
    const entry = await GateEntry.findOne({ visitor: req.params.visitorId })
      .populate('parkingSpot')
      .sort({ entryTime: -1 });
      
    // A resident can only see their own visitor's status
    if (entry && entry.resident.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'security') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkInVisitor,
  checkOutVisitor,
  getActiveVisitors,
  getTodayGateEntries,
  getGateHistory,
  getGateEntry,
  getVisitorGateStatus
};
