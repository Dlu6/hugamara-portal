import express from "express";
import { query } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getDashboardStats,
  getRevenueReport,
  getSalesReport,
  getInventoryReport,
  getStaffReport,
  getEventReport,
  getCustomerReport,
  exportReport,
} from "../controllers/reportController.js";

const router = express.Router();

const reportValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date required"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date required"),
  query("period")
    .optional()
    .isIn(["today", "week", "month", "year"])
    .withMessage("Invalid period"),
  query("groupBy")
    .optional()
    .isIn(["hour", "day", "week", "month"])
    .withMessage("Invalid groupBy"),
  query("format")
    .optional()
    .isIn(["json", "csv"])
    .withMessage("Invalid format"),
];

// Dashboard and Overview Reports
router.get(
  "/dashboard",
  authenticateToken,
  reportValidation,
  validateRequest,
  getDashboardStats
);

// Detailed Reports
router.get(
  "/revenue",
  authenticateToken,
  reportValidation,
  validateRequest,
  getRevenueReport
);
router.get(
  "/sales",
  authenticateToken,
  reportValidation,
  validateRequest,
  getSalesReport
);
router.get(
  "/inventory",
  authenticateToken,
  reportValidation,
  validateRequest,
  getInventoryReport
);
router.get(
  "/staff",
  authenticateToken,
  reportValidation,
  validateRequest,
  getStaffReport
);
router.get(
  "/events",
  authenticateToken,
  reportValidation,
  validateRequest,
  getEventReport
);
router.get(
  "/customers",
  authenticateToken,
  reportValidation,
  validateRequest,
  getCustomerReport
);

// Export Reports
router.get(
  "/export",
  authenticateToken,
  reportValidation,
  validateRequest,
  exportReport
);

export default router;
