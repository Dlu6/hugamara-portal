import express from "express";
import { query } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { globalSearch, quickSearch } from "../controllers/searchController.js";

const router = express.Router();

// Validation middleware
const searchValidation = [
  query("q")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("type")
    .optional()
    .isIn([
      "guests",
      "orders",
      "menu",
      "reservations",
      "inventory",
      "staff",
      "events",
      "tickets",
    ])
    .withMessage("Invalid search type"),
];

// Routes
router.get(
  "/",
  authenticateToken,
  searchValidation,
  validateRequest,
  globalSearch
);
router.get(
  "/quick",
  authenticateToken,
  searchValidation,
  validateRequest,
  quickSearch
);

export default router;
