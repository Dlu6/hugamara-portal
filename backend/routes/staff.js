import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  updatePerformance,
  updateStaffStatus,
  getNewHires,
  getStaffByDepartment,
} from "../controllers/staffController.js";

const router = express.Router();

const staffValidation = [
  body("employeeId")
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage("Employee ID must be between 2 and 20 characters"),
  body("position")
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters"),
  body("department")
    .isIn([
      "front_of_house",
      "back_of_house",
      "kitchen",
      "bar",
      "management",
      "security",
      "cleaning",
      "maintenance",
    ])
    .withMessage("Invalid department"),
  body("hireDate").isISO8601().withMessage("Valid hire date required"),
  body("hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),
  body("salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),
  body("payFrequency")
    .isIn(["hourly", "weekly", "biweekly", "monthly"])
    .withMessage("Invalid pay frequency"),
  body("performanceRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Performance rating must be between 0 and 5"),
];

const performanceValidation = [
  body("performanceRating")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Performance rating must be between 0 and 5"),
  body("reviewNotes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Review notes must be less than 1000 characters"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllStaff);
router.get("/stats", authenticateToken, getStaffStats);
router.get("/new-hires", authenticateToken, getNewHires);
router.get("/department/:department", authenticateToken, getStaffByDepartment);
router.get("/:id", authenticateToken, getStaffById);
router.post(
  "/",
  authenticateToken,
  staffValidation,
  validateRequest,
  createStaff
);
router.put(
  "/:id",
  authenticateToken,
  staffValidation,
  validateRequest,
  updateStaff
);
router.delete("/:id", authenticateToken, deleteStaff);

// Performance Management Routes
router.patch(
  "/:id/performance",
  authenticateToken,
  performanceValidation,
  validateRequest,
  updatePerformance
);

// Status Management Routes
router.patch("/:id/status", authenticateToken, updateStaffStatus);

export default router;
