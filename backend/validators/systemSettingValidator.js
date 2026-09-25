const { check, validationResult } = require('express-validator');

const validateSystemSettings = [
  // Reservation Settings
  check('reservationSettings.minReservationDuration')
    .optional()
    .isInt({ min: 1 }).withMessage('Minimum duration must be a positive integer'),
  check('reservationSettings.maxReservationDuration')
    .optional()
    .isInt({ min: 1 }).withMessage('Maximum duration must be a positive integer')
    .custom((value, { req }) => {
      if (req.body.reservationSettings?.minReservationDuration !== undefined) {
        if (value < req.body.reservationSettings.minReservationDuration) {
          throw new Error('Max duration must be >= min duration');
        }
      }
      return true;
    }),
  check('reservationSettings.maxActiveReservationsPerUser')
    .optional()
    .isInt({ min: 1 }).withMessage('Max active reservations must be a positive integer'),
  check('reservationSettings.allowSameDayReservation').optional().isBoolean(),
  check('reservationSettings.allowFutureReservations').optional().isBoolean(),

  // Visitor Settings
  check('visitorSettings.defaultVisitorPassDuration')
    .optional()
    .isInt({ min: 1 }).withMessage('Default visitor pass duration must be positive'),
  check('visitorSettings.maxVisitorPassDuration')
    .optional()
    .isInt({ min: 1 }).withMessage('Maximum visitor pass duration must be positive')
    .custom((value, { req }) => {
      if (req.body.visitorSettings?.defaultVisitorPassDuration !== undefined) {
        if (value < req.body.visitorSettings.defaultVisitorPassDuration) {
          throw new Error('Max duration must be >= default duration');
        }
      }
      return true;
    }),
  check('visitorSettings.allowVisitorVehicle').optional().isBoolean(),
  check('visitorSettings.allowVisitorParking').optional().isBoolean(),

  // Parking Settings
  check('parkingSettings.allowResidentAssignment').optional().isBoolean(),
  check('parkingSettings.allowVisitorParking').optional().isBoolean(),
  check('parkingSettings.defaultParkingView').optional().isIn(['map', 'list']),
  check('parkingSettings.highOccupancyThreshold')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Threshold must be between 1 and 100'),
  check('parkingSettings.nearFullThreshold')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Threshold must be between 1 and 100')
    .custom((value, { req }) => {
      if (req.body.parkingSettings?.highOccupancyThreshold !== undefined) {
        if (value <= req.body.parkingSettings.highOccupancyThreshold) {
          throw new Error('Near full threshold must be > high occupancy threshold');
        }
      }
      return true;
    }),

  // Recommendation Settings
  check('recommendationSettings.recommendationsEnabled').optional().isBoolean(),
  check('recommendationSettings.maxRecommendations').optional().isInt({ min: 1, max: 20 }),

  // Notification Settings
  check('notificationSettings.notificationsEnabled').optional().isBoolean(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateSystemSettings
};
