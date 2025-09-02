import User from "./User.js";
import Role from "./Role.js";
import Permission from "./Permission.js";
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

// Define associations - Simplified to avoid MySQL key limit issues

// Core business relationships
User.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(User, { foreignKey: "outletId", as: "users" });

// Reservation relationships
Reservation.belongsTo(Outlet, { foreignKey: "outletId", as: "outlet" });
Outlet.hasMany(Reservation, { foreignKey: "outletId", as: "reservations" });
Reservation.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Table.hasMany(Reservation, { foreignKey: "tableId", as: "reservations" });

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

export {
  User,
  Role,
  Permission,
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
