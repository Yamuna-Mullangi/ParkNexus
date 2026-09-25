const favoriteParkingService = require('../services/favoriteParkingService');

exports.addFavorite = async (req, res) => {
  try {
    const favorite = await favoriteParkingService.addFavorite(req.user.id, req.params.parkingSpotId);
    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await favoriteParkingService.removeFavorite(req.user.id, req.params.parkingSpotId);
    res.status(200).json({ success: true, message: 'Favorite removed' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteParkingService.getFavorites(req.user.id);
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const result = await favoriteParkingService.checkFavorite(req.user.id, req.params.parkingSpotId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
