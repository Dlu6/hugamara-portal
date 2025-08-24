import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'ticket_number'
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
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'guest_complaint',
      'equipment_failure',
      'safety_security',
      'facility',
      'it',
      'hr',
      'supplier',
      'other'
    ),
    allowNull: false,
    defaultValue: 'other'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'waiting', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_to',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reported_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  guestId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'guest_id',
    references: {
      model: 'guests',
      key: 'id'
    }
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reservation_id',
    references: {
      model: 'reservations',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estimatedResolutionTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    field: 'estimated_resolution_time'
  },
  actualResolutionTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    field: 'actual_resolution_time'
  },
  slaTarget: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    field: 'sla_target'
  },
  slaBreached: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'sla_breached'
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
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'resolution_notes'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
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
  tableName: 'tickets',
  timestamps: true,
  underscored: true
});

// Instance methods
Ticket.prototype.getPriorityColor = function() {
  const priorityColors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    critical: 'danger'
  };
  return priorityColors[this.priority] || 'secondary';
};

Ticket.prototype.getStatusColor = function() {
  const statusColors = {
    open: 'danger',
    in_progress: 'warning',
    waiting: 'info',
    resolved: 'success',
    closed: 'secondary'
  };
  return statusColors[this.status] || 'secondary';
};

Ticket.prototype.isOverdue = function() {
  if (!this.slaTarget || this.status === 'resolved' || this.status === 'closed') {
    return false;
  }
  
  const createdAt = new Date(this.createdAt);
  const now = new Date();
  const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));
  
  return elapsedMinutes > this.slaTarget;
};

Ticket.prototype.calculateResolutionTime = function() {
  if (this.resolvedAt && this.createdAt) {
    const created = new Date(this.createdAt);
    const resolved = new Date(this.resolvedAt);
    this.actualResolutionTime = Math.floor((resolved - created) / (1000 * 60));
  }
};

export default Ticket;