import { Op } from "sequelize";
import { Shift, Outlet } from "../models/index.js";

export const getAllShifts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      shiftType,
      dateFrom,
      dateTo,
      search,
    } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (status) whereClause.status = status;
    if (shiftType) whereClause.shiftType = shiftType;

    if (dateFrom || dateTo) {
      whereClause.shiftDate = {};
      if (dateFrom) whereClause.shiftDate[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.shiftDate[Op.lte] = new Date(dateTo);
    }

    if (search) {
      whereClause[Op.or] = [
        { position: { [Op.iLike]: `%${search}%` } },
        { section: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const shifts = await Shift.findAndCountAll({
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
      order: [
        ["shiftDate", "DESC"],
        ["startTime", "ASC"],
      ],
    });

    res.json({
      shifts: shifts.rows,
      total: shifts.count,
      page: parseInt(page),
      totalPages: Math.ceil(shifts.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get shifts error:", error);
    res.status(500).json({ error: "Failed to fetch shifts" });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    res.json({ shift });
  } catch (error) {
    console.error("Get shift error:", error);
    res.status(500).json({ error: "Failed to fetch shift" });
  }
};

export const createShift = async (req, res) => {
  try {
    const shiftData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    const shift = await Shift.create(shiftData);

    const fullShift = await Shift.findByPk(shift.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.status(201).json({ shift: fullShift });
  } catch (error) {
    console.error("Create shift error:", error);
    res.status(500).json({ error: "Failed to create shift" });
  }
};

export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    await shift.update(req.body);

    const updatedShift = await Shift.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ shift: updatedShift });
  } catch (error) {
    console.error("Update shift error:", error);
    res.status(500).json({ error: "Failed to update shift" });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    // Only allow deletion of scheduled or cancelled shifts
    if (!["scheduled", "cancelled"].includes(shift.status)) {
      return res
        .status(400)
        .json({ error: "Only scheduled or cancelled shifts can be deleted" });
    }

    await shift.destroy();

    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Delete shift error:", error);
    res.status(500).json({ error: "Failed to delete shift" });
  }
};

export const getShiftStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const userOutletId = req.user.outletId;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { [Op.gte]: weekStart };
        break;
      case "month":
        dateFilter = {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
        };
        break;
      case "year":
        dateFilter = {
          [Op.gte]: new Date(now.getFullYear(), 0, 1),
        };
        break;
    }

    const [
      totalShifts,
      completedShifts,
      pendingShifts,
      totalHours,
      overtimeHours,
      byStatus,
      byType,
      avgHoursPerShift,
    ] = await Promise.all([
      Shift.count({
        where: { outletId: userOutletId, shiftDate: dateFilter },
      }),
      Shift.count({
        where: {
          outletId: userOutletId,
          status: "completed",
          shiftDate: dateFilter,
        },
      }),
      Shift.count({
        where: {
          outletId: userOutletId,
          status: { [Op.in]: ["scheduled", "confirmed"] },
          shiftDate: dateFilter,
        },
      }),
      Shift.findOne({
        where: { outletId: userOutletId, shiftDate: dateFilter },
        attributes: [
          [
            Shift.sequelize.fn("SUM", Shift.sequelize.col("total_hours")),
            "total",
          ],
        ],
        raw: true,
      }),
      Shift.findOne({
        where: { outletId: userOutletId, shiftDate: dateFilter },
        attributes: [
          [
            Shift.sequelize.fn("SUM", Shift.sequelize.col("overtime_hours")),
            "total",
          ],
        ],
        raw: true,
      }),
      Shift.findAll({
        where: { outletId: userOutletId, shiftDate: dateFilter },
        attributes: [
          "status",
          [Shift.sequelize.fn("COUNT", Shift.sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      }),
      Shift.findAll({
        where: { outletId: userOutletId, shiftDate: dateFilter },
        attributes: [
          "shiftType",
          [Shift.sequelize.fn("COUNT", Shift.sequelize.col("id")), "count"],
        ],
        group: ["shiftType"],
        raw: true,
      }),
      Shift.findOne({
        where: {
          outletId: userOutletId,
          totalHours: { [Op.ne]: null },
          shiftDate: dateFilter,
        },
        attributes: [
          [
            Shift.sequelize.fn("AVG", Shift.sequelize.col("total_hours")),
            "avg",
          ],
        ],
        raw: true,
      }),
    ]);

    res.json({
      stats: {
        totalShifts,
        completedShifts,
        pendingShifts,
        totalHours: parseFloat(totalHours?.total) || 0,
        overtimeHours: parseFloat(overtimeHours?.total) || 0,
        avgHoursPerShift: parseFloat(avgHoursPerShift?.avg) || 0,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item.shiftType] = parseInt(item.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get shift stats error:", error);
    res.status(500).json({ error: "Failed to fetch shift stats" });
  }
};

export const updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    await shift.update({ status });

    res.json({ message: "Shift status updated successfully" });
  } catch (error) {
    console.error("Update shift status error:", error);
    res.status(500).json({ error: "Failed to update shift status" });
  }
};

export const clockIn = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    if (shift.clockInTime) {
      return res.status(400).json({ error: "Already clocked in" });
    }

    const now = new Date();
    await shift.update({
      clockInTime: now,
      actualStartTime: now,
      status: "in_progress",
    });

    res.json({ message: "Clocked in successfully" });
  } catch (error) {
    console.error("Clock in error:", error);
    res.status(500).json({ error: "Failed to clock in" });
  }
};

export const clockOut = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    if (!shift.clockInTime) {
      return res.status(400).json({ error: "Not clocked in" });
    }

    if (shift.clockOutTime) {
      return res.status(400).json({ error: "Already clocked out" });
    }

    const now = new Date();
    const clockInTime = new Date(shift.clockInTime);
    const totalHours = (now - clockInTime) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8); // Assuming 8 hours is regular

    await shift.update({
      clockOutTime: now,
      actualEndTime: now,
      totalHours,
      overtimeHours,
      status: "completed",
    });

    res.json({ message: "Clocked out successfully" });
  } catch (error) {
    console.error("Clock out error:", error);
    res.status(500).json({ error: "Failed to clock out" });
  }
};

export const getTodaysShifts = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;
    const today = new Date().toISOString().split("T")[0];

    const shifts = await Shift.findAll({
      where: {
        outletId: userOutletId,
        shiftDate: today,
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["startTime", "ASC"]],
    });

    res.json({ shifts });
  } catch (error) {
    console.error("Get today's shifts error:", error);
    res.status(500).json({ error: "Failed to fetch today's shifts" });
  }
};

export const getUpcomingShifts = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userOutletId = req.user.outletId;
    const now = new Date();
    const futureDate = new Date(
      now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000
    );

    const shifts = await Shift.findAll({
      where: {
        outletId: userOutletId,
        status: { [Op.in]: ["scheduled", "confirmed"] },
        shiftDate: {
          [Op.between]: [now, futureDate],
        },
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [
        ["shiftDate", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    res.json({ shifts });
  } catch (error) {
    console.error("Get upcoming shifts error:", error);
    res.status(500).json({ error: "Failed to fetch upcoming shifts" });
  }
};

export const approveShift = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const shift = await Shift.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    await shift.update({
      isApproved: true,
      approvedAt: new Date(),
    });

    res.json({ message: "Shift approved successfully" });
  } catch (error) {
    console.error("Approve shift error:", error);
    res.status(500).json({ error: "Failed to approve shift" });
  }
};
