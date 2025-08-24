import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  menuItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'menu_item_id',
    references: {
      model: 'menu_items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_instructions'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'preparing',
      'ready',
      'served',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  preparationStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'preparation_start_time'
  },
  preparationEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'preparation_end_time'
  },
  servedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'served_at'
  },
  isComped: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_comped'
  },
  compReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'comp_reason'
  },
  compApprovedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'comp_approved_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  modifiers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  allergens: {
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
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  underscored: true
});

// Instance methods
OrderItem.prototype.getPreparationTime = function() {
  if (this.preparationStartTime && this.preparationEndTime) {
    const start = new Date(this.preparationStartTime);
    const end = new Date(this.preparationEndTime);
    return Math.floor((end - start) / (1000 * 60)); // minutes
  }
  return null;
};

OrderItem.prototype.isOverdue = function() {
  if (!this.preparationStartTime) return false;
  const now = new Date();
  const start = new Date(this.preparationStartTime);
  const estimatedTime = 15; // default 15 minutes
  const estimatedEnd = new Date(start.getTime() + (estimatedTime * 60 * 1000));
  return now > estimatedEnd && this.status !== 'ready' && this.status !== 'served';
};

export default OrderItem;