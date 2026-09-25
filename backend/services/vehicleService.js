const Vehicle = require('../models/Vehicle');
const { validateVehicle } = require('../validators/vehicleValidator');

const createVehicle = async (userId, data) => {
  const errors = await validateVehicle(data);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // If this is the user's first vehicle, make it primary
  const existingVehiclesCount = await Vehicle.countDocuments({ owner: userId, isActive: true });
  const isPrimary = existingVehiclesCount === 0 || data.isPrimary;

  const vehicle = new Vehicle({
    ...data,
    owner: userId,
    registrationNumber: data.registrationNumber.trim().toUpperCase(),
    isPrimary
  });

  await vehicle.save();
  return vehicle;
};

const getUserVehicles = async (userId) => {
  return await Vehicle.find({ owner: userId, isActive: true }).sort('-createdAt');
};

const getVehicleById = async (id, userId) => {
  const vehicle = await Vehicle.findOne({ _id: id, owner: userId, isActive: true });
  if (!vehicle) throw new Error('Vehicle not found');
  return vehicle;
};

const updateVehicle = async (id, userId, data) => {
  const vehicle = await getVehicleById(id, userId);

  const errors = await validateVehicle(data, id);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // Disallow modifying owner or createdAt
  delete data.owner;
  delete data.createdAt;

  if (data.registrationNumber) {
    data.registrationNumber = data.registrationNumber.trim().toUpperCase();
  }

  Object.assign(vehicle, data);
  await vehicle.save();
  return vehicle;
};

const deleteVehicle = async (id, userId) => {
  const vehicle = await getVehicleById(id, userId);
  vehicle.isActive = false;
  
  if (vehicle.isPrimary) {
    vehicle.isPrimary = false;
    // Optionally make another vehicle primary, but for now we just unset it
  }
  
  await vehicle.save();
  return vehicle;
};

const setPrimaryVehicle = async (id, userId) => {
  const vehicle = await getVehicleById(id, userId);
  
  vehicle.isPrimary = true;
  await vehicle.save(); // pre-save hook handles unsetting others
  
  return vehicle;
};

module.exports = {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  setPrimaryVehicle
};
