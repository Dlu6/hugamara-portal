import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { getAllOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

const orderValidation = [
  body('orderType').isIn(['dine_in', 'takeaway', 'delivery']).withMessage('Valid order type required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required')
];

router.get('/', authenticateToken, getAllOrders);
router.post('/', authenticateToken, orderValidation, validateRequest, createOrder);
router.patch('/:id/status', authenticateToken, updateOrderStatus);

export default router;
