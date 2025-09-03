import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Outlet = sequelize.define(
  "Outlet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("restaurant", "nightclub", "hq"),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Uganda",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Africa/Kampala",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "UGX",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    operatingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "operating_hours",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "outlets",
    timestamps: true,
    underscored: true,
  }
);

// Instance methods
Outlet.prototype.getOperatingHoursForDay = function (dayOfWeek) {
  if (!this.operatingHours || !this.operatingHours[dayOfWeek]) {
    return null;
  }
  return this.operatingHours[dayOfWeek];
};

Outlet.prototype.isOpen = function () {
  const now = new Date();

  const tz = this.timezone || "Africa/Kampala";

  // Get weekday name in outlet timezone
  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: tz,
  })
    .format(now)
    .toLowerCase();

  // Get HH:MM in outlet timezone
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(now);
  const currentTime = timeParts; // already HH:MM

  const hours = this.getOperatingHoursForDay(dayOfWeek);
  if (!hours || !hours.isOpen) return false;

  if (!hours.open || !hours.close) return false;

  // Simple same-day window comparison (HH:MM lexicographic works)
  return currentTime >= hours.open && currentTime <= hours.close;
};

export default Outlet;
