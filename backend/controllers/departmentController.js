import { Department, Outlet, User, Staff } from "../models/index.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../middleware/errorHandler.js";

/**
 * Get all departments with optional filtering
 */
export const getAllDepartments = async (req, res) => {
  try {
    const { outletId, isActive, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (outletId) {
      whereClause.outletId = outletId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: departments } = await Department.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch department",
    });
  }
};

/**
 * Create new department
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, description, outletId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !name.trim()) {
      throw new ValidationError("Department name is required");
    }

    // Check if department name already exists for this outlet
    const existingDepartment = await Department.findOne({
      where: {
        name: name.trim(),
        outletId: outletId || null,
      },
    });

    if (existingDepartment) {
      throw new ValidationError("Department with this name already exists");
    }

    // Create department
    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || null,
      outletId: outletId || null,
      createdBy: userId,
      updatedBy: userId,
    });

    // Fetch the created department with associations
    const createdDepartment = await Department.findByPk(department.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: createdDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create department",
    });
  }
};

/**
 * Update department
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const userId = req.user.id;

    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Check if name is being changed and if it conflicts
    if (name && name.trim() !== department.name) {
      const existingDepartment = await Department.findOne({
        where: {
          name: name.trim(),
          outletId: department.outletId,
          id: { [Op.ne]: id },
        },
      });

      if (existingDepartment) {
        throw new ValidationError("Department with this name already exists");
      }
    }

    // Update department
    await department.update({
      name: name?.trim() || department.name,
      description: description?.trim() || department.description,
      isActive: isActive !== undefined ? isActive : department.isActive,
      updatedBy: userId,
    });

    // Fetch updated department with associations
    const updatedDepartment = await Department.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update department",
    });
  }
};

/**
 * Delete department
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Check if department has staff members
    const staffCount = await Staff.count({
      where: { departmentId: id },
    });

    if (staffCount > 0) {
      throw new ValidationError(
        "Cannot delete department with active staff members. Please reassign staff first."
      );
    }

    await department.destroy();

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete department",
    });
  }
};

/**
 * Get department statistics
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const { outletId } = req.query;

    const whereClause = {};
    if (outletId) {
      whereClause.outletId = outletId;
    }

    const stats = await Department.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalDepartments"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal('CASE WHEN "isActive" = true THEN 1 END')
          ),
          "activeDepartments",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal('CASE WHEN "isActive" = false THEN 1 END')
          ),
          "inactiveDepartments",
        ],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: stats[0] || {
        totalDepartments: 0,
        activeDepartments: 0,
        inactiveDepartments: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department statistics",
      error: error.message,
    });
  }
};
