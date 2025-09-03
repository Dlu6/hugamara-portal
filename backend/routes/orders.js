import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

const orderValidation = [
  body("orderType")
    .isIn(["dine_in", "takeaway", "delivery", "bar", "bottle_service"])
    .withMessage("Valid order type required"),
  body("items").optional().isArray().withMessage("Items must be an array"),
  body("tableId")
    .optional()
    .isUUID()
    .withMessage("Table ID must be a valid UUID"),
  body("reservationId")
    .optional()
    .isUUID()
    .withMessage("Reservation ID must be a valid UUID"),
  body("guestId")
    .optional()
    .isUUID()
    .withMessage("Guest ID must be a valid UUID"),
  body("priority")
    .optional()
    .isIn(["normal", "high", "urgent", "vip"])
    .withMessage("Valid priority required"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "mobile_money", "bank_transfer", "gift_card"])
    .withMessage("Valid payment method required"),
];

const statusValidation = [
  body("status")
    .isIn([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "completed",
      "cancelled",
    ])
    .withMessage("Valid status required"),
];

router.get("/", authenticateToken, getAllOrders);
router.get("/:id", authenticateToken, getOrderById);
router.post(
  "/",
  authenticateToken,
  orderValidation,
  validateRequest,
  createOrder
);
router.put(
  "/:id",
  authenticateToken,
  orderValidation,
  validateRequest,
  updateOrder
);
router.patch(
  "/:id/status",
  authenticateToken,
  statusValidation,
  validateRequest,
  updateOrderStatus
);
router.delete("/:id", authenticateToken, deleteOrder);

export default router;
