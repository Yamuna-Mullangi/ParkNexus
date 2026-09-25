const userPreferenceService = require('../services/userPreferenceService');

const getPreferences = async (req, res, next) => {
  try {
    const prefs = await userPreferenceService.getPreferences(req.user._id);
    res.json(prefs);
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const prefs = await userPreferenceService.updatePreferences(req.user._id, req.body);
    res.json(prefs);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const resetPreferences = async (req, res, next) => {
  try {
    const prefs = await userPreferenceService.resetPreferences(req.user._id);
    res.json(prefs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  resetPreferences
};
