const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/overview', protect, admin, analyticsController.getOverview);

module.exports = router;
