const express = require('express');
const router = express.Router();
const { getActivityHistory, getActivitySummary } = require('../controllers/activityHistoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getActivityHistory);
router.get('/summary', protect, getActivitySummary);

module.exports = router;
