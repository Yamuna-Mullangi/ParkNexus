const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/:type')
  .get(protect, admin, generateReport);

module.exports = router;
