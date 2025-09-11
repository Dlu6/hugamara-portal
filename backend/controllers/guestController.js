import { Op } from "sequelize";
import { Guest, Outlet, Reservation, Order, Payment } from "../models/index.js";

export const getAllGuests = async (req, res) => {
  try {
    const { page = 1, limit = 10, loyaltyTier, search, isActive } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (loyaltyTier) whereClause.loyaltyTier = loyaltyTier;
    if (isActive !== undefined) whereClause.isActive = isActive === "true";

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const guests = await Guest.findAndCountAll({
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
      order: [["createdAt", "DESC"]],
    });

    res.json({
      guests: guests.rows,
      total: guests.count,
      page: parseInt(page),
      totalPages: Math.ceil(guests.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get guests error:", error);
    res.status(500).json({ error: "Failed to fetch guests" });
  }
};

export const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const guest = await Guest.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
        {
          model: Reservation,
          as: "reservations",
          attributes: [
            "id",
            "reservationNumber",
            "date",
            "time",
            "partySize",
            "status",
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        },
        {
          model: Order,
          as: "orders",
          attributes: [
            "id",
            "orderNumber",
            "totalAmount",
            "status",
            "createdAt",
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        },
      ],
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json({ guest });
  } catch (error) {
    console.error("Get guest error:", error);
    res.status(500).json({ error: "Failed to fetch guest" });
  }
};

export const createGuest = async (req, res) => {
  try {
    const sanitize = (data) => {
      const cleaned = { ...data };
      const optionalFields = [
        "email",
        "phone",
        "dateOfBirth",
        "gender",
        "address",
        "city",
        "country",
        "preferences",
        "allergies",
        "dietaryRestrictions",
        "notes",
      ];
      optionalFields.forEach((f) => {
        if (cleaned[f] === "" || cleaned[f] === undefined) delete cleaned[f];
      });
      ["loyaltyPoints", "totalSpent", "visitCount"].forEach((f) => {
        if (cleaned[f] === "" || cleaned[f] === undefined) delete cleaned[f];
      });
      return cleaned;
    };

    const guestData = {
      ...sanitize(req.body),
      outletId: req.user.outletId,
    };

    const guest = await Guest.create(guestData);

    const fullGuest = await Guest.findByPk(guest.id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.status(201).json({ guest: fullGuest });
  } catch (error) {
    console.error("Create guest error:", error);
    res.status(500).json({ error: "Failed to create guest" });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const guest = await Guest.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // Sanitize optional fields (treat empty strings as null/undefined)
    const sanitize = (data) => {
      const cleaned = { ...data };
      const optionalFields = [
        "email",
        "phone",
        "dateOfBirth",
        "gender",
        "address",
        "city",
        "country",
        "preferences",
        "allergies",
        "dietaryRestrictions",
        "notes",
      ];
      optionalFields.forEach((f) => {
        if (cleaned[f] === "" || cleaned[f] === undefined) delete cleaned[f];
      });
      ["loyaltyPoints", "totalSpent", "visitCount"].forEach((f) => {
        if (cleaned[f] === "" || cleaned[f] === undefined) delete cleaned[f];
      });
      return cleaned;
    };

    const updateData = sanitize(req.body);

    // Update loyalty tier if total spent changed
    if (updateData.totalSpent !== undefined) {
      updateData.loyaltyTier = calculateLoyaltyTier(updateData.totalSpent);
    }

    await guest.update(updateData);

    const updatedGuest = await Guest.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ guest: updatedGuest });
  } catch (error) {
    console.error("Update guest error:", error);
    res.status(500).json({ error: "Failed to update guest" });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const guest = await Guest.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // Soft delete by setting isActive to false
    await guest.update({ isActive: false });

    res.json({ message: "Guest deactivated successfully" });
  } catch (error) {
    console.error("Delete guest error:", error);
    res.status(500).json({ error: "Failed to delete guest" });
  }
};

export const getGuestStats = async (req, res) => {
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
      totalGuests,
      activeGuests,
      newGuests,
      totalRevenue,
      avgSpent,
      byLoyaltyTier,
      topSpenders,
      recentGuests,
    ] = await Promise.all([
      Guest.count({
        where: { outletId: userOutletId, createdAt: dateFilter },
      }),
      Guest.count({
        where: { outletId: userOutletId, isActive: true },
      }),
      Guest.count({
        where: {
          outletId: userOutletId,
          createdAt: dateFilter,
        },
      }),
      Guest.findOne({
        where: { outletId: userOutletId },
        attributes: [
          [
            Guest.sequelize.fn("SUM", Guest.sequelize.col("totalSpent")),
            "total",
          ],
        ],
        raw: true,
      }).catch(() => ({ total: 0 })),
      Guest.findOne({
        where: { outletId: userOutletId },
        attributes: [
          [Guest.sequelize.fn("AVG", Guest.sequelize.col("totalSpent")), "avg"],
        ],
        raw: true,
      }).catch(() => ({ avg: 0 })),
      Guest.findAll({
        where: { outletId: userOutletId, isActive: true },
        attributes: [
          "loyaltyTier",
          [Guest.sequelize.fn("COUNT", Guest.sequelize.col("id")), "count"],
        ],
        group: ["loyaltyTier"],
        raw: true,
      }),
      Guest.findAll({
        where: { outletId: userOutletId, isActive: true },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "totalSpent",
          "visitCount",
        ],
        order: [["totalSpent", "DESC"]],
        limit: 5,
      }),
      Guest.findAll({
        where: { outletId: userOutletId, isActive: true },
        attributes: ["id", "firstName", "lastName", "email", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    res.json({
      stats: {
        totalGuests,
        activeGuests,
        newGuests,
        totalRevenue: parseFloat(totalRevenue?.total) || 0,
        avgSpent: parseFloat(avgSpent?.avg) || 0,
        byLoyaltyTier: byLoyaltyTier.reduce((acc, item) => {
          acc[item.loyaltyTier] = parseInt(item.count);
          return acc;
        }, {}),
        topSpenders,
        recentGuests,
      },
    });
  } catch (error) {
    console.error("Get guest stats error:", error);
    res.status(500).json({ error: "Failed to fetch guest stats" });
  }
};

export const updateLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, action } = req.body; // action: 'add' or 'subtract'
    const userOutletId = req.user.outletId;

    const guest = await Guest.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    let newPoints = guest.loyaltyPoints;
    if (action === "add") {
      newPoints += points;
    } else if (action === "subtract") {
      newPoints = Math.max(0, newPoints - points);
    }

    await guest.update({ loyaltyPoints: newPoints });

    res.json({ message: "Loyalty points updated successfully" });
  } catch (error) {
    console.error("Update loyalty points error:", error);
    res.status(500).json({ error: "Failed to update loyalty points" });
  }
};

export const getGuestHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const guest = await Guest.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    const [reservations, orders, payments] = await Promise.all([
      Reservation.findAll({
        where: { guestId: id, outletId: userOutletId },
        attributes: [
          "id",
          "reservationNumber",
          // Use model attribute names that map to reservation_date/reservation_time
          "reservationDate",
          "reservationTime",
          "partySize",
          "status",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
      }),
      Order.findAll({
        where: { guestId: id, outletId: userOutletId },
        attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
        order: [["createdAt", "DESC"]],
      }),
      Payment.findAll({
        include: [
          {
            model: Order,
            as: "order",
            required: true,
            attributes: [],
            where: { guestId: id, outletId: userOutletId },
          },
        ],
        attributes: [
          "id",
          "amount",
          "paymentMethod",
          "paymentStatus",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
      }),
    ]);

    res.json({
      guest,
      history: {
        reservations,
        orders,
        payments,
      },
    });
  } catch (error) {
    console.error("Get guest history error:", error);
    res.status(500).json({ error: "Failed to fetch guest history" });
  }
};

export const searchGuests = async (req, res) => {
  try {
    const { q } = req.query;
    const userOutletId = req.user.outletId;

    if (!q || q.length < 2) {
      return res.json({ guests: [] });
    }

    const guests = await Guest.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "loyaltyTier",
      ],
      limit: 10,
      order: [["totalSpent", "DESC"]],
    });

    res.json({ guests });
  } catch (error) {
    console.error("Search guests error:", error);
    res.status(500).json({ error: "Failed to search guests" });
  }
};

export const getGuestsByLoyaltyTier = async (req, res) => {
  try {
    const { tier } = req.params;
    const userOutletId = req.user.outletId;

    const guests = await Guest.findAll({
      where: {
        outletId: userOutletId,
        loyaltyTier: tier,
        isActive: true,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "loyaltyPoints",
        "totalSpent",
        "visitCount",
        "lastVisitAt",
      ],
      order: [["totalSpent", "DESC"]],
    });

    res.json({ guests });
  } catch (error) {
    console.error("Get guests by loyalty tier error:", error);
    res.status(500).json({ error: "Failed to fetch guests by loyalty tier" });
  }
};

// Helper function
const calculateLoyaltyTier = (totalSpent) => {
  if (totalSpent >= 1000000) {
    return "vip";
  } else if (totalSpent >= 500000) {
    return "platinum";
  } else if (totalSpent >= 200000) {
    return "gold";
  } else if (totalSpent >= 50000) {
    return "silver";
  } else {
    return "bronze";
  }
};
