import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Event = sequelize.define('Event', {
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'birthday',
      'anniversary',
      'corporate',
      'live_band',
      'dj_night',
      'special_dinner',
      'wine_tasting',
      'other'
    ),
    allowNull: false,
    field: 'event_type'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  expectedAttendance: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'expected_attendance'
  },
  actualAttendance: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'actual_attendance'
  },
  isTicketed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_ticketed'
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'ticket_price'
  },
  ticketQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ticket_quantity'
  },
  ticketsSold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'tickets_sold'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  actualCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'actual_cost'
  },
  revenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  performers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  marketingPlan: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'marketing_plan'
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
  attachments: {
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
  tableName: 'events',
  timestamps: true,
  underscored: true
});

// Instance methods
Event.prototype.getFullStartDateTime = function() {
  const startDate = new Date(this.startDate);
  const startTime = this.startTime;
  startDate.setHours(startTime.getHours(), startTime.getMinutes());
  return startDate;
};

Event.prototype.getFullEndDateTime = function() {
  const endDate = new Date(this.endDate);
  const endTime = this.endTime;
  endDate.setHours(endTime.getHours(), endTime.getMinutes());
  return endDate;
};

Event.prototype.isUpcoming = function() {
  const now = new Date();
  const startDateTime = this.getFullStartDateTime();
  return startDateTime > now && this.status === 'published';
};

Event.prototype.isActive = function() {
  const now = new Date();
  const startDateTime = this.getFullStartDateTime();
  const endDateTime = this.getFullEndDateTime();
  return now >= startDateTime && now <= endDateTime && this.status === 'active';
};

Event.prototype.getAttendanceRate = function() {
  if (!this.capacity || !this.actualAttendance) return 0;
  return Math.round((this.actualAttendance / this.capacity) * 100);
};

Event.prototype.getTicketSalesRate = function() {
  if (!this.ticketQuantity || !this.ticketsSold) return 0;
  return Math.round((this.ticketsSold / this.ticketQuantity) * 100);
};

export default Event;