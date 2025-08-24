import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Placeholder route
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Dashboard route - coming soon' });
});

export default router;