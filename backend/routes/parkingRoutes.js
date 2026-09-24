const express = require('express');
const router = express.Router();
const {
  getParkingSpots,
  getParkingSpot,
  getMyParking,
  createParkingSpot,
  updateParkingSpot,
  assignParkingSpot,
  deactivateParkingSpot,
} = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getParkingSpots)
  .post(protect, authorize('admin'), createParkingSpot);

router.route('/my')
  .get(protect, getMyParking);

router.route('/:id')
  .get(protect, getParkingSpot)
  .put(protect, authorize('admin'), updateParkingSpot)
  .delete(protect, authorize('admin'), deactivateParkingSpot);

router.route('/:id/assign')
  .put(protect, authorize('admin'), assignParkingSpot);

module.exports = router;
