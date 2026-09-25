const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSettingController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateSystemSettings } = require('../validators/systemSettingValidator');

router.use(protect);
router.use(admin); // All system settings routes are admin-only

router.route('/')
  .get(systemSettingController.getSettings)
  .put(validateSystemSettings, systemSettingController.updateSettings);

router.post('/reset', systemSettingController.resetSettings);

module.exports = router;
