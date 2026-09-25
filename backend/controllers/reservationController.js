const reservationService = require('../services/reservationService');
const ParkingSpot = require('../models/ParkingSpot');
const { createAndEmitNotification, emitToRoom } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

exports.createReservation = async (req, res) => {
  try {
    const { parkingSpot, vehicle, startTime, endTime, purpose } = req.body;
    
    const spot = await ParkingSpot.findById(parkingSpot);
    if (!spot || !spot.isActive) {
      return res.status(400).json({ success: false, error: 'Parking space is unavailable or inactive' });
    }
    
    const reservation = await reservationService.createReservation({
      parkingSpot,
      vehicle,
      user: req.user._id,
      startTime,
      endTime,
      purpose
    });
    
    // Create notification
    await createAndEmitNotification({
      recipient: req.user._id,
      type: 'RESERVATION_CREATED',
      title: 'Reservation Created',
      message: `Your reservation for spot ${spot.spotNumber} was created successfully.`,
      relatedEntity: reservation._id,
      relatedEntityType: 'Reservation'
    });
    
    await logActivity({
      actor: req.user._id,
      action: 'RESERVATION_CREATED',
      entityType: 'Reservation',
      entityId: reservation._id,
      description: `Created reservation for spot ${spot.spotNumber}`,
      ipAddress: req.ip
    });
    
    emitToRoom(`role:admin`, 'reservation:updated', reservation);
    
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'security') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    await reservationService.updateExpiredReservations();
    const result = await reservationService.getUserReservations(req.user._id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    await reservationService.updateExpiredReservations();
    const result = await reservationService.getAllReservations(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id, req.user._id);
    
    // Create notification
    await createAndEmitNotification({
      recipient: reservation.user,
      type: 'RESERVATION_CANCELLED',
      title: 'Reservation Cancelled',
      message: `Your reservation has been cancelled.`,
      relatedEntity: reservation._id,
      relatedEntityType: 'Reservation'
    });
    
    await logActivity({
      actor: req.user._id,
      action: 'RESERVATION_CANCELLED',
      entityType: 'Reservation',
      entityId: reservation._id,
      description: `Cancelled reservation`,
      ipAddress: req.ip
    });
    
    emitToRoom(`role:admin`, 'reservation:updated', reservation);
    
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
