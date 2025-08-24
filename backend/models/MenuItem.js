import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const MenuItem = sequelize.define('MenuItem', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'alcoholic',
      'non_alcoholic',
      'special',
      'side_dish'
    ),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'cost_price'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_available'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_featured'
  },
  allergens: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dietaryTags: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'dietary_tags',
    defaultValue: []
  },
  preparationTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    field: 'preparation_time'
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url'
  },
  ingredients: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  nutritionalInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'nutritional_info'
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
  tableName: 'menu_items',
  timestamps: true,
  underscored: true
});

// Instance methods
MenuItem.prototype.getProfitMargin = function() {
  if (!this.cost || !this.price) return null;
  return ((this.price - this.cost) / this.price * 100).toFixed(2);
};

MenuItem.prototype.isVegetarian = function() {
  return this.dietaryTags && this.dietaryTags.includes('vegetarian');
};

MenuItem.prototype.isVegan = function() {
  return this.dietaryTags && this.dietaryTags.includes('vegan');
};

MenuItem.prototype.isGlutenFree = function() {
  return this.dietaryTags && this.dietaryTags.includes('gluten_free');
};

export default MenuItem;