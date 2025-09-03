import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { Inventory } from "../models/index.js";

export const getAllInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      lowStock,
      search,
      expired,
    } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId, isActive: true };

    if (category) whereClause.category = category;

    if (search) {
      whereClause[Op.or] = [
        { itemName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (lowStock === "true") {
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.col("current_stock"),
          Op.lte,
          sequelize.col("reorder_point")
        ),
      ];
    }

    if (expired === "true") {
      whereClause.expiryDate = { [Op.lt]: new Date() };
    }

    const inventory = await Inventory.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["itemName", "ASC"]],
    });

    res.json({
      inventory: inventory.rows,
      total: inventory.count,
      page: parseInt(page),
      totalPages: Math.ceil(inventory.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const item = await Inventory.findOne({
      where: { id, outletId: userOutletId, isActive: true },
    });

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ item });
  } catch (error) {
    console.error("Get inventory item error:", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    const item = await Inventory.create(inventoryData);
    res.status(201).json({ item });
  } catch (error) {
    console.error("Create inventory item error:", error);
    res.status(500).json({ error: "Failed to create inventory item" });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const item = await Inventory.findOne({
      where: { id, outletId: userOutletId, isActive: true },
    });

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    await item.update(req.body);
    res.json({ item });
  } catch (error) {
    console.error("Update inventory item error:", error);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const item = await Inventory.findOne({
      where: { id, outletId: userOutletId, isActive: true },
    });

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    await item.update({ isActive: false });
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Delete inventory item error:", error);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' or 'subtract'

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const newStock =
      type === "add"
        ? parseFloat(item.currentStock) + parseFloat(quantity)
        : parseFloat(item.currentStock) - parseFloat(quantity);

    await item.update({ currentStock: Math.max(0, newStock) });
    res.json({ item });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const lowStockItems = await Inventory.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.col("current_stock"),
            Op.lte,
            sequelize.col("reorder_point")
          ),
        ],
      },
      order: [["currentStock", "ASC"]],
    });

    res.json({ items: lowStockItems });
  } catch (error) {
    console.error("Get low stock items error:", error);
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
};

export const getExpiringItems = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userOutletId = req.user.outletId;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringItems = await Inventory.findAll({
      where: {
        outletId: userOutletId,
        isActive: true,
        isPerishable: true,
        expiryDate: {
          [Op.between]: [new Date(), futureDate],
        },
      },
      order: [["expiryDate", "ASC"]],
    });

    res.json({ items: expiringItems });
  } catch (error) {
    console.error("Get expiring items error:", error);
    res.status(500).json({ error: "Failed to fetch expiring items" });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const [
      totalItems,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      totalValue,
    ] = await Promise.all([
      Inventory.count({ where: { outletId: userOutletId, isActive: true } }),
      Inventory.count({
        where: {
          outletId: userOutletId,
          isActive: true,
          [Op.and]: [
            sequelize.where(
              sequelize.col("current_stock"),
              Op.lte,
              sequelize.col("reorder_point")
            ),
          ],
        },
      }),
      Inventory.count({
        where: {
          outletId: userOutletId,
          isActive: true,
          currentStock: 0,
        },
      }),
      Inventory.count({
        where: {
          outletId: userOutletId,
          isActive: true,
          isPerishable: true,
          expiryDate: {
            [Op.between]: [
              new Date(),
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ],
          },
        },
      }),
      Inventory.findAll({
        where: { outletId: userOutletId, isActive: true },
        attributes: ["currentStock", "unitCost"],
        raw: true,
      }).then((items) => {
        return items.reduce((total, item) => {
          const stock =
            parseFloat(item.current_stock || item.currentStock) || 0;
          const cost = parseFloat(item.unit_cost || item.unitCost) || 0;
          return total + stock * cost;
        }, 0);
      }),
    ]);

    res.json({
      stats: {
        totalItems,
        lowStockCount,
        outOfStockCount,
        expiringCount,
        totalValue: totalValue || 0,
      },
    });
  } catch (error) {
    console.error("Get inventory stats error:", error);
    res.status(500).json({ error: "Failed to fetch inventory stats" });
  }
};

export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, quantity, type }
    const userOutletId = req.user.outletId;

    const results = [];

    for (const update of updates) {
      const item = await Inventory.findOne({
        where: { id: update.id, outletId: userOutletId, isActive: true },
      });

      if (!item) {
        results.push({ id: update.id, error: "Item not found" });
        continue;
      }

      const newStock =
        update.type === "add"
          ? parseFloat(item.currentStock) + parseFloat(update.quantity)
          : parseFloat(item.currentStock) - parseFloat(update.quantity);

      await item.update({ currentStock: Math.max(0, newStock) });
      results.push({ id: update.id, success: true, newStock });
    }

    res.json({ results });
  } catch (error) {
    console.error("Bulk update stock error:", error);
    res.status(500).json({ error: "Failed to bulk update stock" });
  }
};
