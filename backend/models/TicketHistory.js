import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TicketHistory = sequelize.define(
  "TicketHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "ticket_id",
      references: {
        model: "tickets",
        key: "id",
      },
    },
    action: {
      type: DataTypes.ENUM(
        "created",
        "status_changed",
        "assigned",
        "escalated",
        "commented",
        "priority_changed",
        "category_changed",
        "resolved",
        "closed",
        "reopened"
      ),
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "old_value",
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "new_value",
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "performed_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    tableName: "ticket_history",
    timestamps: true,
    underscored: true,
  }
);

// Instance methods
TicketHistory.prototype.getActionDescription = function () {
  const actionDescriptions = {
    created: "Ticket created",
    status_changed: `Status changed from "${this.oldValue}" to "${this.newValue}"`,
    assigned: `Assigned to ${this.newValue}`,
    escalated: `Escalated to level ${this.newValue}`,
    commented: "Comment added",
    priority_changed: `Priority changed from "${this.oldValue}" to "${this.newValue}"`,
    category_changed: `Category changed from "${this.oldValue}" to "${this.newValue}"`,
    resolved: "Ticket resolved",
    closed: "Ticket closed",
    reopened: "Ticket reopened",
  };
  return actionDescriptions[this.action] || "Action performed";
};

export default TicketHistory;
