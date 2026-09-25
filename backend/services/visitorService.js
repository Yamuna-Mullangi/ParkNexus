const Visitor = require('../models/Visitor');
const VisitorPass = require('../models/VisitorPass');
const Vehicle = require('../models/Vehicle');
const { validateVisitor } = require('../validators/visitorValidator');

const updateVisitorStatuses = async () => {
  const now = new Date();
  
  // Update expired passes first
  await VisitorPass.updateMany(
    { status: 'active', validUntil: { $lt: now } },
    { $set: { status: 'expired' } }
  );

  // Update visitors based on time
  await Visitor.updateMany(
    { status: { $in: ['upcoming', 'active'] }, expectedDeparture: { $lt: now } },
    { $set: { status: 'completed' } } // or expired based on pass, but completed is fine
  );

  await Visitor.updateMany(
    { status: 'upcoming', expectedArrival: { $lte: now }, expectedDeparture: { $gt: now } },
    { $set: { status: 'active' } }
  );
};

const createVisitor = async (userId, data) => {
  const { getSettings } = require('./systemSettingService');
  const settings = await getSettings();
  const visSettings = settings.visitorSettings;

  if (data.expectedArrival && !data.expectedDeparture) {
    const arrivalDate = new Date(data.expectedArrival);
    const departureDate = new Date(arrivalDate.getTime() + visSettings.defaultVisitorPassDuration * 60000);
    data.expectedDeparture = departureDate.toISOString();
  }

  const errors = validateVisitor(data);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  if (data.expectedArrival && data.expectedDeparture) {
    const durationMinutes = (new Date(data.expectedDeparture) - new Date(data.expectedArrival)) / 60000;
    if (durationMinutes > visSettings.maxVisitorPassDuration) {
      throw new Error(`Visitor pass cannot exceed ${visSettings.maxVisitorPassDuration} minutes.`);
    }
  }

  const { vehicle } = data;
  if (vehicle) {
    if (!visSettings.allowVisitorVehicle) {
      throw new Error('Visitor vehicles are currently not permitted.');
    }
    const v = await Vehicle.findOne({ _id: vehicle, owner: userId, isActive: true });
    if (!v) {
      throw new Error('Selected vehicle is invalid or unauthorized');
    }
  }

  const visitor = new Visitor({
    ...data,
    resident: userId,
    visitDate: new Date(data.expectedArrival)
  });

  await visitor.save();
  return visitor;
};

const { paginateAndSort } = require('../utils/dbUtils');
const { getDateRangeQuery } = require('../utils/dateUtils');

const getMyVisitors = async (userId, filters = {}) => {
  await updateVisitorStatuses();
  
  const query = { resident: userId };
  
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: 'i' } },
      { 'vehicle.registrationNumber': { $regex: filters.search, $options: 'i' } } // Requires proper modeling, might just do name for now
    ];
  }
  
  if (filters.status && filters.status !== 'All') {
    query.status = filters.status;
  }
  
  if (filters.dateRange && filters.dateRange !== 'All Time') {
    Object.assign(query, getDateRangeQuery(filters.dateRange, 'visitDate'));
  }

  filters.allowedSortFields = ['visitDate', 'expectedArrival', 'createdAt'];
  // Default sort for visitors
  if (!filters.sortBy) {
    filters.sortBy = 'expectedArrival';
    filters.sortOrder = 'desc';
  }

  // Notice: to search by vehicle registration we can't easily populate and filter. We just filter by fullName.
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return await paginateAndSort(Visitor, query, filters, ['vehicle']);
};

const getUpcomingVisitors = async (userId) => {
  await updateVisitorStatuses();
  return await Visitor.find({ 
    resident: userId, 
    status: { $in: ['upcoming', 'active'] } 
  }).populate('vehicle').sort({ expectedArrival: 1 });
};

const getVisitorHistory = async (userId) => {
  await updateVisitorStatuses();
  return await Visitor.find({ 
    resident: userId, 
    status: { $in: ['completed', 'cancelled', 'expired'] } 
  }).populate('vehicle').sort({ expectedArrival: -1 });
};

const getVisitorById = async (id, userId) => {
  await updateVisitorStatuses();
  const visitor = await Visitor.findOne({ _id: id, resident: userId }).populate('vehicle');
  if (!visitor) throw new Error('Visitor not found');
  return visitor;
};

const updateVisitor = async (id, userId, data) => {
  const visitor = await getVisitorById(id, userId);

  if (['cancelled', 'completed', 'expired'].includes(visitor.status)) {
    throw new Error('Cannot update visitor in current status');
  }

  const errors = validateVisitor({
    ...visitor.toObject(),
    ...data
  });
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  if (data.vehicle) {
    const v = await Vehicle.findOne({ _id: data.vehicle, owner: userId, isActive: true });
    if (!v) {
      throw new Error('Selected vehicle is invalid or unauthorized');
    }
  }

  delete data.resident;
  Object.assign(visitor, data);
  if (data.expectedArrival) {
    visitor.visitDate = new Date(data.expectedArrival);
  }

  await visitor.save();
  return visitor;
};

const cancelVisitor = async (id, userId) => {
  const visitor = await getVisitorById(id, userId);
  
  if (['cancelled', 'completed', 'expired'].includes(visitor.status)) {
    throw new Error('Visitor already completed or cancelled');
  }

  visitor.status = 'cancelled';
  await visitor.save();

  // Cancel associated pass
  await VisitorPass.updateMany(
    { visitor: visitor._id, status: { $in: ['active'] } },
    { $set: { status: 'cancelled' } }
  );

  return visitor;
};

module.exports = {
  createVisitor,
  getMyVisitors,
  getUpcomingVisitors,
  getVisitorHistory,
  getVisitorById,
  updateVisitor,
  cancelVisitor,
  updateVisitorStatuses
};
