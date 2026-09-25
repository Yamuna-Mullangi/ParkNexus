const express = require('express');
const router = express.Router();
const parkingRecommendationController = require('../controllers/parkingRecommendationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, parkingRecommendationController.getRecommendations);

module.exports = router;
