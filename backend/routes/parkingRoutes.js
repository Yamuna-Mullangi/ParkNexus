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


const parkingShareController = require('../controllers/parkingShareController');

router.route('/shared')
  .get(protect, parkingShareController.getAvailableSharedSpots);

router.route('/shares/my')
  .get(protect, authorize('resident'), parkingShareController.getMyShares);

router.route('/share-requests/received')
  .get(protect, authorize('resident'), parkingShareController.getReceivedRequests);

router.route('/share-requests/sent')
  .get(protect, authorize('resident'), parkingShareController.getSentRequests);

router.route('/:id/share')
  .post(protect, authorize('resident'), parkingShareController.createShare);

router.route('/shares/:id')
  .delete(protect, authorize('resident'), parkingShareController.cancelShare);

router.route('/shares/:id/request')
  .post(protect, authorize('resident'), parkingShareController.requestShare);

router.route('/share-requests/:id/approve')
  .put(protect, authorize('resident'), parkingShareController.approveShareRequest);

router.route('/share-requests/:id/reject')
  .put(protect, authorize('resident'), parkingShareController.rejectShareRequest);

router.route('/:id')
  .get(protect, getParkingSpot)
  .put(protect, authorize('admin'), updateParkingSpot)
  .delete(protect, authorize('admin'), deactivateParkingSpot);

router.route('/:id/assign')
  .put(protect, authorize('admin'), assignParkingSpot);

module.exports = router;

