import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { requireRole } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} from '../controllers/userController.js';

const router = express.Router();

// Validation rules
const userValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn(['org_admin', 'general_manager', 'supervisor', 'staff', 'marketing_crm', 'finance'])
    .withMessage('Invalid role specified'),
  body('outletId')
    .optional()
    .isUUID()
    .withMessage('Invalid outlet ID')
];

const roleUpdateValidation = [
  body('role')
    .isIn(['org_admin', 'general_manager', 'supervisor', 'staff', 'marketing_crm', 'finance'])
    .withMessage('Invalid role specified'),
  body('outletId')
    .optional()
    .isUUID()
    .withMessage('Invalid outlet ID')
];

// Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Admin and Manager only routes
router.post('/', 
  requireRole(['org_admin', 'general_manager']), 
  userValidation, 
  validateRequest, 
  createUser
);

router.put('/:id', 
  requireRole(['org_admin', 'general_manager']), 
  userValidation, 
  validateRequest, 
  updateUser
);

router.delete('/:id', 
  requireRole(['org_admin']), 
  deleteUser
);

router.patch('/:id/role', 
  requireRole(['org_admin']), 
  roleUpdateValidation, 
  validateRequest, 
  updateUserRole
);

export default router;
