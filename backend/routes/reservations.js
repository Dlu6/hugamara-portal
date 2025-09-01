import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { getAllReservations, createReservation, updateReservation } from '../controllers/reservationController.js';

const router = express.Router();

const reservationValidation = [
  body('guestId').notEmpty().withMessage('Guest ID is required'),
  body('reservationDate').isISO8601().withMessage('Valid reservation date is required'),
  body('reservationTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required'),
  body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1')
];

router.get('/', authenticateToken, getAllReservations);
router.post('/', authenticateToken, reservationValidation, validateRequest, createReservation);
router.put('/:id', authenticateToken, updateReservation);

export default router;