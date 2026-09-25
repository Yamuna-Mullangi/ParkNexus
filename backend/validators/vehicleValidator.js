const Vehicle = require('../models/Vehicle');

const validateVehicle = async (data, vehicleId = null) => {
  const { registrationNumber, make, model, color, vehicleType, year } = data;
  const errors = [];

  if (!registrationNumber || typeof registrationNumber !== 'string' || registrationNumber.trim() === '') {
    errors.push('Registration number is required');
  } else {
    // Check for duplicate active registration numbers
    const query = { registrationNumber: registrationNumber.trim().toUpperCase(), isActive: true };
    if (vehicleId) {
      query._id = { $ne: vehicleId };
    }
    const existing = await Vehicle.findOne(query);
    if (existing) {
      errors.push('Registration number is already registered and active');
    }
  }

  if (!make || make.trim() === '') errors.push('Make is required');
  if (!model || model.trim() === '') errors.push('Model is required');
  if (!color || color.trim() === '') errors.push('Color is required');
  if (!vehicleType) {
    errors.push('Vehicle type is required');
  } else if (!['car', 'motorcycle', 'scooter', 'bicycle', 'other'].includes(vehicleType)) {
    errors.push('Invalid vehicle type');
  }

  if (year) {
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      errors.push('Invalid year');
    }
  }

  return errors;
};

module.exports = { validateVehicle };
