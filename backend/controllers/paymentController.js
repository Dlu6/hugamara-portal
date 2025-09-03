import { Op } from "sequelize";
import { Payment, Order, Outlet } from "../models/index.js";

export const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      paymentMethod,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
    } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };

    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
    }

    if (search) {
      whereClause[Op.or] = [
        { paymentNumber: { [Op.iLike]: `%${search}%` } },
        { transactionId: { [Op.iLike]: `%${search}%` } },
        { referenceNumber: { [Op.iLike]: `%${search}%` } },
        { receiptNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "orderNumber",
            "orderType",
            "totalAmount",
            "status",
          ],
        },
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
      payments: payments.rows,
      total: payments.count,
      page: parseInt(page),
      totalPages: Math.ceil(payments.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const payment = await Payment.findOne({
      where: { id, outletId: userOutletId },
      include: [
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "orderNumber",
            "orderType",
            "totalAmount",
            "status",
          ],
        },
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

export const createPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    // Generate payment number if not provided
    if (!paymentData.paymentNumber) {
      const outletCode = req.user.outlet?.code || "OUT";
      const count = await Payment.count({ where: { outletId: userOutletId } });
      paymentData.paymentNumber = `PAY-${outletCode}-${String(
        count + 1
      ).padStart(6, "0")}`;
    }

    // Generate receipt number if not provided
    if (!paymentData.receiptNumber) {
      const outletCode = req.user.outlet?.code || "OUT";
      const count = await Payment.count({ where: { outletId: userOutletId } });
      paymentData.receiptNumber = `RCP-${outletCode}-${String(
        count + 1
      ).padStart(6, "0")}`;
    }

    const payment = await Payment.create(paymentData);

    const fullPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "orderNumber",
            "orderType",
            "totalAmount",
            "status",
          ],
        },
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.status(201).json({ payment: fullPayment });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const payment = await Payment.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await payment.update(req.body);

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: [
            "id",
            "orderNumber",
            "orderType",
            "totalAmount",
            "status",
          ],
        },
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });

    res.json({ payment: updatedPayment });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ error: "Failed to update payment" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const payment = await Payment.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Only allow deletion of pending payments
    if (payment.paymentStatus !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending payments can be deleted" });
    }

    await payment.destroy();

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const { period = "today" } = req.query;
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
      totalPayments,
      totalAmount,
      byMethod,
      byStatus,
      avgPayment,
      completedPayments,
    ] = await Promise.all([
      Payment.count({
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
      Payment.findAll({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          "paymentMethod",
          [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
          [
            Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")),
            "total",
          ],
        ],
        group: ["paymentMethod"],
        raw: true,
      }),
      Payment.findAll({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          "paymentStatus",
          [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
        ],
        group: ["paymentStatus"],
        raw: true,
      }),
      Payment.findOne({
        where: { outletId: userOutletId, createdAt: dateFilter },
        attributes: [
          [Payment.sequelize.fn("AVG", Payment.sequelize.col("amount")), "avg"],
        ],
        raw: true,
      }),
      Payment.count({
        where: {
          outletId: userOutletId,
          paymentStatus: "completed",
          createdAt: dateFilter,
        },
      }),
    ]);

    res.json({
      stats: {
        totalPayments,
        totalAmount: parseFloat(totalAmount?.total) || 0,
        completedPayments,
        avgPayment: parseFloat(avgPayment?.avg) || 0,
        byMethod: byMethod.reduce((acc, item) => {
          acc[item.paymentMethod] = {
            count: parseInt(item.count),
            total: parseFloat(item.total),
          };
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.paymentStatus] = parseInt(item.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ error: "Failed to fetch payment stats" });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, referenceNumber } = req.body;
    const userOutletId = req.user.outletId;

    const payment = await Payment.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.paymentStatus !== "pending") {
      return res
        .status(400)
        .json({ error: "Payment is not in pending status" });
    }

    await payment.update({
      paymentStatus: "processing",
      transactionId,
      referenceNumber,
      processedAt: new Date(),
    });

    // Simulate payment processing (in real app, integrate with payment gateway)
    setTimeout(async () => {
      try {
        await payment.update({
          paymentStatus: "completed",
        });
      } catch (error) {
        console.error("Payment processing error:", error);
      }
    }, 2000);

    res.json({ message: "Payment processing initiated" });
  } catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason, refundAmount } = req.body;
    const userOutletId = req.user.outletId;

    const payment = await Payment.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (!payment.isRefundable()) {
      return res.status(400).json({ error: "Payment is not refundable" });
    }

    const refundAmt = refundAmount || payment.amount;

    if (refundAmt > payment.amount) {
      return res
        .status(400)
        .json({ error: "Refund amount cannot exceed payment amount" });
    }

    const newStatus =
      refundAmt === payment.amount ? "refunded" : "partially_refunded";

    await payment.update({
      paymentStatus: newStatus,
      refundedAt: new Date(),
      refundReason,
      discountAmount: (payment.discountAmount || 0) + refundAmt,
    });

    res.json({ message: "Payment refunded successfully" });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({ error: "Failed to refund payment" });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const methods = await Payment.findAll({
      where: { outletId: userOutletId },
      attributes: [
        "paymentMethod",
        [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "total"],
      ],
      group: ["paymentMethod"],
      order: [
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "DESC"],
      ],
      raw: true,
    });

    res.json({ methods });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
};
