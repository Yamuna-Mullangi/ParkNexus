const parkingRecommendationService = require('../services/parkingRecommendationService');

const getRecommendations = async (req, res) => {
  try {
    const params = {
      ...req.body,
      user: req.user._id
    };

    const recommendations = await parkingRecommendationService.getRecommendations(params);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations
};
