import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Shift = sequelize.define('Shift', {
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
  staffId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'staff_id',
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  shiftDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'shift_date'
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
  breakStartTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'break_start_time'
  },
  breakEndTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'break_end_time'
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    ),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  shiftType: {
    type: DataTypes.ENUM(
      'regular',
      'overtime',
      'holiday',
      'weekend',
      'night',
      'split'
    ),
    allowNull: false,
    defaultValue: 'regular'
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  section: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tables: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  clockInTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clock_in_time'
  },
  clockOutTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clock_out_time'
  },
  actualStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_start_time'
  },
  actualEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_end_time'
  },
  totalHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    field: 'total_hours'
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    field: 'overtime_hours'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_approved'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
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
  tableName: 'shifts',
  timestamps: true,
  underscored: true
});

// Instance methods
Shift.prototype.getShiftDuration = function() {
  if (this.clockInTime && this.clockOutTime) {
    const start = new Date(this.clockInTime);
    const end = new Date(this.clockOutTime);
    return (end - start) / (1000 * 60 * 60); // hours
  }
  return null;
};

Shift.prototype.isLate = function() {
  if (!this.clockInTime || !this.startTime) return false;
  const clockIn = new Date(this.clockInTime);
  const scheduledStart = new Date(this.shiftDate + ' ' + this.startTime);
  const lateThreshold = 15; // 15 minutes
  return (clockIn - scheduledStart) / (1000 * 60) > lateThreshold;
};

Shift.prototype.isOvertime = function() {
  const regularHours = 8; // Standard work day
  return this.totalHours > regularHours;
};

Shift.prototype.getBreakDuration = function() {
  if (this.breakStartTime && this.breakEndTime) {
    const start = new Date(this.breakStartTime);
    const end = new Date(this.breakEndTime);
    return (end - start) / (1000 * 60); // minutes
  }
  return null;
};

Shift.prototype.isCurrentlyWorking = function() {
  const now = new Date();
  if (!this.clockInTime || !this.clockOutTime) return false;
  
  const clockIn = new Date(this.clockInTime);
  const clockOut = new Date(this.clockOutTime);
  
  return now >= clockIn && now <= clockOut;
};

export default Shift;