import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "order_number",
    },
    outletId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "outlet_id",
      references: {
        model: "outlets",
        key: "id",
      },
    },
    // tableId removed to simplify associations
    // reservationId removed to simplify associations
    // guestId removed to simplify associations
    // serverId removed to simplify associations
    orderType: {
      type: DataTypes.ENUM(
        "dine_in",
        "takeaway",
        "delivery",
        "bar",
        "bottle_service"
      ),
      allowNull: false,
      defaultValue: "dine_in",
      field: "order_type",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("normal", "high", "urgent", "vip"),
      allowNull: false,
      defaultValue: "normal",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: "tax_amount",
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: "discount_amount",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: "total_amount",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "partial", "paid", "refunded"),
      allowNull: false,
      defaultValue: "pending",
      field: "payment_status",
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "cash",
        "card",
        "mobile_money",
        "bank_transfer",
        "gift_card"
      ),
      allowNull: true,
      field: "payment_method",
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "special_instructions",
    },
    estimatedReadyTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "estimated_ready_time",
    },
    actualReadyTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "actual_ready_time",
    },
    servedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "served_at",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cancelled_at",
    },
    cancellationReason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "cancellation_reason",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
    // Audit fields removed to avoid MySQL key limit issues
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

// Instance methods
Order.prototype.getOrderTime = function () {
  if (this.completedAt && this.createdAt) {
    const created = new Date(this.createdAt);
    const completed = new Date(this.completedAt);
    return Math.floor((completed - created) / (1000 * 60)); // minutes
  }
  return null;
};

Order.prototype.getPreparationTime = function () {
  if (this.actualReadyTime && this.createdAt) {
    const created = new Date(this.createdAt);
    const ready = new Date(this.actualReadyTime);
    return Math.floor((ready - created) / (1000 * 60)); // minutes
  }
  return null;
};

Order.prototype.isOverdue = function () {
  if (!this.estimatedReadyTime) return false;
  const now = new Date();
  const estimated = new Date(this.estimatedReadyTime);
  return (
    now > estimated &&
    this.status !== "completed" &&
    this.status !== "cancelled"
  );
};

export default Order;
