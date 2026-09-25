const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

const validateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Too many validation attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);

// Security endpoint
router.post('/passes/validate', authorize('security', 'admin'), validateLimiter, visitorController.validatePass);

// Resident visitor routes
router.route('/')
  .post(authorize('resident'), visitorController.createVisitor);

router.route('/my')
  .get(authorize('resident'), visitorController.getMyVisitors);

router.route('/upcoming')
  .get(authorize('resident'), visitorController.getUpcomingVisitors);

router.route('/history')
  .get(authorize('resident'), visitorController.getVisitorHistory);

// Resident pass routes
router.route('/passes/:passId')
  .get(authorize('resident'), visitorController.getPass);

router.route('/passes/:passId/cancel')
  .put(authorize('resident'), visitorController.cancelPass);

router.route('/:id')
  .get(authorize('resident'), visitorController.getVisitor)
  .put(authorize('resident'), visitorController.updateVisitor);

router.route('/:id/cancel')
  .put(authorize('resident'), visitorController.cancelVisitor);

router.route('/:id/passes')
  .post(authorize('resident'), visitorController.createPass);

module.exports = router;
