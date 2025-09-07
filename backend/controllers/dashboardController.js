import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  Order,
  Reservation,
  Guest,
  User,
  Outlet,
  Payment,
  Inventory,
  MenuItem,
  Table,
  Staff,
} from "../models/index.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;

    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    // Get comprehensive stats
    const [
      todayOrders,
      todayReservations,
      todayRevenue,
      totalGuests,
      weeklyRevenue,
      monthlyRevenue,
      pendingOrders,
      confirmedReservations,
      lowStockItems,
      totalTables,
      occupiedTables,
      totalMenuItems,
      avgOrderValue,
    ] = await Promise.all([
      Order.count({
        where: {
          ...whereClause,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      }),
      Reservation.count({
        where: {
          ...whereClause,
          reservationDate: { [Op.eq]: today.toISOString().split("T")[0] },
        },
      }),
      Payment.sum("amount", {
        where: {
          ...whereClause,
          paymentStatus: "completed",
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      }),
      Guest.count({ where: { isActive: true } }),
      Payment.sum("amount", {
        where: {
          ...whereClause,
          paymentStatus: "completed",
          createdAt: { [Op.gte]: startOfWeek },
        },
      }),
      Payment.sum("amount", {
        where: {
          ...whereClause,
          paymentStatus: "completed",
          createdAt: { [Op.gte]: startOfMonth },
        },
      }),
      Order.count({
        where: {
          ...whereClause,
          status: { [Op.in]: ["pending", "confirmed"] },
        },
      }),
      Reservation.count({
        where: {
          ...whereClause,
          status: "confirmed",
          reservationDate: { [Op.gte]: today.toISOString().split("T")[0] },
        },
      }),
      Inventory.count({
        where: {
          ...whereClause,
          isActive: true,
          [Op.and]: [
            sequelize.where(
              sequelize.col("current_stock"),
              Op.lte,
              sequelize.col("reorder_point")
            ),
          ],
        },
      }),
      Table.count({ where: whereClause }),
      Table.count({ where: { ...whereClause, status: "occupied" } }),
      MenuItem.count({ where: { ...whereClause, isAvailable: true } }),
      Order.findOne({
        where: { ...whereClause, createdAt: { [Op.gte]: startOfMonth } },
        attributes: [
          [
            Order.sequelize.fn("AVG", Order.sequelize.col("total_amount")),
            "avgValue",
          ],
        ],
        raw: true,
      }),
    ]);

    res.json({
      stats: {
        todayOrders: todayOrders || 0,
        todayReservations: todayReservations || 0,
        todayRevenue: todayRevenue || 0,
        totalGuests: totalGuests || 0,
        weeklyRevenue: weeklyRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingOrders: pendingOrders || 0,
        confirmedReservations: confirmedReservations || 0,
        lowStockItems: lowStockItems || 0,
        totalTables: totalTables || 0,
        occupiedTables: occupiedTables || 0,
        availableTables: (totalTables || 0) - (occupiedTables || 0),
        totalMenuItems: totalMenuItems || 0,
        avgOrderValue: parseFloat(avgOrderValue?.avgValue) || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;

    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;
    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    const [recentOrders, recentReservations] = await Promise.all([
      Order.findAll({
        where: whereClause,
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
      }),
      Reservation.findAll({
        where: whereClause,
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "reservationNumber",
          "partySize",
          "status",
          "reservationDate",
        ],
      }),
    ]);

    res.json({ recentOrders, recentReservations });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};

export const getRevenueChart = async (req, res) => {
  try {
    const { period = "week", outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;
    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    let days = 7;
    if (period === "month") days = 30;

    const revenueData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const revenue = await Payment.sum("amount", {
        where: {
          ...whereClause,
          paymentStatus: "completed",
          createdAt: { [Op.between]: [dayStart, dayEnd] },
        },
      });

      revenueData.push({
        date: dayStart.toISOString().split("T")[0],
        revenue: revenue || 0,
      });
    }

    res.json({ revenueData });
  } catch (error) {
    console.error("Revenue chart error:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
};

export const getTopMenuItems = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const topItems = await MenuItem.findAll({
      where: { outletId: targetOutletId },
      attributes: [
        "id",
        "name",
        "price",
        [
          MenuItem.sequelize.literal(
            '(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.menu_item_id = MenuItem.id AND o.created_at >= "' +
              startOfMonth.toISOString() +
              '")'
          ),
          "totalSold",
        ],
      ],
      order: [[MenuItem.sequelize.literal("totalSold"), "DESC"]],
      limit: 5,
    });

    res.json({ topMenuItems: topItems });
  } catch (error) {
    console.error("Top menu items error:", error);
    res.status(500).json({ error: "Failed to fetch top menu items" });
  }
};

export const getOrderStatusDistribution = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    const orderStatusData = await Order.findAll({
      where: whereClause,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const statusColors = {
      pending: "#F59E0B",
      confirmed: "#10B981",
      preparing: "#3B82F6",
      completed: "#8B5CF6",
      cancelled: "#EF4444",
      delivered: "#10B981",
    };

    const formattedData = orderStatusData.map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: parseInt(item.count),
      color: statusColors[item.status] || "#6B7280",
    }));

    res.json({ orderStatusData: formattedData });
  } catch (error) {
    console.error("Order status distribution error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch order status distribution" });
  }
};

export const getGuestActivityData = async (req, res) => {
  try {
    const { outletId, days = 7 } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};
    const guestActivityData = [];

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [newGuests, returningGuests] = await Promise.all([
        Guest.count({
          where: {
            ...whereClause,
            createdAt: { [Op.between]: [dayStart, dayEnd] },
          },
        }),
        Guest.count({
          where: {
            ...whereClause,
            lastVisitAt: { [Op.between]: [dayStart, dayEnd] },
            createdAt: { [Op.lt]: dayStart },
          },
        }),
      ]);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      guestActivityData.push({
        name: dayNames[date.getDay()],
        new: newGuests || 0,
        returning: returningGuests || 0,
      });
    }

    res.json({ guestActivityData });
  } catch (error) {
    console.error("Guest activity data error:", error);
    res.status(500).json({ error: "Failed to fetch guest activity data" });
  }
};

export const getInventoryStatusData = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId
      ? { outletId: targetOutletId, isActive: true }
      : { isActive: true };

    const [inStock, lowStock, outOfStock, expiringSoon] = await Promise.all([
      Inventory.count({
        where: {
          ...whereClause,
          [Op.and]: [
            sequelize.where(
              sequelize.col("current_stock"),
              Op.gt,
              sequelize.col("reorder_point")
            ),
            sequelize.where(sequelize.col("current_stock"), Op.gt, 0),
          ],
        },
      }),
      Inventory.count({
        where: {
          ...whereClause,
          [Op.and]: [
            sequelize.where(
              sequelize.col("current_stock"),
              Op.lte,
              sequelize.col("reorder_point")
            ),
            sequelize.where(sequelize.col("current_stock"), Op.gt, 0),
          ],
        },
      }),
      Inventory.count({
        where: {
          ...whereClause,
          current_stock: 0,
        },
      }),
      Inventory.count({
        where: {
          ...whereClause,
          expiryDate: {
            [Op.between]: [
              new Date(),
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ],
          },
        },
      }),
    ]);

    const inventoryData = [
      { name: "In Stock", value: inStock || 0, color: "#10B981" },
      { name: "Low Stock", value: lowStock || 0, color: "#F59E0B" },
      { name: "Out of Stock", value: outOfStock || 0, color: "#EF4444" },
      { name: "Expiring Soon", value: expiringSoon || 0, color: "#8B5CF6" },
    ];

    res.json({ inventoryData });
  } catch (error) {
    console.error("Inventory status data error:", error);
    res.status(500).json({ error: "Failed to fetch inventory status data" });
  }
};

export const getTableStatusData = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    const [available, occupied, cleaning, reserved] = await Promise.all([
      Table.count({
        where: { ...whereClause, status: "available" },
      }),
      Table.count({
        where: { ...whereClause, status: "occupied" },
      }),
      Table.count({
        where: { ...whereClause, status: "cleaning" },
      }),
      Table.count({
        where: { ...whereClause, status: "reserved" },
      }),
    ]);

    const tableStatusData = [
      { name: "Available", value: available || 0, color: "#10B981" },
      { name: "Occupied", value: occupied || 0, color: "#3B82F6" },
      { name: "Cleaning", value: cleaning || 0, color: "#F59E0B" },
      { name: "Reserved", value: reserved || 0, color: "#8B5CF6" },
    ];

    res.json({ tableStatusData });
  } catch (error) {
    console.error("Table status data error:", error);
    res.status(500).json({ error: "Failed to fetch table status data" });
  }
};

export const getStaffStatusData = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId
      ? { outletId: targetOutletId, isActive: true }
      : { isActive: true };

    // Get staff counts by department since we don't have status/isOvertime columns
    const [total, frontOfHouse, backOfHouse, kitchen, bar, management] =
      await Promise.all([
        Staff.count({ where: whereClause }),
        Staff.count({
          where: { ...whereClause, department: "front_of_house" },
        }),
        Staff.count({
          where: { ...whereClause, department: "back_of_house" },
        }),
        Staff.count({
          where: { ...whereClause, department: "kitchen" },
        }),
        Staff.count({
          where: { ...whereClause, department: "bar" },
        }),
        Staff.count({
          where: { ...whereClause, department: "management" },
        }),
      ]);

    res.json({
      staff: {
        total: total || 0,
        frontOfHouse: frontOfHouse || 0,
        backOfHouse: backOfHouse || 0,
        kitchen: kitchen || 0,
        bar: bar || 0,
        management: management || 0,
      },
    });
  } catch (error) {
    console.error("Staff status data error:", error);
    res.status(500).json({ error: "Failed to fetch staff status data" });
  }
};

export const getTicketStats = async (req, res) => {
  try {
    const { outletId } = req.query;
    const userOutletId = req.user.outletId;
    const targetOutletId =
      req.user.role === "org_admin" ? outletId || userOutletId : userOutletId;

    const whereClause = targetOutletId ? { outletId: targetOutletId } : {};

    const [open, resolved, critical] = await Promise.all([
      sequelize.models.Ticket.count({
        where: { ...whereClause, status: "open" },
      }),
      sequelize.models.Ticket.count({
        where: { ...whereClause, status: "resolved" },
      }),
      sequelize.models.Ticket.count({
        where: { ...whereClause, priority: "critical" },
      }),
    ]);

    res.json({
      tickets: {
        open: open || 0,
        resolved: resolved || 0,
        critical: critical || 0,
      },
    });
  } catch (error) {
    console.error("Ticket stats error:", error);
    res.status(500).json({ error: "Failed to fetch ticket stats" });
  }
};
