import { Op } from "sequelize";
import { MenuItem } from "../models/index.js";

export const getAllMenuItems = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };
    if (category) whereClause.category = category;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const menuItems = await MenuItem.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [
        ["category", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.json({
      menuItems: menuItems.rows,
      total: menuItems.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(menuItems.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const menuItem = await MenuItem.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({ menuItem });
  } catch (error) {
    console.error("Get menu item error:", error);
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const menuItemData = {
      ...req.body,
      outletId: req.user.outletId,
    };

    const menuItem = await MenuItem.create(menuItemData);
    res.status(201).json({ menuItem });
  } catch (error) {
    console.error("Create menu item error:", error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const menuItem = await MenuItem.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await menuItem.update(req.body);
    res.json({ menuItem });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const menuItem = await MenuItem.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await menuItem.destroy();
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};

export const getMenuStats = async (req, res) => {
  try {
    const userOutletId = req.user.outletId;

    const [
      totalItems,
      availableItems,
      unavailableItems,
      featuredItems,
      byCategory,
      avgPrice,
      totalValue,
    ] = await Promise.all([
      MenuItem.count({ where: { outletId: userOutletId } }),
      MenuItem.count({ where: { outletId: userOutletId, isAvailable: true } }),
      MenuItem.count({ where: { outletId: userOutletId, isAvailable: false } }),
      MenuItem.count({ where: { outletId: userOutletId, isFeatured: true } }),
      MenuItem.findAll({
        where: { outletId: userOutletId },
        attributes: [
          "category",
          [
            MenuItem.sequelize.fn("COUNT", MenuItem.sequelize.col("id")),
            "count",
          ],
        ],
        group: ["category"],
        raw: true,
      }),
      MenuItem.findOne({
        where: { outletId: userOutletId },
        attributes: [
          [
            MenuItem.sequelize.fn("AVG", MenuItem.sequelize.col("price")),
            "avgPrice",
          ],
        ],
        raw: true,
      }),
      MenuItem.findOne({
        where: { outletId: userOutletId },
        attributes: [
          [
            MenuItem.sequelize.fn("SUM", MenuItem.sequelize.col("price")),
            "totalValue",
          ],
        ],
        raw: true,
      }),
    ]);

    res.json({
      stats: {
        totalItems: totalItems || 0,
        availableItems: availableItems || 0,
        unavailableItems: unavailableItems || 0,
        featuredItems: featuredItems || 0,
        avgPrice: parseFloat(avgPrice?.avgPrice) || 0,
        totalValue: parseFloat(totalValue?.totalValue) || 0,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = parseInt(item.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get menu stats error:", error);
    res.status(500).json({ error: "Failed to fetch menu stats" });
  }
};
