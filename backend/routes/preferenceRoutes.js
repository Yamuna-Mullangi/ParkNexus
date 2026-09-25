const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/userPreferenceController');
const { protect } = require('../middleware/authMiddleware');
const { validatePreferences } = require('../validators/userPreferenceValidator');

router.use(protect); // All preference routes require authentication

router.route('/')
  .get(preferenceController.getPreferences)
  .put(validatePreferences, preferenceController.updatePreferences);

router.post('/reset', preferenceController.resetPreferences);

module.exports = router;
