import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Placeholder route
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Guests route - coming soon' });
});

export default router;