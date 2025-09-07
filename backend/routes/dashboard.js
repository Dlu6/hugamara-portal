import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getRevenueChart,
  getTopMenuItems,
  getOrderStatusDistribution,
  getGuestActivityData,
  getInventoryStatusData,
  getTableStatusData,
  getStaffStatusData,
  getTicketStats,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);
router.get("/revenue", getRevenueChart);
router.get("/top-items", getTopMenuItems);
router.get("/order-status", getOrderStatusDistribution);
router.get("/guest-activity", getGuestActivityData);
router.get("/inventory-status", getInventoryStatusData);
router.get("/table-status", getTableStatusData);
router.get("/staff-status", getStaffStatusData);
router.get("/ticket-stats", getTicketStats);

export default router;
