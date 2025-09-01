import { Op } from 'sequelize';
import { Inventory } from '../models/index.js';

export const getAllInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, lowStock } = req.query;
    const userOutletId = req.user.outletId;
    
    const whereClause = { outletId: userOutletId, isActive: true };
    if (category) whereClause.category = category;
    if (lowStock === 'true') {
      whereClause[Op.and] = [
        { currentStock: { [Op.lte]: { [Op.col]: 'reorderPoint' } } }
      ];
    }

    const inventory = await Inventory.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['itemName', 'ASC']]
    });

    res.json({
      inventory: inventory.rows,
      total: inventory.count,
      page: parseInt(page),
      totalPages: Math.ceil(inventory.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' or 'subtract'

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const newStock = type === 'add' 
      ? parseFloat(item.currentStock) + parseFloat(quantity)
      : parseFloat(item.currentStock) - parseFloat(quantity);

    await item.update({ currentStock: Math.max(0, newStock) });
    res.json({ item });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
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
          { currentStock: { [Op.lte]: { [Op.col]: 'reorderPoint' } } }
        ]
      },
      order: [['currentStock', 'ASC']]
    });

    res.json({ items: lowStockItems });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
};
