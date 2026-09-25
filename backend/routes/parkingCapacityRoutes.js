const express = require('express');
const router = express.Router();
const parkingCapacityController = require('../controllers/parkingCapacityController');
const { protect, admin } = require('../middleware/authMiddleware'); // Use existing auth

// Protect all capacity endpoints
router.use(protect);

router.get('/', parkingCapacityController.getCapacity);
router.get('/breakdown', parkingCapacityController.getCapacityBreakdown);

module.exports = router;
