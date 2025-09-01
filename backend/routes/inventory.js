import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { getAllInventory, updateStock, getLowStockItems } from '../controllers/inventoryController.js';

const router = express.Router();

const stockUpdateValidation = [
  body('quantity').isFloat({ min: 0 }).withMessage('Valid quantity required'),
  body('type').isIn(['add', 'subtract']).withMessage('Type must be add or subtract')
];

router.get('/', authenticateToken, getAllInventory);
router.get('/low-stock', authenticateToken, getLowStockItems);
router.patch('/:id/stock', authenticateToken, stockUpdateValidation, validateRequest, updateStock);

export default router;
