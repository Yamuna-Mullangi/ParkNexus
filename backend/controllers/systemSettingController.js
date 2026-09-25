const systemSettingService = require('../services/systemSettingService');
const { logActivity } = require('../services/activityLogService');

const getSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingService.updateSettings(req.body);
    
    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entityType: 'System',
      description: 'System operational settings were updated.',
      metadata: { keys: Object.keys(req.body) }
    });

    res.json(settings);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const resetSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingService.resetSettings();
    
    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'SYSTEM_SETTINGS_RESET',
      entityType: 'System',
      description: 'System operational settings were reset to defaults.'
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
