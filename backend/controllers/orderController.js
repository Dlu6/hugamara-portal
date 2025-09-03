import { Op } from "sequelize";
import {
  Order,
  OrderItem,
  MenuItem,
  Table,
  Payment,
  Reservation,
  Guest,
  User,
} from "../models/index.js";

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };
    if (status) whereClause.status = status;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Reservation,
          as: "reservation",
          attributes: ["reservationNumber", "partySize"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["firstName", "lastName", "phone"],
        },
        { model: User, as: "server", attributes: ["firstName", "lastName"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "price"] },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, ...orderData } = req.body;

    const order = await Order.create({
      ...orderData,
      outletId: req.user.outletId,
      orderNumber: `ORD${Date.now()}`,
      serverId: req.user.id,
    });

    if (items && items.length > 0) {
      const orderItems = items.map((item) => ({
        ...item,
        orderId: order.id,
        totalPrice: item.quantity * item.unitPrice,
      }));

      await OrderItem.bulkCreate(orderItems);

      // Update order total
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      await order.update({
        subtotal,
        totalAmount:
          subtotal + (order.taxAmount || 0) - (order.discountAmount || 0),
      });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Reservation,
          as: "reservation",
          attributes: ["reservationNumber", "partySize"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["firstName", "lastName", "phone"],
        },
        { model: User, as: "server", attributes: ["firstName", "lastName"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "price"] },
          ],
        },
      ],
    });

    res.status(201).json({ order: fullOrder });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const order = await Order.findOne({
      where: { id, outletId: userOutletId },
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Reservation,
          as: "reservation",
          attributes: ["reservationNumber", "partySize"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["firstName", "lastName", "phone"],
        },
        { model: User, as: "server", attributes: ["firstName", "lastName"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: MenuItem,
              as: "menuItem",
              attributes: ["name", "price", "description"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const order = await Order.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update(req.body);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Reservation,
          as: "reservation",
          attributes: ["reservationNumber", "partySize"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["firstName", "lastName", "phone"],
        },
        { model: User, as: "server", attributes: ["firstName", "lastName"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "price"] },
          ],
        },
      ],
    });

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userOutletId = req.user.outletId;

    const order = await Order.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update timestamps based on status
    const updateData = { status };
    const now = new Date();

    switch (status) {
      case "preparing":
        updateData.estimatedReadyTime = new Date(now.getTime() + 30 * 60000); // 30 minutes
        break;
      case "ready":
        updateData.actualReadyTime = now;
        break;
      case "served":
        updateData.servedAt = now;
        break;
      case "completed":
        updateData.completedAt = now;
        break;
      case "cancelled":
        updateData.cancelledAt = now;
        break;
    }

    await order.update(updateData);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Reservation,
          as: "reservation",
          attributes: ["reservationNumber", "partySize"],
        },
        {
          model: Guest,
          as: "guest",
          attributes: ["firstName", "lastName", "phone"],
        },
        { model: User, as: "server", attributes: ["firstName", "lastName"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "price"] },
          ],
        },
      ],
    });

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const order = await Order.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Soft delete by updating status
    await order.update({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Deleted by staff",
    });

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
