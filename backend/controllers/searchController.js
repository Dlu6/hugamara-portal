import { Op, Sequelize } from "sequelize";
import {
  Guest,
  Order,
  Reservation,
  MenuItem,
  Inventory,
  Staff,
  Event,
  Ticket,
  Outlet,
} from "../models/index.js";

// Helper function for case-insensitive LIKE in MySQL
const iLike = (modelName, attributeName, value) => {
  const dbColumn = getDbColumnName(modelName, attributeName);
  return Sequelize.literal(
    `LOWER(${dbColumn}) LIKE '%${value.toLowerCase()}%'`
  );
};

// Table name mapping for search queries
const getTableName = (modelName) => {
  const tableMappings = {
    Guest: "guests",
    Order: "orders",
    Reservation: "reservations",
    MenuItem: "menu_items",
    Inventory: "inventory",
    Staff: "staff",
    Event: "events",
    Ticket: "tickets",
  };
  return tableMappings[modelName] || modelName.toLowerCase();
};

// Database column mapping for search queries
const getDbColumnName = (modelName, attributeName) => {
  const columnMappings = {
    Guest: {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
      loyaltyTier: "loyalty_tier",
      totalSpent: "total_spent",
      createdAt: "created_at",
    },
    Order: {
      orderNumber: "order_number",
      notes: "notes",
      totalAmount: "total_amount",
      status: "status",
      orderType: "order_type",
      createdAt: "created_at",
    },
    Reservation: {
      reservationNumber: "reservation_number",
      notes: "notes",
      specialRequests: "special_requests",
      partySize: "party_size",
      reservationDate: "reservation_date",
      reservationTime: "reservation_time",
      status: "status",
      createdAt: "created_at",
    },
    MenuItem: {
      name: "name",
      description: "description",
      category: "category",
      price: "price",
      createdAt: "created_at",
    },
    Inventory: {
      itemName: "item_name",
      description: "description",
      sku: "sku",
      barcode: "barcode",
      currentStock: "current_stock",
      reorderPoint: "reorder_point",
      createdAt: "created_at",
    },
    Staff: {
      employeeId: "employee_id",
      position: "position",
      notes: "notes",
      department: "department",
      hireDate: "hire_date",
      createdAt: "created_at",
    },
    Event: {
      title: "title",
      description: "description",
      eventType: "event_type",
      startDate: "start_date",
      endDate: "end_date",
      status: "status",
      createdAt: "created_at",
    },
    Ticket: {
      ticketNumber: "ticket_number",
      title: "title",
      description: "description",
      location: "location",
      priority: "priority",
      status: "status",
      createdAt: "created_at",
    },
  };

  return columnMappings[modelName]?.[attributeName] || attributeName;
};

/**
 * Unified search across multiple entities
 */
export const globalSearch = async (req, res) => {
  try {
    console.log("Global search request received");
    console.log("req.query:", JSON.stringify(req.query));
    console.log("req.params:", JSON.stringify(req.params));
    console.log("req.body:", JSON.stringify(req.body));

    const { q, limit = 10 } = req.query;
    console.log("Extracted q:", JSON.stringify(q), "limit:", limit);
    const userOutletId = req.user.outletId;

    if (!q || q.length < 2) {
      return res.json({
        results: {
          guests: [],
          orders: [],
          reservations: [],
          menuItems: [],
          inventory: [],
          staff: [],
          events: [],
          tickets: [],
        },
        total: 0,
      });
    }

    const searchTerm = `%${q}%`;
    const searchLimit = Math.min(parseInt(limit), 20); // Cap at 20 results per category

    // Search across all entities in parallel
    const [
      guests,
      orders,
      reservations,
      menuItems,
      inventory,
      staff,
      events,
      tickets,
    ] = await Promise.all([
      // Search Guests
      Guest.findAll({
        where: {
          outletId: userOutletId,
          isActive: true,
          [Op.or]: [
            iLike("Guest", "firstName", searchTerm),
            iLike("Guest", "lastName", searchTerm),
            iLike("Guest", "email", searchTerm),
            iLike("Guest", "phone", searchTerm),
          ],
        },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "phone",
          "loyaltyTier",
          "totalSpent",
        ],
        limit: searchLimit,
        order: [["totalSpent", "DESC"]],
      }),

      // Search Orders
      Order.findAll({
        where: {
          outletId: userOutletId,
          [Op.or]: [
            iLike("Order", "orderNumber", searchTerm),
            iLike("Order", "notes", searchTerm),
          ],
        },
        attributes: [
          "id",
          "orderNumber",
          "totalAmount",
          "status",
          "orderType",
          "createdAt",
        ],
        limit: searchLimit,
        order: [["createdAt", "DESC"]],
      }),

      // Search Reservations
      Reservation.findAll({
        where: {
          outletId: userOutletId,
          [Op.or]: [
            iLike("Reservation", "reservationNumber", searchTerm),
            iLike("Reservation", "notes", searchTerm),
            iLike("Reservation", "specialRequests", searchTerm),
          ],
        },
        attributes: [
          "id",
          "reservationNumber",
          "partySize",
          "reservationDate",
          "reservationTime",
          "status",
        ],
        limit: searchLimit,
        order: [["reservationDate", "DESC"]],
      }),

      // Search Menu Items
      MenuItem.findAll({
        where: {
          outletId: userOutletId,
          [Op.or]: [
            iLike("MenuItem", "name", searchTerm),
            iLike("MenuItem", "description", searchTerm),
            iLike("MenuItem", "category", searchTerm),
          ],
        },
        attributes: [
          "id",
          "name",
          "description",
          "price",
          "category",
          "isAvailable",
        ],
        limit: searchLimit,
        order: [["name", "ASC"]],
      }),

      // Search Inventory
      Inventory.findAll({
        where: {
          outletId: userOutletId,
          isActive: true,
          [Op.or]: [
            iLike("Inventory", "itemName", searchTerm),
            iLike("Inventory", "description", searchTerm),
            iLike("Inventory", "sku", searchTerm),
            iLike("Inventory", "barcode", searchTerm),
          ],
        },
        attributes: [
          "id",
          "itemName",
          "description",
          "currentStock",
          "reorderPoint",
          "category",
        ],
        limit: searchLimit,
        order: [["itemName", "ASC"]],
      }),

      // Search Staff
      Staff.findAll({
        where: {
          outletId: userOutletId,
          isActive: true,
          [Op.or]: [
            iLike("Staff", "employeeId", searchTerm),
            iLike("Staff", "position", searchTerm),
            iLike("Staff", "notes", searchTerm),
          ],
        },
        attributes: [
          "id",
          "employeeId",
          "position",
          "department",
          "hireDate",
          "isActive",
        ],
        limit: searchLimit,
        order: [["employeeId", "ASC"]],
      }),

      // Search Events
      Event.findAll({
        where: {
          outletId: userOutletId,
          [Op.or]: [
            iLike("Event", "title", searchTerm),
            iLike("Event", "description", searchTerm),
            iLike("Event", "eventType", searchTerm),
          ],
        },
        attributes: [
          "id",
          "title",
          "description",
          "eventType",
          "startDate",
          "endDate",
          "status",
        ],
        limit: searchLimit,
        order: [["startDate", "DESC"]],
      }),

      // Search Tickets
      Ticket.findAll({
        where: {
          outletId: userOutletId,
          [Op.or]: [
            iLike("Ticket", "ticketNumber", searchTerm),
            iLike("Ticket", "title", searchTerm),
            iLike("Ticket", "description", searchTerm),
            iLike("Ticket", "location", searchTerm),
          ],
        },
        attributes: [
          "id",
          "ticketNumber",
          "title",
          "description",
          "category",
          "priority",
          "status",
          "createdAt",
        ],
        limit: searchLimit,
        order: [["createdAt", "DESC"]],
      }),
    ]);

    // Calculate total results
    const total =
      guests.length +
      orders.length +
      reservations.length +
      menuItems.length +
      inventory.length +
      staff.length +
      events.length +
      tickets.length;

    res.json({
      results: {
        guests,
        orders,
        reservations,
        menuItems,
        inventory,
        staff,
        events,
        tickets,
      },
      total,
      query: q,
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      error: "Failed to perform search",
      message: "An error occurred while searching",
    });
  }
};

/**
 * Quick search for autocomplete/suggestions
 */
export const quickSearch = async (req, res) => {
  try {
    console.log("Quick search request received");
    console.log("req.query:", JSON.stringify(req.query));
    console.log("req.params:", JSON.stringify(req.params));
    console.log("req.body:", JSON.stringify(req.body));

    const { q, type } = req.query;
    console.log("Extracted q:", JSON.stringify(q), "type:", type);
    const userOutletId = req.user.outletId;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = `%${q}%`;
    const limit = 5;

    let suggestions = [];

    switch (type) {
      case "guests":
        const guests = await Guest.findAll({
          where: {
            outletId: userOutletId,
            isActive: true,
            [Op.or]: [
              iLike("Guest", "firstName", searchTerm),
              iLike("Guest", "lastName", searchTerm),
              iLike("Guest", "email", searchTerm),
            ],
          },
          attributes: ["id", "firstName", "lastName", "email"],
          limit,
          order: [["totalSpent", "DESC"]],
        });
        suggestions = guests.map((guest) => ({
          id: guest.id,
          text: `${guest.firstName} ${guest.lastName}`,
          subtitle: guest.email,
          type: "guest",
        }));
        break;

      case "orders":
        const orders = await Order.findAll({
          where: {
            outletId: userOutletId,
            [Op.or]: [
              iLike("Order", "orderNumber", searchTerm),
              iLike("Order", "notes", searchTerm),
            ],
          },
          attributes: ["id", "orderNumber", "totalAmount", "status"],
          limit,
          order: [["createdAt", "DESC"]],
        });
        suggestions = orders.map((order) => ({
          id: order.id,
          text: order.orderNumber,
          subtitle: `$${order.totalAmount} - ${order.status}`,
          type: "order",
        }));
        break;

      case "menu":
        const menuItems = await MenuItem.findAll({
          where: {
            outletId: userOutletId,
            [Op.or]: [
              iLike("MenuItem", "name", searchTerm),
              iLike("MenuItem", "category", searchTerm),
            ],
          },
          attributes: ["id", "name", "price", "category"],
          limit,
          order: [["name", "ASC"]],
        });
        suggestions = menuItems.map((item) => ({
          id: item.id,
          text: item.name,
          subtitle: `${item.category} - $${item.price}`,
          type: "menu",
        }));
        break;

      case "reservations":
        const reservations = await Reservation.findAll({
          where: {
            outletId: userOutletId,
            [Op.or]: [
              iLike("Reservation", "reservationNumber", searchTerm),
              iLike("Reservation", "notes", searchTerm),
              iLike("Reservation", "specialRequests", searchTerm),
            ],
          },
          attributes: [
            "id",
            "reservationNumber",
            "partySize",
            "reservationDate",
            "status",
          ],
          limit,
          order: [["reservationDate", "DESC"]],
        });
        suggestions = reservations.map((reservation) => ({
          id: reservation.id,
          text: reservation.reservationNumber,
          subtitle: `${reservation.partySize} people - ${reservation.status}`,
          type: "reservation",
        }));
        break;

      case "inventory":
        const inventory = await Inventory.findAll({
          where: {
            outletId: userOutletId,
            isActive: true,
            [Op.or]: [
              iLike("Inventory", "itemName", searchTerm),
              iLike("Inventory", "description", searchTerm),
              iLike("Inventory", "sku", searchTerm),
            ],
          },
          attributes: ["id", "itemName", "currentStock", "category"],
          limit,
          order: [["itemName", "ASC"]],
        });
        suggestions = inventory.map((item) => ({
          id: item.id,
          text: item.itemName,
          subtitle: `Stock: ${item.currentStock} - ${item.category}`,
          type: "inventory",
        }));
        break;

      case "staff":
        const staff = await Staff.findAll({
          where: {
            outletId: userOutletId,
            isActive: true,
            [Op.or]: [
              iLike("Staff", "employeeId", searchTerm),
              iLike("Staff", "position", searchTerm),
            ],
          },
          attributes: ["id", "employeeId", "position", "department"],
          limit,
          order: [["employeeId", "ASC"]],
        });
        suggestions = staff.map((member) => ({
          id: member.id,
          text: member.employeeId,
          subtitle: `${member.position} - ${member.department}`,
          type: "staff",
        }));
        break;

      case "events":
        const events = await Event.findAll({
          where: {
            outletId: userOutletId,
            [Op.or]: [
              iLike("Event", "title", searchTerm),
              iLike("Event", "description", searchTerm),
              iLike("Event", "eventType", searchTerm),
            ],
          },
          attributes: ["id", "title", "eventType", "startDate", "status"],
          limit,
          order: [["startDate", "DESC"]],
        });
        suggestions = events.map((event) => ({
          id: event.id,
          text: event.title,
          subtitle: `${event.eventType} - ${new Date(
            event.startDate
          ).toLocaleDateString()}`,
          type: "event",
        }));
        break;

      case "tickets":
        const tickets = await Ticket.findAll({
          where: {
            outletId: userOutletId,
            [Op.or]: [
              iLike("Ticket", "ticketNumber", searchTerm),
              iLike("Ticket", "title", searchTerm),
              iLike("Ticket", "description", searchTerm),
            ],
          },
          attributes: ["id", "ticketNumber", "title", "priority", "status"],
          limit,
          order: [["createdAt", "DESC"]],
        });
        suggestions = tickets.map((ticket) => ({
          id: ticket.id,
          text: ticket.ticketNumber,
          subtitle: `${ticket.title} - ${ticket.priority}`,
          type: "ticket",
        }));
        break;

      default:
        // Return all types if no specific type requested
        const [allGuests, allOrders, allMenuItems] = await Promise.all([
          Guest.findAll({
            where: {
              outletId: userOutletId,
              isActive: true,
              [Op.or]: [
                iLike("Guest", "firstName", searchTerm),
                iLike("Guest", "lastName", searchTerm),
              ],
            },
            attributes: ["id", "firstName", "lastName"],
            limit: 2,
            order: [["totalSpent", "DESC"]],
          }),
          Order.findAll({
            where: {
              outletId: userOutletId,
              [Op.or]: [
                iLike("Order", "orderNumber", searchTerm),
                iLike("Order", "notes", searchTerm),
              ],
            },
            attributes: ["id", "orderNumber", "totalAmount"],
            limit: 2,
            order: [["createdAt", "DESC"]],
          }),
          MenuItem.findAll({
            where: {
              outletId: userOutletId,
              [Op.or]: [
                iLike("MenuItem", "name", searchTerm),
                iLike("MenuItem", "category", searchTerm),
              ],
            },
            attributes: ["id", "name", "price"],
            limit: 2,
            order: [["name", "ASC"]],
          }),
        ]);

        suggestions = [
          ...allGuests.map((guest) => ({
            id: guest.id,
            text: `${guest.firstName} ${guest.lastName}`,
            subtitle: "Guest",
            type: "guest",
          })),
          ...allOrders.map((order) => ({
            id: order.id,
            text: order.orderNumber,
            subtitle: `Order - $${order.totalAmount}`,
            type: "order",
          })),
          ...allMenuItems.map((item) => ({
            id: item.id,
            text: item.name,
            subtitle: `Menu - $${item.price}`,
            type: "menu",
          })),
        ].slice(0, 5);
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Quick search error:", error);
    res.status(500).json({
      error: "Failed to perform quick search",
      message: "An error occurred while searching",
    });
  }
};
