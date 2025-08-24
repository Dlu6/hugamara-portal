import User from "./User.js";
import Outlet from "./Outlet.js";
import Guest from "./Guest.js";
import Reservation from "./Reservation.js";
import Ticket from "./Ticket.js";
import Event from "./Event.js";
import MenuItem from "./MenuItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Table from "./Table.js";
import Inventory from "./Inventory.js";
import Staff from "./Staff.js";
import Shift from "./Shift.js";
import Payment from "./Payment.js";

// Define associations

// User - Outlet relationship
User.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(User, { foreignKey: "outletId", as: "users" });

// User - User relationships (for created/updated by)
User.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });
User.hasMany(User, { foreignKey: "createdBy", as: "createdUsers" });
User.hasMany(User, { foreignKey: "updatedBy", as: "updatedUsers" });

// Outlet - User relationships (for created/updated by)
Outlet.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Outlet.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

// Guest - User relationships (for created/updated by)
Guest.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Guest.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

// Reservation relationships
Reservation.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Reservation.belongsTo(Guest, { foreignKey: "guestId", as: "guest" });
Reservation.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Reservation.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Reservation, { foreignKey: "outletId", as: "reservations" });
Guest.hasMany(Reservation, { foreignKey: "guestId", as: "reservations" });

// Ticket relationships
Ticket.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Ticket.belongsTo(User, { foreignKey: "assignedTo", as: "assignedUser" });
Ticket.belongsTo(User, { foreignKey: "reportedBy", as: "reporter" });
Ticket.belongsTo(Guest, { foreignKey: "guestId", as: "guest" });
Ticket.belongsTo(Reservation, {
  foreignKey: "reservationId",
  as: "reservation",
});
Ticket.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Ticket.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Ticket, { foreignKey: "outletId", as: "tickets" });
User.hasMany(Ticket, { foreignKey: "assignedTo", as: "assignedTickets" });
User.hasMany(Ticket, { foreignKey: "reportedBy", as: "reportedTickets" });
Guest.hasMany(Ticket, { foreignKey: "guestId", as: "tickets" });
Reservation.hasMany(Ticket, { foreignKey: "reservationId", as: "tickets" });

// Event relationships
Event.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Event.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Event.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Event, { foreignKey: "outletId", as: "events" });

// Menu Item relationships
MenuItem.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
MenuItem.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
MenuItem.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(MenuItem, { foreignKey: "outletId", as: "menuItems" });

// Order relationships
Order.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Order.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Order.belongsTo(Reservation, {
  foreignKey: "reservationId",
  as: "reservation",
});
Order.belongsTo(Guest, { foreignKey: "guestId", as: "guest" });
Order.belongsTo(User, { foreignKey: "serverId", as: "server" });
Order.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Order.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Order, { foreignKey: "outletId", as: "orders" });
Table.hasMany(Order, { foreignKey: "tableId", as: "orders" });
Reservation.hasMany(Order, { foreignKey: "reservationId", as: "orders" });
Guest.hasMany(Order, { foreignKey: "guestId", as: "orders" });
User.hasMany(Order, { foreignKey: "serverId", as: "servedOrders" });

// Order Item relationships
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
OrderItem.belongsTo(MenuItem, { foreignKey: "menuItemId", as: "menuItem" });
OrderItem.belongsTo(User, { foreignKey: "compApprovedBy", as: "compApprover" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems" });
MenuItem.hasMany(OrderItem, { foreignKey: "menuItemId", as: "orderItems" });

// Table relationships
Table.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Table.belongsTo(Reservation, {
  foreignKey: "currentReservationId",
  as: "currentReservation",
});
Table.belongsTo(Order, { foreignKey: "currentOrderId", as: "currentOrder" });
Table.belongsTo(User, { foreignKey: "assignedServerId", as: "assignedServer" });
Table.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Table.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Table, { foreignKey: "outletId", as: "tables" });
User.hasMany(Table, { foreignKey: "assignedServerId", as: "assignedTables" });

// Inventory relationships
Inventory.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Inventory.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Inventory.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Inventory, { foreignKey: "outletId", as: "inventory" });

// Staff relationships
Staff.belongsTo(User, { foreignKey: "userId", as: "user" });
Staff.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Staff.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Staff.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

User.hasOne(Staff, { foreignKey: "userId", as: "staffProfile" });
Outlet.hasMany(Staff, { foreignKey: "outletId", as: "staff" });

// Shift relationships
Shift.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Shift.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
Shift.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });
Shift.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Shift.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Outlet.hasMany(Shift, { foreignKey: "outletId", as: "shifts" });
Staff.hasMany(Shift, { foreignKey: "staffId", as: "shifts" });
User.hasMany(Shift, { foreignKey: "approvedBy", as: "approvedShifts" });

// Payment relationships
Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Payment.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Payment.belongsTo(User, {
  foreignKey: "discountApprovedBy",
  as: "discountApprover",
});
Payment.belongsTo(User, {
  foreignKey: "refundApprovedBy",
  as: "refundApprover",
});
Payment.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Payment.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

Order.hasMany(Payment, { foreignKey: "orderId", as: "payments" });
Outlet.hasMany(Payment, { foreignKey: "outletId", as: "payments" });

export {
  User,
  Outlet,
  Guest,
  Reservation,
  Ticket,
  Event,
  MenuItem,
  Order,
  OrderItem,
  Table,
  Inventory,
  Staff,
  Shift,
  Payment,
};
