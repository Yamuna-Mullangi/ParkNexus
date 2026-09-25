const FavoriteParking = require('../models/FavoriteParking');
const ParkingSpot = require('../models/ParkingSpot');

const addFavorite = async (userId, parkingSpotId) => {
  const spot = await ParkingSpot.findById(parkingSpotId);
  if (!spot) throw new Error('Parking spot not found');
  if (!spot.isActive) throw new Error('Cannot favorite an inactive parking spot');

  try {
    const favorite = await FavoriteParking.create({
      user: userId,
      parkingSpot: parkingSpotId
    });
    return await favorite.populate('parkingSpot');
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Parking spot is already in favorites');
    }
    throw error;
  }
};

const removeFavorite = async (userId, parkingSpotId) => {
  const result = await FavoriteParking.findOneAndDelete({
    user: userId,
    parkingSpot: parkingSpotId
  });
  if (!result) {
    throw new Error('Favorite not found');
  }
  return result;
};

const getFavorites = async (userId) => {
  return await FavoriteParking.find({ user: userId })
    .populate('parkingSpot')
    .sort({ createdAt: -1 });
};

const checkFavorite = async (userId, parkingSpotId) => {
  const favorite = await FavoriteParking.findOne({
    user: userId,
    parkingSpot: parkingSpotId
  });
  return { isFavorite: !!favorite };
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};
