const { check, validationResult } = require('express-validator');

const validatePreferences = [
  check('preferredZone').optional().isString().trim(),
  check('preferredBlock').optional().isString().trim(),
  check('preferredFloor').optional().isString().trim(),
  check('preferredParkingType').optional().isIn(['Standard', 'Compact', 'Large', 'Accessible', 'Visitor', '']),
  check('preferredVehicle').optional({ nullable: true }).isMongoId().withMessage('Invalid vehicle ID'),
  check('preferredReservationDuration').optional().isInt({ min: 15, max: 1440 }).withMessage('Duration must be between 15 and 1440 minutes'),
  check('defaultStartTime').optional().isString().trim(), // could add regex for HH:mm
  
  check('notificationPreferences').optional().isObject(),
  check('dashboardPreferences').optional().isObject(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validatePreferences
};
