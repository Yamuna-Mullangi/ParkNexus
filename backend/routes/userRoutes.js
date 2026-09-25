const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Get profile logic is essentially getMe, but we can map GET /api/users/profile to it
const { getMe } = require('../controllers/authController');
const { getUsers, getUser, updateUserStatus, updateUserRole, createUser } = require('../controllers/userController');
const { admin } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getMe)
  .put(protect, updateProfile);

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .get(protect, admin, getUser);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

module.exports = router;
