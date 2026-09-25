const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

const gateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many gate operations from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);

// Security routes
router.route('/check-in')
  .post(authorize('security', 'admin'), gateLimiter, gateController.checkInVisitor);

router.route('/check-out/:id')
  .post(authorize('security', 'admin'), gateLimiter, gateController.checkOutVisitor);

router.route('/active')
  .get(authorize('security', 'admin'), gateController.getActiveVisitors);

router.route('/today')
  .get(authorize('security', 'admin'), gateController.getTodayGateEntries);

router.route('/history')
  .get(authorize('security', 'admin'), gateController.getGateHistory);

router.route('/:id')
  .get(authorize('security', 'admin'), gateController.getGateEntry);

// Resident route
router.route('/visitor/:visitorId')
  .get(authorize('resident', 'security', 'admin'), gateController.getVisitorGateStatus);

module.exports = router;
