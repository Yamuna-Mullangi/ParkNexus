const express = require('express');
const router = express.Router();
const favoriteParkingController = require('../controllers/favoriteParkingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(favoriteParkingController.getFavorites);

router.route('/:parkingSpotId')
  .post(favoriteParkingController.addFavorite)
  .delete(favoriteParkingController.removeFavorite);

router.route('/check/:parkingSpotId')
  .get(favoriteParkingController.checkFavorite);

module.exports = router;
