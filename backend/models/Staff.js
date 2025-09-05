import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Staff = sequelize.define(
  "Staff",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // userId removed to simplify associations
    outletId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "outlet_id",
      references: {
        model: "outlets",
        key: "id",
      },
    },
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: "employee_id",
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.ENUM(
        "front_of_house",
        "back_of_house",
        "kitchen",
        "bar",
        "management",
        "security",
        "cleaning",
        "maintenance"
      ),
      allowNull: false,
    },
    // departmentId: {
    //   type: DataTypes.UUID,
    //   allowNull: true,
    //   field: "department_id",
    //   references: {
    //     model: "departments",
    //     key: "id",
    //   },
    // },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "hire_date",
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "termination_date",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: "hourly_rate",
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    payFrequency: {
      type: DataTypes.ENUM("hourly", "weekly", "biweekly", "monthly"),
      allowNull: false,
      defaultValue: "hourly",
      field: "pay_frequency",
    },
    emergencyContact: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "emergency_contact",
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    performanceRating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      field: "performance_rating",
    },
    lastReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_review_date",
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: "staff",
    timestamps: true,
    underscored: true,
  }
);

// Instance methods
Staff.prototype.getTenure = function () {
  const now = new Date();
  const hire = new Date(this.hireDate);
  const diffTime = now - hire;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  return { years, months, days };
};

Staff.prototype.isNewHire = function () {
  const now = new Date();
  const hire = new Date(this.hireDate);
  const diffTime = now - hire;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 90; // First 90 days
};

Staff.prototype.getPayRate = function () {
  if (this.hourlyRate) {
    return this.hourlyRate;
  } else if (this.salary) {
    // Convert salary to hourly rate (assuming 40 hours per week)
    const weeklyHours = 40;
    const weeksPerYear = 52;
    return this.salary / (weeklyHours * weeksPerYear);
  }
  return null;
};

export default Staff;
