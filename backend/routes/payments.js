import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
  processPayment,
  refundPayment,
  getPaymentMethods,
} from "../controllers/paymentController.js";

const router = express.Router();

const paymentValidation = [
  body("orderId").isUUID().withMessage("Valid order ID required"),
  body("amount").isFloat({ min: 0 }).withMessage("Valid amount required"),
  body("paymentMethod")
    .isIn([
      "cash",
      "credit_card",
      "debit_card",
      "mobile_money",
      "bank_transfer",
      "gift_card",
      "voucher",
      "split",
    ])
    .withMessage("Invalid payment method"),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("tipAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tip amount must be positive"),
  body("serviceCharge")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Service charge must be positive"),
  body("taxAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax amount must be positive"),
  body("discountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be positive"),
];

const processPaymentValidation = [
  body("transactionId")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Transaction ID must be between 1 and 100 characters"),
  body("referenceNumber")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Reference number must be between 1 and 100 characters"),
];

const refundValidation = [
  body("refundReason")
    .isLength({ min: 1, max: 200 })
    .withMessage("Refund reason must be between 1 and 200 characters"),
  body("refundAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Refund amount must be positive"),
];

// CRUD Routes
router.get("/", authenticateToken, getAllPayments);
router.get("/stats", authenticateToken, getPaymentStats);
router.get("/methods", authenticateToken, getPaymentMethods);
router.get("/:id", authenticateToken, getPaymentById);
router.post(
  "/",
  authenticateToken,
  paymentValidation,
  validateRequest,
  createPayment
);
router.put(
  "/:id",
  authenticateToken,
  paymentValidation,
  validateRequest,
  updatePayment
);
router.delete("/:id", authenticateToken, deletePayment);

// Payment Processing Routes
router.patch(
  "/:id/process",
  authenticateToken,
  processPaymentValidation,
  validateRequest,
  processPayment
);
router.patch(
  "/:id/refund",
  authenticateToken,
  refundValidation,
  validateRequest,
  refundPayment
);

export default router;
