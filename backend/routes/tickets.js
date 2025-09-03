import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketStats,
  updateTicketStatus,
  getOverdueTickets,
  getTicketsByCategory,
  addTicketComment,
} from "../controllers/ticketController.js";

const router = express.Router();

const ticketValidation = [
  body("title")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("category")
    .isIn([
      "guest_complaint",
      "equipment_failure",
      "safety_security",
      "facility",
      "it",
      "hr",
      "supplier",
      "other",
    ])
    .withMessage("Invalid category"),
  body("priority")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("status")
    .optional()
    .isIn(["open", "in_progress", "waiting", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  body("estimatedResolutionTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Estimated resolution time must be a positive integer"),
];

const statusValidation = [
  body("status")
    .isIn(["open", "in_progress", "waiting", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("resolutionNotes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Resolution notes must be less than 1000 characters"),
];

const commentValidation = [
  body("comment")
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllTickets);
router.get("/stats", authenticateToken, getTicketStats);
router.get("/overdue", authenticateToken, getOverdueTickets);
router.get("/category/:category", authenticateToken, getTicketsByCategory);
router.get("/:id", authenticateToken, getTicketById);
router.post(
  "/",
  authenticateToken,
  ticketValidation,
  validateRequest,
  createTicket
);
router.put(
  "/:id",
  authenticateToken,
  ticketValidation,
  validateRequest,
  updateTicket
);
router.delete("/:id", authenticateToken, deleteTicket);

// Ticket Management Routes
router.patch(
  "/:id/status",
  authenticateToken,
  statusValidation,
  validateRequest,
  updateTicketStatus
);
router.post(
  "/:id/comment",
  authenticateToken,
  commentValidation,
  validateRequest,
  addTicketComment
);

export default router;
