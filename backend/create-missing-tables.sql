-- Create all missing tables for Hugamara Hospitality Management System
-- Run this in your MariaDB console: source create-missing-tables.sql

-- Tables table
CREATE TABLE IF NOT EXISTS `tables` (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  table_number VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  capacity INT NOT NULL,
  min_capacity INT DEFAULT 1,
  max_capacity INT,
  table_type ENUM('standard', 'booth', 'bar', 'outdoor', 'private') DEFAULT 'standard',
  location VARCHAR(100),
  area VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_reservable BOOLEAN DEFAULT true,
  is_wheelchair_accessible BOOLEAN DEFAULT false,
  has_power_outlet BOOLEAN DEFAULT false,
  has_view BOOLEAN DEFAULT false,
  is_smoking BOOLEAN DEFAULT false,
  status ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance') DEFAULT 'available',
  last_cleaned_at TIMESTAMP NULL,
  notes TEXT,
  coordinates JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_table_number (table_number),
  UNIQUE KEY unique_table_outlet (outlet_id, table_number)
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  preferences JSON,
  allergies TEXT,
  dietary_restrictions TEXT,
  loyalty_points INT DEFAULT 0,
  loyalty_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  visit_count INT DEFAULT 0,
  last_visit_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  marketing_consent BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  notes TEXT,
  tags JSON,
  outlet_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(36) PRIMARY KEY,
  reservation_number VARCHAR(20) UNIQUE NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  table_id VARCHAR(36),
  guest_id VARCHAR(36),
  party_size INT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_table_id (table_id),
  INDEX idx_guest_id (guest_id),
  INDEX idx_reservation_date (reservation_date),
  INDEX idx_status (status)
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens TEXT,
  dietary_tags JSON,
  preparation_time INT,
  calories INT,
  image_url VARCHAR(500),
  ingredients TEXT,
  nutritional_info JSON,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_category (category),
  INDEX idx_is_available (is_available)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  table_id VARCHAR(36),
  reservation_id VARCHAR(36),
  guest_id VARCHAR(36),
  server_id VARCHAR(36),
  order_type ENUM('dine_in', 'takeaway', 'delivery', 'bar', 'bottle_service') NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_table_id (table_id),
  INDEX idx_reservation_id (reservation_id),
  INDEX idx_guest_id (guest_id),
  INDEX idx_server_id (server_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  menu_item_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'preparing', 'ready', 'served') DEFAULT 'pending',
  instructions TEXT,
  modifiers JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_menu_item_id (menu_item_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'mobile_money', 'bank_transfer', 'voucher') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_payment_status (payment_status)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  current_stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  max_stock INT DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0.00,
  unit_price DECIMAL(10,2) DEFAULT 0.00,
  supplier VARCHAR(255),
  last_restock_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(10,2),
  status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_email (email)
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  staff_id VARCHAR(36),
  shift_type ENUM('morning', 'afternoon', 'evening', 'night') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_date DATE NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_shift_date (shift_date)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type ENUM('private_party', 'corporate_event', 'wedding', 'conference', 'other') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue VARCHAR(255),
  capacity INT,
  status ENUM('planned', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_start_date (start_date),
  INDEX idx_status (status)
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to VARCHAR(36),
  created_by VARCHAR(36),
  due_date TIMESTAMP NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_is_active (is_active)
);

-- Show all tables after creation
SHOW TABLES;
