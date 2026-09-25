const express = require('express');
const router = express.Router();
const { getCalendar } = require('../controllers/operationsCalendarController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCalendar);

module.exports = router;
