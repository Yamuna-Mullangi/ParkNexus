const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('resident'), reservationController.createReservation);
router.get('/my', authorize('resident'), reservationController.getMyReservations);
router.get('/:id', reservationController.getReservation);
router.put('/:id/cancel', authorize('resident'), reservationController.cancelReservation);

router.get('/', authorize('admin', 'security'), reservationController.getAllReservations);

module.exports = router;
