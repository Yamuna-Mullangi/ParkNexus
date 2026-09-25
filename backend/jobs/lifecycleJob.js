const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const ParkingShare = require('../models/ParkingShare');
const ShareRequest = require('../models/ShareRequest');
const VisitorPass = require('../models/VisitorPass');
const Visitor = require('../models/Visitor');
const GateEntry = require('../models/GateEntry');
const ParkingSpot = require('../models/ParkingSpot');
const { createAndEmitNotification, emitToRoom } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

let isRunning = false;

const runLifecycleTasks = async () => {
  if (isRunning) return;
  isRunning = true;
  
  try {
    const now = new Date();
    
    // ----------------------------------------------------
    // 1. RESERVATIONS
    // ----------------------------------------------------
    
    // 1a. Approved -> Active (Start time reached)
    const startingReservations = await Reservation.find({
      status: 'approved',
      startTime: { $lte: now },
      endTime: { $gt: now }
    }).populate('parkingSpot');

    for (const res of startingReservations) {
      res.status = 'active';
      await res.save();
      
      // Update parking spot status to reserved
      await ParkingSpot.findByIdAndUpdate(res.parkingSpot._id, { status: 'reserved' });
      
      await createAndEmitNotification({
        recipient: res.user,
        type: 'RESERVATION_STARTED',
        title: 'Reservation Active',
        message: `Your parking reservation for ${res.parkingSpot.spotNumber} is now active.`,
        relatedEntity: res._id,
        relatedEntityType: 'Reservation'
      });
      
      await logActivity({
        actor: null,
        action: 'RESERVATION_ACTIVATED',
        entityType: 'Reservation',
        entityId: res._id,
        description: `Reservation automatically activated`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`role:admin`, 'reservation:updated', res);
      emitToRoom(`user:${res.user}`, 'reservation:updated', res);
    }
    
    // 1b. Active -> Completed (End time passed)
    const completingReservations = await Reservation.find({
      status: 'active',
      endTime: { $lt: now }
    }).populate('parkingSpot');
    
    for (const res of completingReservations) {
      res.status = 'completed';
      await res.save();
      
      // Release parking spot if it's not assigned to someone or shared actively
      const spot = await ParkingSpot.findById(res.parkingSpot._id);
      if (spot && spot.status === 'reserved') {
        spot.status = spot.assignedTo ? 'assigned' : 'available';
        await spot.save();
        emitToRoom(`role:admin`, 'parking:updated', spot);
      }
      
      await createAndEmitNotification({
        recipient: res.user,
        type: 'RESERVATION_COMPLETED',
        title: 'Reservation Completed',
        message: `Your parking reservation for ${res.parkingSpot.spotNumber} has ended.`,
        relatedEntity: res._id,
        relatedEntityType: 'Reservation'
      });
      
      await logActivity({
        actor: null,
        action: 'RESERVATION_COMPLETED',
        entityType: 'Reservation',
        entityId: res._id,
        description: `Reservation automatically completed after end time`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`role:admin`, 'reservation:updated', res);
      emitToRoom(`user:${res.user}`, 'reservation:updated', res);
    }

    // 1c. Approved -> Expired (Never activated and end time passed)
    const expiringReservations = await Reservation.find({
      status: 'approved',
      endTime: { $lt: now }
    }).populate('parkingSpot');

    for (const res of expiringReservations) {
      res.status = 'expired';
      await res.save();
      
      await createAndEmitNotification({
        recipient: res.user,
        type: 'RESERVATION_EXPIRED',
        title: 'Reservation Expired',
        message: `Your parking reservation for ${res.parkingSpot.spotNumber} has expired.`,
        relatedEntity: res._id,
        relatedEntityType: 'Reservation'
      });
      
      await logActivity({
        actor: null,
        action: 'RESERVATION_EXPIRED',
        entityType: 'Reservation',
        entityId: res._id,
        description: `Reservation automatically expired after end time passed`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`role:admin`, 'reservation:updated', res);
      emitToRoom(`user:${res.user}`, 'reservation:updated', res);
    }

    // ----------------------------------------------------
    // 2. PARKING SHARES & REQUESTS
    // ----------------------------------------------------
    
    const expiringShares = await ParkingShare.find({
      status: 'active',
      endTime: { $lt: now }
    });
    
    for (const share of expiringShares) {
      share.status = 'expired';
      await share.save();
      
      // Expire pending requests for this share
      await ShareRequest.updateMany(
        { parkingShare: share._id, status: 'pending' },
        { $set: { status: 'rejected' } } // Assuming rejected or cancelled is used for non-actionable
      );
      
      await logActivity({
        actor: null,
        action: 'PARKING_SHARE_EXPIRED',
        entityType: 'ParkingShare',
        entityId: share._id,
        description: `Parking share automatically expired`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`role:admin`, 'parking:updated', share); // Simplified event
    }

    // ----------------------------------------------------
    // 3. VISITOR PASSES
    // ----------------------------------------------------
    
    const expiringPasses = await VisitorPass.find({
      status: 'active',
      validUntil: { $lt: now }
    });

    for (const pass of expiringPasses) {
      pass.status = 'expired';
      await pass.save();
      
      await logActivity({
        actor: null,
        action: 'VISITOR_PASS_EXPIRED',
        entityType: 'VisitorPass',
        entityId: pass._id,
        description: `Visitor pass automatically expired`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`user:${pass.issuedBy}`, 'visitor:updated', { passId: pass._id, status: 'expired' });
    }

    // ----------------------------------------------------
    // 4. VISITORS & GATE ENTRIES
    // ----------------------------------------------------
    
    // Upcoming -> Expired (Never checked in, expected departure passed)
    const expiringVisitors = await Visitor.find({
      status: 'upcoming',
      expectedDeparture: { $lt: now }
    });

    for (const visitor of expiringVisitors) {
      visitor.status = 'expired';
      await visitor.save();
      
      await logActivity({
        actor: null,
        action: 'VISITOR_EXPIRED',
        entityType: 'Visitor',
        entityId: visitor._id,
        description: `Upcoming visitor expired automatically`,
        ipAddress: '127.0.0.1'
      });
      
      emitToRoom(`user:${visitor.resident}`, 'visitor:updated', visitor);
    }
    
    // Checked In -> Overdue
    const overdueEntries = await GateEntry.find({
      status: 'checked_in',
      expectedExitTime: { $lt: now },
      overdueNotified: { $ne: true } // Need to make sure we don't spam. Wait, model doesn't have this.
      // We will check by activity log or add a flag. Let's add flag dynamically if not strictly typed, Mongoose allows mixed or we can just update the model.
      // Better: we can check if a notification exists, or simply just add a field to GateEntry.
    }).populate('visitor');
    
    for (const entry of overdueEntries) {
      // Avoid database error from passing 'security' to recipient which expects ObjectId
      // Using ActivityLog and Socket.io is sufficient for admin/security roles.
      
      await logActivity({
        actor: null,
        action: 'VISITOR_OVERDUE',
        entityType: 'GateEntry',
        entityId: entry._id,
        description: `Visitor ${entry.visitor.fullName} is overdue for exit`,
        ipAddress: '127.0.0.1'
      });
      
      // Using set to dynamically store a flag even if not in schema, though Mongoose strict mode strips it if not defined. 
      // We will add overdueNotified to GateEntry schema next.
      entry.overdueNotified = true;
      await entry.save();
      
      emitToRoom('role:security', 'gate:updated', entry);
    }

  } catch (error) {
    console.error('Lifecycle Job Error:', error);
  } finally {
    isRunning = false;
  }
};

const initScheduledJobs = () => {
  // Run every 1 minute
  cron.schedule('* * * * *', runLifecycleTasks);
  console.log('Automated lifecycle management scheduler initialized');
};

module.exports = {
  initScheduledJobs,
  runLifecycleTasks
};
