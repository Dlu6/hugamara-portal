import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  Order,
  OrderItem,
  MenuItem,
  Payment,
  Reservation,
  Event,
  Staff,
  Inventory,
  Outlet,
  Guest,
} from "../models/index.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const userOutletId = req.user.outletId;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "today":
        dateFilter = {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        };
        break;
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
      totalOrders,
      totalRevenue,
      totalReservations,
      totalEvents,
      totalStaff,
      totalInventory,
      avgOrderValue,
      topMenuItems,
      recentOrders,
      lowStockItems,
    ] = await Promise.all([
      Order.count({
        where: { outletId: userOutletId, createdAt: dateFilter },
      }),
      Payment.findOne({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          [
            Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")),
            "total",
          ],
        ],
        raw: true,
      }),
      Reservation.count({
        where: { outletId: userOutletId, createdAt: dateFilter },
      }),
      Event.count({
        where: { outletId: userOutletId, startDate: dateFilter },
      }),
      Staff.count({
        where: { outletId: userOutletId, isActive: true },
      }),
      Inventory.count({
        where: { outletId: userOutletId, isActive: true },
      }),
      Order.findOne({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          [
            Order.sequelize.fn("AVG", Order.sequelize.col("total_amount")),
            "avg",
          ],
        ],
        raw: true,
      }),
      OrderItem.findAll({
        where: {
          "$order.outlet_id$": userOutletId,
          "$order.created_at$": dateFilter,
        },
        include: [
          {
            model: Order,
            as: "order",
            attributes: [],
          },
          {
            model: MenuItem,
            as: "menuItem",
            attributes: ["id", "name", "price"],
          },
        ],
        attributes: [
          "menuItemId",
          [
            OrderItem.sequelize.fn("SUM", OrderItem.sequelize.col("quantity")),
            "totalQuantity",
          ],
          [
            OrderItem.sequelize.fn(
              "SUM",
              OrderItem.sequelize.literal("quantity * price")
            ),
            "totalRevenue",
          ],
        ],
        group: ["menuItemId", "menuItem.id", "menuItem.name", "menuItem.price"],
        order: [[OrderItem.sequelize.literal("totalQuantity"), "DESC"]],
        limit: 5,
        raw: true,
      }),
      Order.findAll({
        where: { outletId: userOutletId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        include: [
          {
            model: Outlet,
            as: "outlet",
            attributes: ["name"],
          },
        ],
      }),
      Inventory.findAll({
        where: {
          outletId: userOutletId,
          isActive: true,
          [Op.and]: [
            sequelize.where(
              sequelize.col("current_stock"),
              Op.lte,
              sequelize.col("reorder_point")
            ),
          ],
        },
        limit: 5,
      }),
    ]);

    res.json({
      stats: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue?.total) || 0,
        totalReservations,
        totalEvents,
        totalStaff,
        totalInventory,
        avgOrderValue: parseFloat(avgOrderValue?.avg) || 0,
        topMenuItems: topMenuItems.map((item) => ({
          id: item.menuItemId,
          name: item["menuItem.name"],
          quantity: parseInt(item.totalQuantity),
          revenue: parseFloat(item.totalRevenue),
        })),
        recentOrders,
        lowStockItems,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    let groupFormat;
    switch (groupBy) {
      case "hour":
        groupFormat = "%Y-%m-%d %H:00:00";
        break;
      case "day":
        groupFormat = "%Y-%m-%d";
        break;
      case "week":
        groupFormat = "%Y-%u";
        break;
      case "month":
        groupFormat = "%Y-%m";
        break;
      default:
        groupFormat = "%Y-%m-%d";
    }

    const revenueData = await Payment.findAll({
      where: whereClause,
      attributes: [
        [
          Payment.sequelize.fn(
            "DATE_FORMAT",
            Payment.sequelize.col("createdAt"),
            groupFormat
          ),
          "period",
        ],
        [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "total"],
        [
          Payment.sequelize.fn("AVG", Payment.sequelize.col("amount")),
          "average",
        ],
      ],
      group: [
        Payment.sequelize.fn(
          "DATE_FORMAT",
          Payment.sequelize.col("createdAt"),
          groupFormat
        ),
      ],
      order: [
        [
          Payment.sequelize.fn(
            "DATE_FORMAT",
            Payment.sequelize.col("createdAt"),
            groupFormat
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    const paymentMethodData = await Payment.findAll({
      where: whereClause,
      attributes: [
        "paymentMethod",
        [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "total"],
      ],
      group: ["paymentMethod"],
      raw: true,
    });

    res.json({
      revenueData: revenueData.map((item) => ({
        period: item.period,
        count: parseInt(item.count),
        total: parseFloat(item.total),
        average: parseFloat(item.average),
      })),
      paymentMethodData: paymentMethodData.map((item) => ({
        method: item.paymentMethod,
        count: parseInt(item.count),
        total: parseFloat(item.total),
      })),
    });
  } catch (error) {
    console.error("Get revenue report error:", error);
    res.status(500).json({ error: "Failed to fetch revenue report" });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { "$order.outlet_id$": userOutletId };

    if (startDate && endDate) {
      whereClause["$order.created_at$"] = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (category) {
      whereClause["$menuItem.category$"] = category;
    }

    const salesData = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
        },
        {
          model: MenuItem,
          as: "menuItem",
          attributes: ["id", "name", "category", "price"],
        },
      ],
      attributes: [
        "menuItemId",
        [
          OrderItem.sequelize.fn("SUM", OrderItem.sequelize.col("quantity")),
          "totalQuantity",
        ],
        [
          OrderItem.sequelize.fn(
            "SUM",
            OrderItem.sequelize.literal("quantity * price")
          ),
          "totalRevenue",
        ],
        [
          OrderItem.sequelize.fn("AVG", OrderItem.sequelize.col("quantity")),
          "avgQuantity",
        ],
      ],
      group: [
        "menuItemId",
        "menuItem.id",
        "menuItem.name",
        "menuItem.category",
        "menuItem.price",
      ],
      order: [[OrderItem.sequelize.literal("totalQuantity"), "DESC"]],
      raw: true,
    });

    const categoryData = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
        },
        {
          model: MenuItem,
          as: "menuItem",
          attributes: ["category"],
        },
      ],
      attributes: [
        "menuItem.category",
        [
          OrderItem.sequelize.fn("SUM", OrderItem.sequelize.col("quantity")),
          "totalQuantity",
        ],
        [
          OrderItem.sequelize.fn(
            "SUM",
            OrderItem.sequelize.literal("quantity * price")
          ),
          "totalRevenue",
        ],
      ],
      group: ["menuItem.category"],
      order: [[OrderItem.sequelize.literal("totalQuantity"), "DESC"]],
      raw: true,
    });

    res.json({
      salesData: salesData.map((item) => ({
        id: item.menuItemId,
        name: item["menuItem.name"],
        category: item["menuItem.category"],
        price: parseFloat(item["menuItem.price"]),
        totalQuantity: parseInt(item.totalQuantity),
        totalRevenue: parseFloat(item.totalRevenue),
        avgQuantity: parseFloat(item.avgQuantity),
      })),
      categoryData: categoryData.map((item) => ({
        category: item["menuItem.category"],
        totalQuantity: parseInt(item.totalQuantity),
        totalRevenue: parseFloat(item.totalRevenue),
      })),
    });
  } catch (error) {
    console.error("Get sales report error:", error);
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId, isActive: true };

    if (category) whereClause.category = category;
    if (lowStock === "true") {
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.col("current_stock"),
          Op.lte,
          sequelize.col("reorder_point")
        ),
      ];
    }

    const inventoryData = await Inventory.findAll({
      where: whereClause,
      attributes: [
        "id",
        "itemName",
        "category",
        "currentStock",
        "reorderPoint",
        "unitCost",
        "unit",
        "supplierName",
        "location",
      ],
      order: [["itemName", "ASC"]],
    });

    const categorySummary = await Inventory.findAll({
      where: { outletId: userOutletId, isActive: true },
      attributes: [
        "category",
        [
          Inventory.sequelize.fn("COUNT", Inventory.sequelize.col("id")),
          "count",
        ],
        [
          Inventory.sequelize.fn(
            "SUM",
            Inventory.sequelize.literal("currentStock * unitCost")
          ),
          "totalValue",
        ],
      ],
      group: ["category"],
      raw: true,
    });

    const lowStockItems = await Inventory.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.col("current_stock"),
            Op.lte,
            sequelize.col("reorder_point")
          ),
        ],
      },
      attributes: [
        "id",
        "itemName",
        "category",
        "currentStock",
        "reorderPoint",
        "unit",
        "supplierName",
      ],
    });

    res.json({
      inventoryData,
      categorySummary: categorySummary.map((item) => ({
        category: item.category,
        count: parseInt(item.count),
        totalValue: parseFloat(item.totalValue),
      })),
      lowStockItems,
    });
  } catch (error) {
    console.error("Get inventory report error:", error);
    res.status(500).json({ error: "Failed to fetch inventory report" });
  }
};

export const getStaffReport = async (req, res) => {
  try {
    const { department, isActive } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (department) whereClause.department = department;
    if (isActive !== undefined) whereClause.isActive = isActive === "true";

    const staffData = await Staff.findAll({
      where: whereClause,
      attributes: [
        "id",
        "employeeId",
        "position",
        "department",
        "hireDate",
        "isActive",
        "hourlyRate",
        "salary",
        "payFrequency",
        "performanceRating",
      ],
      order: [["employeeId", "ASC"]],
    });

    const departmentSummary = await Staff.findAll({
      where: { outletId: userOutletId, isActive: true },
      attributes: [
        "department",
        [Staff.sequelize.fn("COUNT", Staff.sequelize.col("id")), "count"],
        [
          Staff.sequelize.fn("AVG", Staff.sequelize.col("performanceRating")),
          "avgPerformance",
        ],
      ],
      group: ["department"],
      raw: true,
    });

    const newHires = await Staff.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        hireDate: {
          [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      attributes: ["id", "employeeId", "position", "department", "hireDate"],
      order: [["hireDate", "DESC"]],
    });

    res.json({
      staffData,
      departmentSummary: departmentSummary.map((item) => ({
        department: item.department,
        count: parseInt(item.count),
        avgPerformance: parseFloat(item.avgPerformance) || 0,
      })),
      newHires,
    });
  } catch (error) {
    console.error("Get staff report error:", error);
    res.status(500).json({ error: "Failed to fetch staff report" });
  }
};

export const getEventReport = async (req, res) => {
  try {
    const { startDate, endDate, eventType, status } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (startDate && endDate) {
      whereClause.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (eventType) whereClause.eventType = eventType;
    if (status) whereClause.status = status;

    const eventData = await Event.findAll({
      where: whereClause,
      attributes: [
        "id",
        "title",
        "eventType",
        "startDate",
        "endDate",
        "startTime",
        "endTime",
        "capacity",
        "expectedAttendance",
        "actualAttendance",
        "isTicketed",
        "ticketPrice",
        "ticketQuantity",
        "ticketsSold",
        "status",
        "budget",
        "actualCost",
        "revenue",
      ],
      order: [["startDate", "DESC"]],
    });

    const typeSummary = await Event.findAll({
      where: whereClause,
      attributes: [
        "eventType",
        [Event.sequelize.fn("COUNT", Event.sequelize.col("id")), "count"],
        [
          Event.sequelize.fn("SUM", Event.sequelize.col("revenue")),
          "totalRevenue",
        ],
        [
          Event.sequelize.fn("AVG", Event.sequelize.col("actualAttendance")),
          "avgAttendance",
        ],
      ],
      group: ["eventType"],
      raw: true,
    });

    const statusSummary = await Event.findAll({
      where: whereClause,
      attributes: [
        "status",
        [Event.sequelize.fn("COUNT", Event.sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    res.json({
      eventData,
      typeSummary: typeSummary.map((item) => ({
        eventType: item.eventType,
        count: parseInt(item.count),
        totalRevenue: parseFloat(item.totalRevenue) || 0,
        avgAttendance: parseFloat(item.avgAttendance) || 0,
      })),
      statusSummary: statusSummary.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
    });
  } catch (error) {
    console.error("Get event report error:", error);
    res.status(500).json({ error: "Failed to fetch event report" });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const guestData = await Guest.findAll({
      where: whereClause,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "createdAt",
        "lastVisit",
        "totalVisits",
        "totalSpent",
        "preferences",
      ],
      order: [["totalSpent", "DESC"]],
    });

    const topCustomers = await Guest.findAll({
      where: whereClause,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "totalVisits",
        "totalSpent",
      ],
      order: [["totalSpent", "DESC"]],
      limit: 10,
    });

    const customerStats = await Guest.findOne({
      where: whereClause,
      attributes: [
        [
          Guest.sequelize.fn("COUNT", Guest.sequelize.col("id")),
          "totalCustomers",
        ],
        [
          Guest.sequelize.fn("AVG", Guest.sequelize.col("totalVisits")),
          "avgVisits",
        ],
        [
          Guest.sequelize.fn("AVG", Guest.sequelize.col("totalSpent")),
          "avgSpent",
        ],
        [
          Guest.sequelize.fn("SUM", Guest.sequelize.col("totalSpent")),
          "totalRevenue",
        ],
      ],
      raw: true,
    });

    res.json({
      guestData,
      topCustomers,
      customerStats: {
        totalCustomers: parseInt(customerStats?.totalCustomers) || 0,
        avgVisits: parseFloat(customerStats?.avgVisits) || 0,
        avgSpent: parseFloat(customerStats?.avgSpent) || 0,
        totalRevenue: parseFloat(customerStats?.totalRevenue) || 0,
      },
    });
  } catch (error) {
    console.error("Get customer report error:", error);
    res.status(500).json({ error: "Failed to fetch customer report" });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { reportType, format = "json", ...filters } = req.query;
    const userOutletId = req.user.outletId;

    let reportData;

    switch (reportType) {
      case "revenue":
        reportData = await getRevenueReportData(userOutletId, filters);
        break;
      case "sales":
        reportData = await getSalesReportData(userOutletId, filters);
        break;
      case "inventory":
        reportData = await getInventoryReportData(userOutletId, filters);
        break;
      case "staff":
        reportData = await getStaffReportData(userOutletId, filters);
        break;
      case "events":
        reportData = await getEventReportData(userOutletId, filters);
        break;
      case "customers":
        reportData = await getCustomerReportData(userOutletId, filters);
        break;
      default:
        return res.status(400).json({ error: "Invalid report type" });
    }

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(reportData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reportType}_report.csv"`
      );
      return res.send(csv);
    }

    res.json({ reportData });
  } catch (error) {
    console.error("Export report error:", error);
    res.status(500).json({ error: "Failed to export report" });
  }
};

// Helper functions for export
const getRevenueReportData = async (outletId, filters) => {
  // Implementation for revenue report data
  return [];
};

const getSalesReportData = async (outletId, filters) => {
  // Implementation for sales report data
  return [];
};

const getInventoryReportData = async (outletId, filters) => {
  // Implementation for inventory report data
  return [];
};

const getStaffReportData = async (outletId, filters) => {
  // Implementation for staff report data
  return [];
};

const getEventReportData = async (outletId, filters) => {
  // Implementation for event report data
  return [];
};

const getCustomerReportData = async (outletId, filters) => {
  // Implementation for customer report data
  return [];
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header] || "").join(",")),
  ].join("\n");

  return csvContent;
};
