import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/tablesController.js";

const router = express.Router();

const tableValidation = [
  body("outletId").isUUID().withMessage("Invalid outlet ID"),
  body("tableNumber")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Table number is required and must be <= 20 chars"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("minCapacity").optional().isInt({ min: 1 }),
  body("maxCapacity").optional().isInt({ min: 1 }),
  body("tableType")
    .optional()
    .isIn([
      "standard",
      "booth",
      "bar",
      "high_top",
      "outdoor",
      "private",
      "vip",
      "wheelchair_accessible",
    ])
    .withMessage("Invalid table type"),
  body("status")
    .optional()
    .isIn([
      "available",
      "occupied",
      "reserved",
      "cleaning",
      "maintenance",
      "out_of_service",
    ])
    .withMessage("Invalid status"),
];

router.get("/", authenticateToken, getAllTables);
router.get("/:id", authenticateToken, getTableById);

router.post(
  "/",
  authenticateToken,
  requireRole(["org_admin", "general_manager"]),
  tableValidation,
  validateRequest,
  createTable
);
router.put(
  "/:id",
  authenticateToken,
  requireRole(["org_admin", "general_manager"]),
  tableValidation,
  validateRequest,
  updateTable
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["org_admin", "general_manager"]),
  deleteTable
);

export default router;
