import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  changePassword
} from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('outletId')
    .notEmpty()
    .withMessage('Outlet ID is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/login', loginValidation, validateRequest, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/refresh', refreshToken);
router.post('/change-password', authenticateToken, changePasswordValidation, validateRequest, changePassword);

export default router;