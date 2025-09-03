const User = require("./User.js");
const Outlet = require("./Outlet.js");
const Guest = require("./Guest.js");
const Reservation = require("./Reservation.js");
const Ticket = require("./Ticket.js");
const Event = require("./Event.js");
const MenuItem = require("./MenuItem.js");
const Order = require("./Order.js");
const OrderItem = require("./OrderItem.js");
const Table = require("./Table.js");
const Inventory = require("./Inventory.js");
const Staff = require("./Staff.js");
const Shift = require("./Shift.js");
const Payment = require("./Payment.js");

// Define associations - Simplified to avoid MySQL key limit issues

// Core business relationships
User.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(User, { foreignKey: "outletId", as: "users" });

// Reservation relationships
Reservation.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Reservation, { foreignKey: "outletId", as: "reservations" });

// Ticket relationships
Ticket.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Ticket, { foreignKey: "outletId", as: "tickets" });

// Event relationships
Event.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Event, { foreignKey: "outletId", as: "events" });

// Menu Item relationships
MenuItem.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(MenuItem, { foreignKey: "outletId", as: "menuItems" });

// Order relationships
Order.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Order.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Outlet.hasMany(Order, { foreignKey: "outletId", as: "orders" });
Table.hasMany(Order, { foreignKey: "tableId", as: "orders" });

// Order Item relationships
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
OrderItem.belongsTo(MenuItem, { foreignKey: "menuItemId", as: "menuItem" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems" });
MenuItem.hasMany(OrderItem, { foreignKey: "menuItemId", as: "orderItems" });

// Table relationships
Table.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Table, { foreignKey: "outletId", as: "tables" });

// Inventory relationships
Inventory.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Inventory, { foreignKey: "outletId", as: "inventory" });

// Staff relationships
Staff.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Staff, { foreignKey: "outletId", as: "staff" });

// Shift relationships
Shift.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Shift, { foreignKey: "outletId", as: "shifts" });

// Payment relationships
Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Payment.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Order.hasMany(Payment, { foreignKey: "orderId", as: "payments" });
Outlet.hasMany(Payment, { foreignKey: "outletId", as: "payments" });

module.exports = {
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
