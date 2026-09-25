const Reservation = require('../models/Reservation');

const checkReservationConflict = async (parkingSpotId, startTime, endTime) => {
  const overlapping = await Reservation.findOne({
    parkingSpot: parkingSpotId,
    status: { $in: ['pending', 'approved', 'active'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
  return !!overlapping;
};

const createReservation = async (data) => {
  const { parkingSpot, user, vehicle, startTime, endTime, purpose } = data;
  
  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Start time must be before end time');
  }
  
  if (new Date(startTime) < new Date()) {
    throw new Error('Start time cannot be in the past');
  }

  const { getSettings } = require('./systemSettingService');
  const settings = await getSettings();
  const resSettings = settings.reservationSettings;

  const durationMinutes = (new Date(endTime) - new Date(startTime)) / (1000 * 60);
  if (durationMinutes < resSettings.minReservationDuration) {
    throw new Error(`Reservation must be at least ${resSettings.minReservationDuration} minutes.`);
  }
  if (durationMinutes > resSettings.maxReservationDuration) {
    throw new Error(`Reservation cannot exceed ${resSettings.maxReservationDuration} minutes.`);
  }

  const isSameDay = new Date(startTime).toDateString() === new Date().toDateString();
  if (isSameDay && !resSettings.allowSameDayReservation) {
    throw new Error('Same-day reservations are currently disabled.');
  }
  if (!isSameDay && !resSettings.allowFutureReservations) {
    throw new Error('Future reservations are currently disabled.');
  }

  const activeReservationsCount = await Reservation.countDocuments({
    user,
    status: { $in: ['pending', 'approved', 'active'] }
  });
  if (activeReservationsCount >= resSettings.maxActiveReservationsPerUser) {
    throw new Error(`You have reached the maximum allowed active reservations (${resSettings.maxActiveReservationsPerUser}).`);
  }

  const { checkSpotAvailability } = require('./parkingAvailabilityService');
  const availability = await checkSpotAvailability(parkingSpot, startTime, endTime, user, vehicle);
  
  if (!availability.available) {
    throw new Error(`This parking spot is no longer available for the selected time. Reason: ${availability.reasons[0]}`);
  }

  if (vehicle) {
    const VehicleModel = require('../models/Vehicle');
    const v = await VehicleModel.findOne({ _id: vehicle, owner: user, isActive: true });
    if (!v) throw new Error('Selected vehicle is invalid, inactive, or unauthorized.');
  }

  const reservation = new Reservation({
    parkingSpot,
    user,
    vehicle,
    startTime,
    endTime,
    purpose,
    status: 'approved'
  });

  return await reservation.save();
};

const getReservationById = async (id) => {
  return await Reservation.findById(id).populate('parkingSpot').populate('vehicle');
};

const { getDateRangeQuery } = require('../utils/dateUtils');
const { paginateAndSort } = require('../utils/dbUtils');

const buildReservationQuery = (query, filters = {}) => {
  const { status, dateRange, search } = filters;
  
  if (status && status !== 'All') {
    query.status = status;
  }
  
  if (dateRange && dateRange !== 'All Time') {
    Object.assign(query, getDateRangeQuery(dateRange, 'startTime'));
  }
  
  return query;
};

const getUserReservations = async (userId, filters = {}) => {
  const query = buildReservationQuery({ user: userId }, filters);
  
  // Note: search by parking spot spotNumber is tricky across collections without aggregate,
  // For now we will do backend filtering for status/date and keep it simple.
  filters.allowedSortFields = ['createdAt', 'startTime', 'endTime', 'status'];
  return await paginateAndSort(Reservation, query, filters, ['parkingSpot', 'vehicle']);
};

const getAllReservations = async (filters = {}) => {
  const query = buildReservationQuery({}, filters);
  filters.allowedSortFields = ['createdAt', 'startTime', 'endTime', 'status'];
  return await paginateAndSort(Reservation, query, filters, [
    { path: 'user', select: 'name email' },
    'parkingSpot',
    'vehicle'
  ]);
};

const cancelReservation = async (id, userId) => {
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    throw new Error('Reservation not found');
  }
  
  if (reservation.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }
  
  if (!['pending', 'approved'].includes(reservation.status)) {
    throw new Error('Cannot cancel reservation in current status');
  }
  
  reservation.status = 'cancelled';
  return await reservation.save();
};

const updateExpiredReservations = async () => {
  const now = new Date();
  await Reservation.updateMany(
    { status: { $in: ['approved', 'active'] }, endTime: { $lt: now } },
    { $set: { status: 'expired' } }
  );
  
  await Reservation.updateMany(
    { status: 'approved', startTime: { $lte: now }, endTime: { $gt: now } },
    { $set: { status: 'active' } }
  );
};

module.exports = {
  checkReservationConflict,
  createReservation,
  getReservationById,
  getUserReservations,
  getAllReservations,
  cancelReservation,
  updateExpiredReservations
};
