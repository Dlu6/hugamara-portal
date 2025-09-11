import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getShiftStats,
  updateShiftStatus,
  clockIn,
  clockOut,
  getTodaysShifts,
  getUpcomingShifts,
  approveShift,
} from "../controllers/shiftController.js";

const router = express.Router();

const shiftValidation = [
  body("shiftDate").isISO8601().withMessage("Valid shift date required"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid start time required (HH:MM format)"),
  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid end time required (HH:MM format)"),
  body("position")
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters"),
  body("shiftType")
    .isIn(["regular", "overtime", "holiday", "weekend", "night", "split"])
    .withMessage("Invalid shift type"),
  body("status")
    .optional()
    .isIn([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .withMessage("Invalid status"),
  body("section")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Section must be less than 50 characters"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
];

const statusValidation = [
  body("status")
    .isIn([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .withMessage("Invalid status"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllShifts);
router.get("/stats", authenticateToken, getShiftStats);
router.get("/today", authenticateToken, getTodaysShifts);
router.get("/upcoming", authenticateToken, getUpcomingShifts);
router.get("/:id", authenticateToken, getShiftById);
router.post(
  "/",
  authenticateToken,
  shiftValidation,
  validateRequest,
  createShift
);
router.put(
  "/:id",
  authenticateToken,
  shiftValidation,
  validateRequest,
  updateShift
);
router.delete("/:id", authenticateToken, deleteShift);

// Status Management Routes
router.patch(
  "/:id/status",
  authenticateToken,
  statusValidation,
  validateRequest,
  updateShiftStatus
);

// Time Tracking Routes
router.patch("/:id/clock-in", authenticateToken, clockIn);
router.patch("/:id/clock-out", authenticateToken, clockOut);

// Approval Routes
router.patch("/:id/approve", authenticateToken, approveShift);

export default router;
