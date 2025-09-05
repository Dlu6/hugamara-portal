import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    outletId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Outlets",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    tableName: "departments",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name", "outletId"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["outletId"],
      },
    ],
  }
);

// Define associations
Department.associate = (models) => {
  // Department belongs to Outlet
  Department.belongsTo(models.Outlet, {
    foreignKey: "outletId",
    as: "outlet",
  });

  // Department belongs to User (creator)
  Department.belongsTo(models.User, {
    foreignKey: "createdBy",
    as: "creator",
  });

  // Department belongs to User (updater)
  Department.belongsTo(models.User, {
    foreignKey: "updatedBy",
    as: "updater",
  });

  // Department has many Staff
  Department.hasMany(models.Staff, {
    foreignKey: "departmentId",
    as: "staff",
  });
};

export default Department;
