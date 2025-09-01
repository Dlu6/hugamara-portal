import express from 'express';
import { getDashboardStats, getRecentActivity, getRevenueChart, getTopMenuItems } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/revenue', getRevenueChart);
router.get('/top-items', getTopMenuItems);

export default router;
