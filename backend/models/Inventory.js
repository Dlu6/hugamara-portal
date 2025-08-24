import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  outletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'outlet_id',
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  itemName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'item_name'
  },
  category: {
    type: DataTypes.ENUM(
      'food',
      'beverage',
      'alcohol',
      'cleaning',
      'packaging',
      'equipment',
      'other'
    ),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'piece'
  },
  currentStock: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    field: 'current_stock'
  },
  minimumStock: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    field: 'minimum_stock'
  },
  maximumStock: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    field: 'maximum_stock'
  },
  reorderPoint: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    field: 'reorder_point'
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'unit_cost'
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'supplier_id'
  },
  supplierName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'supplier_name'
  },
  leadTime: {
    type: DataTypes.INTEGER, // in days
    allowNull: true,
    field: 'lead_time'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expiry_date'
  },
  isPerishable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_perishable'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'updated_by'
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  underscored: true
});

// Instance methods
Inventory.prototype.isLowStock = function() {
  return this.currentStock <= this.reorderPoint;
};

Inventory.prototype.isOutOfStock = function() {
  return this.currentStock <= 0;
};

Inventory.prototype.needsReorder = function() {
  return this.currentStock <= this.reorderPoint;
};

Inventory.prototype.getStockValue = function() {
  if (!this.unitCost) return 0;
  return this.currentStock * this.unitCost;
};

Inventory.prototype.isExpiringSoon = function(days = 7) {
  if (!this.expiryDate) return false;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays > 0;
};

Inventory.prototype.isExpired = function() {
  if (!this.expiryDate) return false;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  return now > expiry;
};

export default Inventory;