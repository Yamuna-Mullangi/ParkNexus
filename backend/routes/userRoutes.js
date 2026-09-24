const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Get profile logic is essentially getMe, but we can map GET /api/users/profile to it
const { getMe } = require('../controllers/authController');

router.route('/profile')
  .get(protect, getMe)
  .put(protect, updateProfile);

module.exports = router;
