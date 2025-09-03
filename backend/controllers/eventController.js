import { Op } from "sequelize";
import { Event, Outlet } from "../models/index.js";

export const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventType,
      status,
      dateFrom,
      dateTo,
      search,
    } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (eventType) whereClause.eventType = eventType;
    if (status) whereClause.status = status;

    if (dateFrom || dateTo) {
      whereClause.startDate = {};
      if (dateFrom) whereClause.startDate[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.startDate[Op.lte] = new Date(dateTo);
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const events = await Event.findAndCountAll({
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
      order: [["startDate", "ASC"]],
    });

    res.json({
      events: events.rows,
      total: events.count,
      page: parseInt(page),
      totalPages: Math.ceil(events.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const event = await Event.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    const event = await Event.create(eventData);

    const fullEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.status(201).json({ event: fullEvent });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const event = await Event.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await event.update(req.body);

    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const event = await Event.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Only allow deletion of draft or cancelled events
    if (!["draft", "cancelled"].includes(event.status)) {
      return res
        .status(400)
        .json({ error: "Only draft or cancelled events can be deleted" });
    }

    await event.destroy();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

export const getEventStats = async (req, res) => {
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
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRevenue,
      totalAttendance,
      byType,
      byStatus,
      avgAttendance,
    ] = await Promise.all([
      Event.count({
        where: { outletId: userOutletId, startDate: dateFilter },
      }),
      Event.count({
        where: {
          outletId: userOutletId,
          status: "published",
          startDate: { [Op.gte]: now },
          startDate: dateFilter,
        },
      }),
      Event.count({
        where: {
          outletId: userOutletId,
          status: "completed",
          startDate: dateFilter,
        },
      }),
      Event.findOne({
        where: { outletId: userOutletId, startDate: dateFilter },
        attributes: [
          [Event.sequelize.fn("SUM", Event.sequelize.col("revenue")), "total"],
        ],
        raw: true,
      }),
      Event.findOne({
        where: { outletId: userOutletId, startDate: dateFilter },
        attributes: [
          [
            Event.sequelize.fn("SUM", Event.sequelize.col("actualAttendance")),
            "total",
          ],
        ],
        raw: true,
      }),
      Event.findAll({
        where: { outletId: userOutletId, startDate: dateFilter },
        attributes: [
          "eventType",
          [Event.sequelize.fn("COUNT", Event.sequelize.col("id")), "count"],
        ],
        group: ["eventType"],
        raw: true,
      }),
      Event.findAll({
        where: { outletId: userOutletId, startDate: dateFilter },
        attributes: [
          "status",
          [Event.sequelize.fn("COUNT", Event.sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      }),
      Event.findOne({
        where: {
          outletId: userOutletId,
          actualAttendance: { [Op.ne]: null },
          startDate: dateFilter,
        },
        attributes: [
          [
            Event.sequelize.fn("AVG", Event.sequelize.col("actualAttendance")),
            "avg",
          ],
        ],
        raw: true,
      }),
    ]);

    res.json({
      stats: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalRevenue: parseFloat(totalRevenue?.total) || 0,
        totalAttendance: parseInt(totalAttendance?.total) || 0,
        avgAttendance: parseFloat(avgAttendance?.avg) || 0,
        byType: byType.reduce((acc, item) => {
          acc[item.eventType] = parseInt(item.count);
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get event stats error:", error);
    res.status(500).json({ error: "Failed to fetch event stats" });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userOutletId = req.user.outletId;

    const event = await Event.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await event.update({ status });

    res.json({ message: "Event status updated successfully" });
  } catch (error) {
    console.error("Update event status error:", error);
    res.status(500).json({ error: "Failed to update event status" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userOutletId = req.user.outletId;
    const now = new Date();
    const futureDate = new Date(
      now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000
    );

    const upcomingEvents = await Event.findAll({
      where: {
        outletId: userOutletId,
        status: { [Op.in]: ["published", "active"] },
        startDate: {
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
      order: [["startDate", "ASC"]],
    });

    res.json({ events: upcomingEvents });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
};

export const getEventsByType = async (req, res) => {
  try {
    const { eventType } = req.params;
    const userOutletId = req.user.outletId;

    const events = await Event.findAll({
      where: {
        outletId: userOutletId,
        eventType,
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["startDate", "DESC"]],
    });

    res.json({ events });
  } catch (error) {
    console.error("Get events by type error:", error);
    res.status(500).json({ error: "Failed to fetch events by type" });
  }
};

export const updateEventAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualAttendance } = req.body;
    const userOutletId = req.user.outletId;

    const event = await Event.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await event.update({ actualAttendance });

    res.json({ message: "Event attendance updated successfully" });
  } catch (error) {
    console.error("Update event attendance error:", error);
    res.status(500).json({ error: "Failed to update event attendance" });
  }
};

export const getEventCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userOutletId = req.user.outletId;

    const startDate = new Date(
      year || new Date().getFullYear(),
      (month || new Date().getMonth()) - 1,
      1
    );
    const endDate = new Date(
      year || new Date().getFullYear(),
      month || new Date().getMonth(),
      0
    );

    const events = await Event.findAll({
      where: {
        outletId: userOutletId,
        startDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    res.json({ events });
  } catch (error) {
    console.error("Get event calendar error:", error);
    res.status(500).json({ error: "Failed to fetch event calendar" });
  }
};
