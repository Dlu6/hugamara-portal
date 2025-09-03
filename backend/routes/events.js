import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  updateEventStatus,
  getUpcomingEvents,
  getEventsByType,
  updateEventAttendance,
  getEventCalendar,
} from "../controllers/eventController.js";

const router = express.Router();

const eventValidation = [
  body("title")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("eventType")
    .isIn([
      "birthday",
      "anniversary",
      "corporate",
      "live_band",
      "dj_night",
      "special_dinner",
      "wine_tasting",
      "other",
    ])
    .withMessage("Invalid event type"),
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").isISO8601().withMessage("Valid end date required"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid start time required (HH:MM)"),
  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid end time required (HH:MM)"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("expectedAttendance")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Expected attendance must be a non-negative integer"),
  body("ticketPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ticket price must be a positive number"),
  body("ticketQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Ticket quantity must be a non-negative integer"),
  body("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number"),
  body("status")
    .optional()
    .isIn(["draft", "published", "active", "completed", "cancelled"])
    .withMessage("Invalid status"),
];

const statusValidation = [
  body("status")
    .isIn(["draft", "published", "active", "completed", "cancelled"])
    .withMessage("Invalid status"),
];

const attendanceValidation = [
  body("actualAttendance")
    .isInt({ min: 0 })
    .withMessage("Actual attendance must be a non-negative integer"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllEvents);
router.get("/stats", authenticateToken, getEventStats);
router.get("/upcoming", authenticateToken, getUpcomingEvents);
router.get("/calendar", authenticateToken, getEventCalendar);
router.get("/type/:eventType", authenticateToken, getEventsByType);
router.get("/:id", authenticateToken, getEventById);
router.post(
  "/",
  authenticateToken,
  eventValidation,
  validateRequest,
  createEvent
);
router.put(
  "/:id",
  authenticateToken,
  eventValidation,
  validateRequest,
  updateEvent
);
router.delete("/:id", authenticateToken, deleteEvent);

// Event Management Routes
router.patch(
  "/:id/status",
  authenticateToken,
  statusValidation,
  validateRequest,
  updateEventStatus
);
router.patch(
  "/:id/attendance",
  authenticateToken,
  attendanceValidation,
  validateRequest,
  updateEventAttendance
);

export default router;
