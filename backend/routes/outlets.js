import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getPublicOutlets,
  getAllOutlets,
  getOutletById,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  getOutletStats,
} from "../controllers/outletController.js";

const router = express.Router();

// Validation rules
const outletValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Outlet name must be between 2 and 100 characters"),
  body("code")
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Outlet code must be between 2 and 20 characters"),
  body("type")
    .isIn(["restaurant", "nightclub", "hq"])
    .withMessage("Outlet type must be restaurant, nightclub, or hq"),
  body("timezone")
    .optional()
    .isString()
    .withMessage("Timezone must be a valid string"),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code"),
];

// Routes
router.get("/public", getPublicOutlets); // Public endpoint for login
router.get("/", authenticateToken, getAllOutlets);
router.get("/:id", authenticateToken, getOutletById);
router.get("/:id/stats", authenticateToken, getOutletStats);

// Admin only routes
router.post(
  "/",
  authenticateToken,
  requireRole(["org_admin"]),
  outletValidation,
  validateRequest,
  createOutlet
);

router.put(
  "/:id",
  authenticateToken,
  requireRole(["org_admin", "general_manager"]),
  outletValidation,
  validateRequest,
  updateOutlet
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole(["org_admin"]),
  deleteOutlet
);

export default router;
