import express from "express";
import { body, param, query } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats,
  updateLoyaltyPoints,
  getGuestHistory,
  searchGuests,
  getGuestsByLoyaltyTier,
} from "../controllers/guestController.js";

const router = express.Router();

// Validation middleware
const guestValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Must be a valid phone number"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Must be a valid date"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("loyaltyTier")
    .optional()
    .isIn(["bronze", "silver", "gold", "platinum", "vip"])
    .withMessage("Loyalty tier must be bronze, silver, gold, platinum, or vip"),
  body("loyaltyPoints")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Loyalty points must be a non-negative integer"),
  body("totalSpent")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total spent must be a non-negative number"),
  body("visitCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Visit count must be a non-negative integer"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("marketingConsent")
    .optional()
    .isBoolean()
    .withMessage("marketingConsent must be a boolean"),
];

const loyaltyPointsValidation = [
  body("points")
    .isInt({ min: 0 })
    .withMessage("Points must be a non-negative integer"),
  body("action")
    .isIn(["add", "subtract"])
    .withMessage("Action must be add or subtract"),
];

const loyaltyTierValidation = [
  param("tier")
    .isIn(["bronze", "silver", "gold", "platinum", "vip"])
    .withMessage("Invalid loyalty tier"),
];

// Routes
router.get("/", authenticateToken, getAllGuests);
router.get("/search", authenticateToken, searchGuests);
router.get("/stats", authenticateToken, getGuestStats);
router.get(
  "/loyalty/:tier",
  authenticateToken,
  loyaltyTierValidation,
  validateRequest,
  getGuestsByLoyaltyTier
);
router.get("/:id", authenticateToken, getGuestById);
router.get("/:id/history", authenticateToken, getGuestHistory);
router.post(
  "/",
  authenticateToken,
  guestValidation,
  validateRequest,
  createGuest
);
router.put(
  "/:id",
  authenticateToken,
  guestValidation,
  validateRequest,
  updateGuest
);
router.patch(
  "/:id/loyalty",
  authenticateToken,
  loyaltyPointsValidation,
  validateRequest,
  updateLoyaltyPoints
);
router.delete("/:id", authenticateToken, deleteGuest);

export default router;
