import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Reservation = sequelize.define('Reservation', {
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
  guestId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'guest_id',
    references: {
      model: 'guests',
      key: 'id'
    }
  },
  reservationNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'reservation_number'
  },
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'reservation_date'
  },
  reservationTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'reservation_time'
  },
  partySize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'party_size'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'seated',
      'completed',
      'cancelled',
      'no_show'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  source: {
    type: DataTypes.ENUM('phone', 'web', 'walk_in', 'social', 'email', 'whatsapp'),
    allowNull: false,
    defaultValue: 'phone'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_requests'
  },
  tablePreference: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'table_preference'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'deposit_amount'
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'deposit_paid'
  },
  confirmationSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'confirmation_sent'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'reminder_sent'
  },
  seatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'seated_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at'
  },
  cancellationReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'cancellation_reason'
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
  tableName: 'reservations',
  timestamps: true,
  underscored: true
});

// Instance methods
Reservation.prototype.getFullDateTime = function() {
  const date = new Date(this.reservationDate);
  const time = this.reservationTime;
  date.setHours(time.getHours(), time.getMinutes());
  return date;
};

Reservation.prototype.isOverdue = function() {
  const now = new Date();
  const reservationDateTime = this.getFullDateTime();
  return now > reservationDateTime && this.status === 'confirmed';
};

Reservation.prototype.getStatusColor = function() {
  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    seated: 'success',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'danger'
  };
  return statusColors[this.status] || 'secondary';
};

export default Reservation;