import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats,
  bulkUpdateStock,
} from "../controllers/inventoryController.js";

const router = express.Router();

const inventoryValidation = [
  body("itemName")
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("category")
    .isIn([
      "food",
      "beverage",
      "alcohol",
      "cleaning",
      "packaging",
      "equipment",
      "other",
    ])
    .withMessage("Invalid category"),
  body("unit").isLength({ min: 1, max: 20 }).withMessage("Unit is required"),
  body("currentStock")
    .isFloat({ min: 0 })
    .withMessage("Current stock must be a positive number"),
  body("minimumStock")
    .isFloat({ min: 0 })
    .withMessage("Minimum stock must be a positive number"),
  body("reorderPoint")
    .isFloat({ min: 0 })
    .withMessage("Reorder point must be a positive number"),
  body("unitCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit cost must be a positive number"),
  body("isPerishable")
    .optional()
    .isBoolean()
    .withMessage("isPerishable must be a boolean"),
];

const stockUpdateValidation = [
  body("quantity").isFloat({ min: 0 }).withMessage("Valid quantity required"),
  body("type")
    .isIn(["add", "subtract"])
    .withMessage("Type must be add or subtract"),
];

const bulkStockUpdateValidation = [
  body("updates").isArray().withMessage("Updates must be an array"),
  body("updates.*.id").isUUID().withMessage("Valid item ID required"),
  body("updates.*.quantity")
    .isFloat({ min: 0 })
    .withMessage("Valid quantity required"),
  body("updates.*.type")
    .isIn(["add", "subtract"])
    .withMessage("Type must be add or subtract"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllInventory);
router.get("/stats", authenticateToken, getInventoryStats);
router.get("/low-stock", authenticateToken, getLowStockItems);
router.get("/expiring", authenticateToken, getExpiringItems);
router.get("/:id", authenticateToken, getInventoryById);
router.post(
  "/",
  authenticateToken,
  inventoryValidation,
  validateRequest,
  createInventoryItem
);
router.put(
  "/:id",
  authenticateToken,
  inventoryValidation,
  validateRequest,
  updateInventoryItem
);
router.delete("/:id", authenticateToken, deleteInventoryItem);

// Stock Management Routes
router.patch(
  "/:id/stock",
  authenticateToken,
  stockUpdateValidation,
  validateRequest,
  updateStock
);
router.patch(
  "/bulk-stock",
  authenticateToken,
  bulkStockUpdateValidation,
  validateRequest,
  bulkUpdateStock
);

export default router;
