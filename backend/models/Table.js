import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Table = sequelize.define('Table', {
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
  tableNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'table_number'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  minCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'min_capacity'
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 8,
    field: 'max_capacity'
  },
  tableType: {
    type: DataTypes.ENUM(
      'standard',
      'booth',
      'bar',
      'high_top',
      'outdoor',
      'private',
      'vip',
      'wheelchair_accessible'
    ),
    allowNull: false,
    defaultValue: 'standard',
    field: 'table_type'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  area: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  isReservable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_reservable'
  },
  isWheelchairAccessible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_wheelchair_accessible'
  },
  hasPowerOutlet: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'has_power_outlet'
  },
  hasView: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'has_view'
  },
  isSmoking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_smoking'
  },
  status: {
    type: DataTypes.ENUM(
      'available',
      'occupied',
      'reserved',
      'cleaning',
      'maintenance',
      'out_of_service'
    ),
    allowNull: false,
    defaultValue: 'available'
  },
  // currentReservationId and currentOrderId removed to simplify associations
  // assignedServerId removed to simplify associations
  lastCleanedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_cleaned_at'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { x: 0, y: 0 }
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
  // Audit fields removed to avoid MySQL key limit issues
}, {
  tableName: 'tables',
  timestamps: true,
  underscored: true
});

// Instance methods
Table.prototype.isAvailable = function() {
  return this.status === 'available' && this.isActive;
};

Table.prototype.canAccommodate = function(partySize) {
  return partySize >= this.minCapacity && partySize <= this.maxCapacity;
};

Table.prototype.getOccupancyStatus = function() {
  if (this.status === 'occupied') {
    return 'Occupied';
  } else if (this.status === 'reserved') {
    return 'Reserved';
  } else if (this.status === 'cleaning') {
    return 'Cleaning';
  } else if (this.status === 'maintenance') {
    return 'Maintenance';
  } else if (this.status === 'out_of_service') {
    return 'Out of Service';
  } else {
    return 'Available';
  }
};

Table.prototype.requiresCleaning = function() {
  if (!this.lastCleanedAt) return true;
  const now = new Date();
  const lastCleaned = new Date(this.lastCleanedAt);
  const hoursSinceCleaning = (now - lastCleaned) / (1000 * 60 * 60);
  return hoursSinceCleaning > 4; // Clean every 4 hours
};

export default Table;