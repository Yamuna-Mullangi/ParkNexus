const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(vehicleController.createVehicle);

router.route('/my')
  .get(vehicleController.getMyVehicles);

router.route('/:id')
  .get(vehicleController.getVehicle)
  .put(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

router.route('/:id/primary')
  .put(vehicleController.setPrimaryVehicle);

module.exports = router;
