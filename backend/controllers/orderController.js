import { Op } from 'sequelize';
import { Order, OrderItem, MenuItem, Table, Guest, Payment } from '../models/index.js';

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userOutletId = req.user.outletId;
    
    const whereClause = { outletId: userOutletId };
    if (status) whereClause.status = status;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: Table, as: 'table', attributes: ['tableNumber'] },
        { model: Guest, as: 'guest', attributes: ['firstName', 'lastName'] },
        { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    
    const order = await Order.create({
      ...orderData,
      outletId: req.user.outletId,
      orderNumber: `ORD${Date.now()}`,
      createdBy: req.user.id
    });

    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        orderId: order.id,
        totalPrice: item.quantity * item.unitPrice
      }));
      
      await OrderItem.bulkCreate(orderItems);
      
      // Update order total
      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      await order.update({ 
        subtotal,
        totalAmount: subtotal + (order.taxAmount || 0) - (order.discountAmount || 0)
      });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] },
        { model: Table, as: 'table', attributes: ['tableNumber'] }
      ]
    });

    res.status(201).json({ order: fullOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });
    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
