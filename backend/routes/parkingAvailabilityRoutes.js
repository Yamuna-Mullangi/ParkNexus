const express = require('express');
const router = express.Router();
const { getAvailability, getSpotAvailability } = require('../controllers/parkingAvailabilityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAvailability);
router.get('/:id', protect, getSpotAvailability);

module.exports = router;
