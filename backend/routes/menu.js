import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuStats,
} from "../controllers/menuController.js";

const router = express.Router();

const menuItemValidation = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("category")
    .isIn([
      "appetizer",
      "main_course",
      "dessert",
      "beverage",
      "alcoholic",
      "non_alcoholic",
      "special",
      "side_dish",
    ])
    .withMessage("Valid category required"),
  body("price")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Valid price required"),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("Availability must be boolean"),
];

router.get("/", authenticateToken, getAllMenuItems);
router.get("/stats", authenticateToken, getMenuStats);
router.get("/:id", authenticateToken, getMenuItemById);
router.post(
  "/",
  authenticateToken,
  menuItemValidation,
  validateRequest,
  createMenuItem
);
router.put(
  "/:id",
  authenticateToken,
  menuItemValidation,
  validateRequest,
  updateMenuItem
);
router.delete("/:id", authenticateToken, deleteMenuItem);

export default router;
