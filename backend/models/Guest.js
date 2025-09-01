import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Guest = sequelize.define('Guest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_of_birth'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Uganda'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  allergies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dietaryRestrictions: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'dietary_restrictions',
    defaultValue: []
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'loyalty_points'
  },
  loyaltyTier: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'vip'),
    allowNull: false,
    defaultValue: 'bronze',
    field: 'loyalty_tier'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'total_spent'
  },
  visitCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'visit_count'
  },
  lastVisitAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_visit_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  marketingConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'marketing_consent'
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'email_verified_at'
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'phone_verified_at'
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
  // Audit fields removed to avoid MySQL key limit issues
}, {
  tableName: 'guests',
  timestamps: true,
  underscored: true
});

// Instance methods
Guest.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Guest.prototype.getAge = function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

Guest.prototype.updateLoyaltyTier = function() {
  if (this.totalSpent >= 1000000) {
    this.loyaltyTier = 'vip';
  } else if (this.totalSpent >= 500000) {
    this.loyaltyTier = 'platinum';
  } else if (this.totalSpent >= 200000) {
    this.loyaltyTier = 'gold';
  } else if (this.totalSpent >= 50000) {
    this.loyaltyTier = 'silver';
  } else {
    this.loyaltyTier = 'bronze';
  }
};

export default Guest;