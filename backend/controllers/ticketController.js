import { Op } from "sequelize";
import { Ticket, Outlet, User, TicketHistory } from "../models/index.js";

// Helper function to log ticket history
const logTicketHistory = async (
  ticketId,
  action,
  performedBy,
  oldValue = null,
  newValue = null,
  comment = null,
  metadata = {}
) => {
  try {
    await TicketHistory.create({
      ticketId,
      action,
      performedBy,
      oldValue,
      newValue,
      comment,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log ticket history:", error);
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      priority,
      status,
      search,
      assignedTo,
    } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    if (status) whereClause.status = status;

    if (search) {
      whereClause[Op.or] = [
        { ticketNumber: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const tickets = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "escalatedToUser",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      tickets: tickets.rows,
      total: tickets.count,
      page: parseInt(page),
      totalPages: Math.ceil(tickets.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const ticket = await Ticket.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "escalatedToUser",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Get ticket history
    const history = await TicketHistory.findAll({
      where: { ticketId: id },
      include: [
        {
          model: User,
          as: "performedByUser",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add history to ticket object
    ticket.dataValues.history = history;

    res.json({ ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

export const createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      outletId: req.user.outletId,
      createdBy: req.user.id,
    };

    // Generate ticket number if not provided
    if (!ticketData.ticketNumber) {
      const outletCode = req.user.outlet?.code || "OUT";
      const count = await Ticket.count({
        where: { outletId: req.user.outletId },
      });
      ticketData.ticketNumber = `TKT-${outletCode}-${String(count + 1).padStart(
        6,
        "0"
      )}`;
    }

    // Set SLA target based on priority
    if (!ticketData.slaTarget) {
      const slaTargets = {
        low: 1440, // 24 hours
        medium: 480, // 8 hours
        high: 120, // 2 hours
        critical: 30, // 30 minutes
      };
      ticketData.slaTarget = slaTargets[ticketData.priority] || 480;
    }

    const ticket = await Ticket.create(ticketData);

    // Log ticket creation
    await logTicketHistory(
      ticket.id,
      "created",
      req.user.id,
      null,
      null,
      `Ticket created with priority: ${ticketData.priority}`,
      { priority: ticketData.priority, category: ticketData.category }
    );

    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    res.status(201).json({ ticket: fullTicket });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const ticket = await Ticket.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Calculate resolution time if status changed to resolved
    if (req.body.status === "resolved" && ticket.status !== "resolved") {
      req.body.resolvedAt = new Date();
      const created = new Date(ticket.createdAt);
      const resolved = new Date();
      req.body.actualResolutionTime = Math.floor(
        (resolved - created) / (1000 * 60)
      );
    }

    // Set closed date if status changed to closed
    if (req.body.status === "closed" && ticket.status !== "closed") {
      req.body.closedAt = new Date();
    }

    await ticket.update(req.body);

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const ticket = await Ticket.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Only allow deletion of closed tickets
    if (ticket.status !== "closed") {
      return res
        .status(400)
        .json({ error: "Only closed tickets can be deleted" });
    }

    await ticket.destroy();

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};

export const getTicketStats = async (req, res) => {
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
      totalTickets,
      openTickets,
      resolvedTickets,
      overdueTickets,
      byCategory,
      byPriority,
      byStatus,
      avgResolutionTime,
    ] = await Promise.all([
      Ticket.count({
        where: { outletId: userOutletId, createdAt: dateFilter },
      }),
      Ticket.count({
        where: {
          outletId: userOutletId,
          status: { [Op.in]: ["open", "in_progress", "waiting"] },
          createdAt: dateFilter,
        },
      }),
      Ticket.count({
        where: {
          outletId: userOutletId,
          status: "resolved",
          createdAt: dateFilter,
        },
      }),
      Ticket.count({
        where: {
          outletId: userOutletId,
          status: { [Op.in]: ["open", "in_progress", "waiting"] },
          slaBreached: true,
          createdAt: dateFilter,
        },
      }),
      Ticket.findAll({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          "category",
          [Ticket.sequelize.fn("COUNT", Ticket.sequelize.col("id")), "count"],
        ],
        group: ["category"],
        raw: true,
      }),
      Ticket.findAll({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          "priority",
          [Ticket.sequelize.fn("COUNT", Ticket.sequelize.col("id")), "count"],
        ],
        group: ["priority"],
        raw: true,
      }),
      Ticket.findAll({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          "status",
          [Ticket.sequelize.fn("COUNT", Ticket.sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      }),
      Ticket.findOne({
        where: {
          outletId: userOutletId,
          status: "resolved",
          actualResolutionTime: { [Op.ne]: null },
          createdAt: dateFilter,
        },
        attributes: [
          [
            Ticket.sequelize.fn(
              "AVG",
              Ticket.sequelize.col("actual_resolution_time")
            ),
            "avgTime",
          ],
        ],
        raw: true,
      }),
    ]);

    res.json({
      stats: {
        totalTickets,
        openTickets,
        resolvedTickets,
        closedTickets: totalTickets - openTickets - resolvedTickets,
        overdueTickets,
        avgResolutionTime: parseFloat(avgResolutionTime?.avgTime) || 0,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = parseInt(item.count);
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = parseInt(item.count);
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get ticket stats error:", error);
    res.status(500).json({ error: "Failed to fetch ticket stats" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const userOutletId = req.user.outletId;

    const ticket = await Ticket.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const oldStatus = ticket.status;
    const updateData = { status };

    // Calculate resolution time if status changed to resolved
    if (status === "resolved" && ticket.status !== "resolved") {
      updateData.resolvedAt = new Date();
      const created = new Date(ticket.createdAt);
      const resolved = new Date();
      updateData.actualResolutionTime = Math.floor(
        (resolved - created) / (1000 * 60)
      );
    }

    // Set closed date if status changed to closed
    if (status === "closed" && ticket.status !== "closed") {
      updateData.closedAt = new Date();
    }

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    await ticket.update(updateData);

    // Log status change history
    if (oldStatus !== status) {
      await logTicketHistory(
        ticket.id,
        "status_changed",
        req.user.id,
        oldStatus,
        status,
        resolutionNotes || null,
        {}
      );
    }

    // Return updated ticket (with associations)
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "escalatedToUser",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    return res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
};

export const getOverdueTickets = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const overdueTickets = await Ticket.findAll({
      where: {
        outletId: userOutletId,
        status: { [Op.in]: ["open", "in_progress", "waiting"] },
        slaBreached: true,
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({ tickets: overdueTickets });
  } catch (error) {
    console.error("Get overdue tickets error:", error);
    res.status(500).json({ error: "Failed to fetch overdue tickets" });
  }
};

export const getTicketsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userOutletId = req.user.outletId;

    const tickets = await Ticket.findAll({
      where: {
        outletId: userOutletId,
        category,
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ tickets });
  } catch (error) {
    console.error("Get tickets by category error:", error);
    res.status(500).json({ error: "Failed to fetch tickets by category" });
  }
};

export const addTicketComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userOutletId = req.user.outletId;

    const ticket = await Ticket.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Add comment to existing notes or create new notes
    const currentNotes = ticket.resolutionNotes || "";
    const newNotes = currentNotes
      ? `${currentNotes}\n\nComment (${new Date().toLocaleString()}): ${comment}`
      : `Comment (${new Date().toLocaleString()}): ${comment}`;

    await ticket.update({ resolutionNotes: newNotes });

    // Log comment history
    await logTicketHistory(
      ticket.id,
      "commented",
      req.user.id,
      null,
      null,
      comment || null,
      {}
    );

    // Return updated ticket (with associations)
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
        {
          model: User,
          as: "escalatedToUser",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    return res.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Add ticket comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};
