const vehicleService = require('../services/vehicleService');

const createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.user._id, req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getUserVehicles(req.user._id);
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Vehicle deactivated' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const setPrimaryVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.setPrimaryVehicle(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createVehicle,
  getMyVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimaryVehicle
};
