import { Op } from "sequelize";
import { Staff, User, Outlet } from "../models/index.js";

export const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, isActive, search } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (department) whereClause.department = department;
    if (isActive !== undefined) whereClause.isActive = isActive === "true";

    if (search) {
      whereClause[Op.or] = [
        { employeeId: { [Op.iLike]: `%${search}%` } },
        { position: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const staff = await Staff.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["employeeId", "ASC"]],
    });

    res.json({
      staff: staff.rows,
      total: staff.count,
      page: parseInt(page),
      totalPages: Math.ceil(staff.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const staffMember = await Staff.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json({ staff: staffMember });
  } catch (error) {
    console.error("Get staff member error:", error);
    res.status(500).json({ error: "Failed to fetch staff member" });
  }
};

export const createStaff = async (req, res) => {
  try {
    const staffData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    // Validate and clean date fields
    if (
      staffData.terminationDate === "" ||
      staffData.terminationDate === "Invalid date"
    ) {
      staffData.terminationDate = null;
    }

    if (staffData.hireDate === "" || staffData.hireDate === "Invalid date") {
      return res
        .status(400)
        .json({ error: "Hire date is required and must be valid" });
    }

    // Generate employee ID if not provided
    if (!staffData.employeeId) {
      const outletCode = req.user.outlet?.code || "OUT";
      const count = await Staff.count({
        where: { outletId: req.user.outletId },
      });
      staffData.employeeId = `${outletCode}${String(count + 1).padStart(
        4,
        "0"
      )}`;
    }

    const staffMember = await Staff.create(staffData);

    const fullStaffMember = await Staff.findByPk(staffMember.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.status(201).json({ staff: fullStaffMember });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ error: "Failed to create staff member" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const staffMember = await Staff.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Validate and clean date fields
    const updateData = { ...req.body };
    if (
      updateData.terminationDate === "" ||
      updateData.terminationDate === "Invalid date"
    ) {
      updateData.terminationDate = null;
    }

    if (updateData.hireDate === "" || updateData.hireDate === "Invalid date") {
      return res
        .status(400)
        .json({ error: "Hire date is required and must be valid" });
    }

    await staffMember.update(updateData);

    const updatedStaffMember = await Staff.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ staff: updatedStaffMember });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ error: "Failed to update staff member" });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const staffMember = await Staff.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Soft delete by setting termination date and inactive status
    await staffMember.update({
      isActive: false,
      terminationDate: new Date(),
    });

    res.json({ message: "Staff member terminated successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ error: "Failed to terminate staff member" });
  }
};

export const getStaffStats = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const [totalStaff, activeStaff, newHires, byDepartment, avgPerformance] =
      await Promise.all([
        Staff.count({ where: { outletId: userOutletId } }),
        Staff.count({ where: { outletId: userOutletId, isActive: true } }),
        Staff.count({
          where: {
            outletId: userOutletId,
            isActive: true,
            hireDate: {
              [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
        }),
        Staff.findAll({
          where: { outletId: userOutletId, isActive: true },
          attributes: [
            "department",
            [Staff.sequelize.fn("COUNT", Staff.sequelize.col("id")), "count"],
          ],
          group: ["department"],
          raw: true,
        }),
        Staff.findOne({
          where: { outletId: userOutletId, isActive: true },
          attributes: [
            [
              Staff.sequelize.fn(
                "AVG",
                Staff.sequelize.col("performance_rating")
              ),
              "avgRating",
            ],
          ],
          raw: true,
        }),
      ]);

    res.json({
      stats: {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        newHires,
        byDepartment: byDepartment.reduce((acc, item) => {
          acc[item.department] = parseInt(item.count);
          return acc;
        }, {}),
        avgPerformance: parseFloat(avgPerformance?.avgRating) || 0,
      },
    });
  } catch (error) {
    console.error("Get staff stats error:", error);
    res.status(500).json({ error: "Failed to fetch staff stats" });
  }
};

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { performanceRating, reviewNotes } = req.body;
    const userOutletId = req.user.outletId;

    const staffMember = await Staff.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    await staffMember.update({
      performanceRating,
      lastReviewDate: new Date(),
      notes: reviewNotes
        ? `${
            staffMember.notes || ""
          }\n\nPerformance Review (${new Date().toLocaleDateString()}): ${reviewNotes}`.trim()
        : staffMember.notes,
    });

    // Fetch the updated staff member with associations
    const updatedStaffMember = await Staff.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ staff: updatedStaffMember });
  } catch (error) {
    console.error("Update performance error:", error);
    res.status(500).json({ error: "Failed to update performance" });
  }
};

export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userOutletId = req.user.outletId;

    const staffMember = await Staff.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!staffMember) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    await staffMember.update({
      isActive: status,
    });

    // Fetch the updated staff member with associations
    const updatedStaffMember = await Staff.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ staff: updatedStaffMember });
  } catch (error) {
    console.error("Update staff status error:", error);
    res.status(500).json({ error: "Failed to update staff status" });
  }
};

export const getNewHires = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const userOutletId = req.user.outletId;
    const cutoffDate = new Date(
      Date.now() - parseInt(days) * 24 * 60 * 60 * 1000
    );

    const newHires = await Staff.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        hireDate: {
          [Op.gte]: cutoffDate,
        },
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["hireDate", "DESC"]],
    });

    res.json({ newHires });
  } catch (error) {
    console.error("Get new hires error:", error);
    res.status(500).json({ error: "Failed to fetch new hires" });
  }
};

export const getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const userOutletId = req.user.outletId;

    const staff = await Staff.findAll({
      where: {
        outletId: userOutletId,
        department,
        isActive: true,
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["employeeId", "ASC"]],
    });

    res.json({ staff });
  } catch (error) {
    console.error("Get staff by department error:", error);
    res.status(500).json({ error: "Failed to fetch staff by department" });
  }
};
