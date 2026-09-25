const express = require('express');
const router = express.Router();
const recentParkingController = require('../controllers/recentParkingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(recentParkingController.getRecentViews)
  .delete(recentParkingController.clearRecentViews);

router.route('/:parkingSpotId')
  .post(recentParkingController.recordView);

module.exports = router;
