#!/bin/bash

# Hugamara EC2 Deployment Script
# This script sets up the complete deployment environment on EC2

set -e

echo "🚀 Starting Hugamara deployment on EC2..."

# Configurable variables
PROJECT_DIR=/home/admin/hugamara-portal
DOMAIN=cs.hugamara.com
DB_ROOT_PASSWORD="Pasword@256"
DB_APP_PASSWORD="Pasword@256"
DB_NAME="hugamara_db"
DB_USER="hugamara_user"

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install MariaDB
echo "📦 Installing MariaDB..."
apt install -y mariadb-server mariadb-client

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot

# Start and enable services
echo "🔄 Starting and enabling services..."
systemctl start nginx
systemctl enable nginx
systemctl start mariadb
systemctl enable mariadb

# Secure MariaDB installation
echo "🔒 Securing MariaDB..."
mysql_secure_installation <<EOF

y
${DB_ROOT_PASSWORD}
${DB_ROOT_PASSWORD}
y
y
y
y
EOF

# Create database and user
echo "🗄️ Setting up database..."
mysql -u root -p"${DB_ROOT_PASSWORD}" <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/admin/logs

# Clone the repository
echo "📥 Ensuring project directory exists..."
cd /home/admin
if [ -d "${PROJECT_DIR}" ]; then
  echo "ℹ️ Project directory ${PROJECT_DIR} already exists. Skipping clone."
else
  echo "❗ PROJECT_DIR ${PROJECT_DIR} not found. Please clone your repo into this path with the development branch."
  echo "   Example: git clone <REPO_URL> ${PROJECT_DIR} && cd ${PROJECT_DIR} && git checkout development"
  exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd ${PROJECT_DIR}/backend
npm install --production

echo "📦 Installing frontend dependencies..."
cd ${PROJECT_DIR}/client
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

############### SSL + Nginx setup ###############
# Obtain SSL certificate first (standalone), then enable SSL in nginx
echo "🔒 Obtaining SSL certificate (standalone)..."
systemctl stop nginx
certbot certonly --standalone -d ${DOMAIN} --non-interactive --agree-tos --email admin@hugamara.com || true
systemctl start nginx

# Configure nginx site with SSL
echo "🌐 Setting up Nginx configuration..."
cp ${PROJECT_DIR}/nginx-hugamara.conf /etc/nginx/sites-available/hugamara
ln -sf /etc/nginx/sites-available/hugamara /etc/nginx/sites-enabled/hugamara
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Run production database migrations
echo "🗄️ Running production database migrations..."

# Create missing tables
echo "📋 Creating missing tables..."
mysql -u root -p"${DB_ROOT_PASSWORD}" ${DB_NAME} < ${PROJECT_DIR}/backend/create-missing-tables.sql

# Add missing columns to existing tables
echo "🔧 Adding missing columns to existing tables..."
mysql -u root -p"${DB_ROOT_PASSWORD}" ${DB_NAME} << 'EOF'
-- Orders table
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `priority` ENUM('low','normal','high','urgent') DEFAULT 'normal' AFTER `status`,
  ADD COLUMN IF NOT EXISTS `discount_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `tax_amount`,
  ADD COLUMN IF NOT EXISTS `payment_method` ENUM('cash','card','mobile_money','bank_transfer','voucher') DEFAULT 'cash' AFTER `payment_status`,
  ADD COLUMN IF NOT EXISTS `special_instructions` TEXT AFTER `payment_method`,
  ADD COLUMN IF NOT EXISTS `estimated_ready_time` DATETIME NULL AFTER `special_instructions`,
  ADD COLUMN IF NOT EXISTS `actual_ready_time` DATETIME NULL AFTER `estimated_ready_time`,
  ADD COLUMN IF NOT EXISTS `served_at` DATETIME NULL AFTER `actual_ready_time`,
  ADD COLUMN IF NOT EXISTS `completed_at` DATETIME NULL AFTER `served_at`,
  ADD COLUMN IF NOT EXISTS `cancelled_at` DATETIME NULL AFTER `completed_at`,
  ADD COLUMN IF NOT EXISTS `cancellation_reason` TEXT AFTER `cancelled_at`,
  ADD COLUMN IF NOT EXISTS `tags` JSON AFTER `notes`;

-- Reservations table
ALTER TABLE `reservations`
  ADD COLUMN IF NOT EXISTS `source` VARCHAR(50) NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `table_preference` VARCHAR(100) NULL AFTER `special_requests`,
  ADD COLUMN IF NOT EXISTS `deposit_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `table_preference`,
  ADD COLUMN IF NOT EXISTS `deposit_paid` BOOLEAN DEFAULT false AFTER `deposit_amount`,
  ADD COLUMN IF NOT EXISTS `confirmation_sent` BOOLEAN DEFAULT false AFTER `deposit_paid`,
  ADD COLUMN IF NOT EXISTS `reminder_sent` BOOLEAN DEFAULT false AFTER `confirmation_sent`,
  ADD COLUMN IF NOT EXISTS `seated_at` DATETIME NULL AFTER `reminder_sent`,
  ADD COLUMN IF NOT EXISTS `completed_at` DATETIME NULL AFTER `seated_at`,
  ADD COLUMN IF NOT EXISTS `cancelled_at` DATETIME NULL AFTER `completed_at`,
  ADD COLUMN IF NOT EXISTS `cancellation_reason` TEXT AFTER `cancelled_at`,
  ADD COLUMN IF NOT EXISTS `tags` JSON AFTER `notes`;

-- Order Items table
ALTER TABLE `order_items`
  ADD COLUMN IF NOT EXISTS `special_instructions` TEXT AFTER `total_price`,
  ADD COLUMN IF NOT EXISTS `preparation_start_time` DATETIME NULL AFTER `special_instructions`,
  ADD COLUMN IF NOT EXISTS `preparation_end_time` DATETIME NULL AFTER `preparation_start_time`,
  ADD COLUMN IF NOT EXISTS `served_at` DATETIME NULL AFTER `preparation_end_time`,
  ADD COLUMN IF NOT EXISTS `is_comped` BOOLEAN DEFAULT false AFTER `served_at`,
  ADD COLUMN IF NOT EXISTS `comp_reason` TEXT AFTER `is_comped`,
  ADD COLUMN IF NOT EXISTS `allergens` TEXT AFTER `comp_reason`;

-- Inventory table
ALTER TABLE `inventory`
  ADD COLUMN IF NOT EXISTS `subcategory` VARCHAR(100) NULL AFTER `category`,
  ADD COLUMN IF NOT EXISTS `sku` VARCHAR(50) NULL AFTER `subcategory`,
  ADD COLUMN IF NOT EXISTS `barcode` VARCHAR(50) NULL AFTER `sku`,
  ADD COLUMN IF NOT EXISTS `unit` VARCHAR(20) DEFAULT 'piece' AFTER `description`,
  ADD COLUMN IF NOT EXISTS `minimum_stock` INT DEFAULT 0 AFTER `current_stock`,
  ADD COLUMN IF NOT EXISTS `maximum_stock` INT DEFAULT 1000 AFTER `minimum_stock`,
  ADD COLUMN IF NOT EXISTS `reorder_point` INT DEFAULT 0 AFTER `maximum_stock`,
  ADD COLUMN IF NOT EXISTS `unit_cost` DECIMAL(10,2) DEFAULT 0.00 AFTER `reorder_point`,
  ADD COLUMN IF NOT EXISTS `supplier_name` VARCHAR(100) NULL AFTER `unit_cost`,
  ADD COLUMN IF NOT EXISTS `lead_time` INT DEFAULT 0 AFTER `supplier_name`,
  ADD COLUMN IF NOT EXISTS `expiry_date` DATE NULL AFTER `lead_time`,
  ADD COLUMN IF NOT EXISTS `is_perishable` BOOLEAN DEFAULT false AFTER `expiry_date`,
  ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT true AFTER `is_perishable`,
  ADD COLUMN IF NOT EXISTS `location` VARCHAR(100) NULL AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `location`,
  ADD COLUMN IF NOT EXISTS `tags` JSON AFTER `notes`;

-- Staff table
ALTER TABLE `staff`
  ADD COLUMN IF NOT EXISTS `first_name` VARCHAR(50) NOT NULL AFTER `employee_id`,
  ADD COLUMN IF NOT EXISTS `last_name` VARCHAR(50) NOT NULL AFTER `first_name`,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(20) NULL AFTER `last_name`,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(100) NULL AFTER `phone`,
  ADD COLUMN IF NOT EXISTS `address` TEXT AFTER `email`,
  ADD COLUMN IF NOT EXISTS `emergency_contact` VARCHAR(100) NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `emergency_phone` VARCHAR(20) NULL AFTER `emergency_contact`,
  ADD COLUMN IF NOT EXISTS `position` VARCHAR(100) NULL AFTER `emergency_phone`,
  ADD COLUMN IF NOT EXISTS `salary` DECIMAL(10,2) NULL AFTER `position`,
  ADD COLUMN IF NOT EXISTS `performance_rating` DECIMAL(3,2) DEFAULT 0.00 AFTER `salary`,
  ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT true AFTER `performance_rating`,
  ADD COLUMN IF NOT EXISTS `hire_date` DATE NULL AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `end_date` DATE NULL AFTER `hire_date`,
  ADD COLUMN IF NOT EXISTS `termination_date` DATE NULL AFTER `hire_date`,
  ADD COLUMN IF NOT EXISTS `department` VARCHAR(100) NULL AFTER `position`,
  ADD COLUMN IF NOT EXISTS `hourly_rate` DECIMAL(10,2) NULL AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `pay_frequency` ENUM('weekly','biweekly','monthly','annually') DEFAULT 'monthly' AFTER `salary`,
  ADD COLUMN IF NOT EXISTS `skills` TEXT AFTER `emergency_phone`,
  ADD COLUMN IF NOT EXISTS `certifications` TEXT AFTER `skills`,
  ADD COLUMN IF NOT EXISTS `last_review_date` DATE NULL AFTER `performance_rating`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `end_date`,
  ADD COLUMN IF NOT EXISTS `department_id` VARCHAR(36) NULL AFTER `notes`;

-- Shifts table
ALTER TABLE `shifts`
  ADD COLUMN IF NOT EXISTS `break_start_time` TIME NULL AFTER `end_time`,
  ADD COLUMN IF NOT EXISTS `break_end_time` TIME NULL AFTER `break_start_time`,
  ADD COLUMN IF NOT EXISTS `shift_type` ENUM('morning','afternoon','evening','night','split') DEFAULT 'morning' AFTER `status`,
  ADD COLUMN IF NOT EXISTS `position` VARCHAR(100) NULL AFTER `shift_type`,
  ADD COLUMN IF NOT EXISTS `section` VARCHAR(100) NULL AFTER `position`,
  ADD COLUMN IF NOT EXISTS `tables` JSON NULL AFTER `section`,
  ADD COLUMN IF NOT EXISTS `clock_in_time` DATETIME NULL AFTER `tables`,
  ADD COLUMN IF NOT EXISTS `clock_out_time` DATETIME NULL AFTER `clock_in_time`,
  ADD COLUMN IF NOT EXISTS `actual_start_time` DATETIME NULL AFTER `clock_out_time`,
  ADD COLUMN IF NOT EXISTS `actual_end_time` DATETIME NULL AFTER `actual_start_time`,
  ADD COLUMN IF NOT EXISTS `total_hours` DECIMAL(4,2) DEFAULT 0.00 AFTER `actual_end_time`,
  ADD COLUMN IF NOT EXISTS `overtime_hours` DECIMAL(4,2) DEFAULT 0.00 AFTER `total_hours`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `overtime_hours`,
  ADD COLUMN IF NOT EXISTS `is_approved` BOOLEAN DEFAULT false AFTER `notes`,
  ADD COLUMN IF NOT EXISTS `approved_at` DATETIME NULL AFTER `is_approved`;

-- Tickets table
ALTER TABLE `tickets`
  ADD COLUMN IF NOT EXISTS `sla_breached` BOOLEAN DEFAULT false AFTER `status`,
  ADD COLUMN IF NOT EXISTS `priority` ENUM('low','medium','high','urgent') DEFAULT 'medium' AFTER `sla_breached`,
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) NULL AFTER `priority`,
  ADD COLUMN IF NOT EXISTS `subcategory` VARCHAR(100) NULL AFTER `category`,
  ADD COLUMN IF NOT EXISTS `assigned_to` VARCHAR(36) NULL AFTER `subcategory`,
  ADD COLUMN IF NOT EXISTS `reported_by` VARCHAR(36) NULL AFTER `assigned_to`,
  ADD COLUMN IF NOT EXISTS `description` TEXT AFTER `reported_by`,
  ADD COLUMN IF NOT EXISTS `resolution` TEXT AFTER `description`,
  ADD COLUMN IF NOT EXISTS `resolution_time` DATETIME NULL AFTER `resolution`,
  ADD COLUMN IF NOT EXISTS `actual_resolution_time` DATETIME NULL AFTER `resolution_time`,
  ADD COLUMN IF NOT EXISTS `sla_deadline` DATETIME NULL AFTER `actual_resolution_time`,
  ADD COLUMN IF NOT EXISTS `tags` JSON AFTER `sla_deadline`,
  ADD COLUMN IF NOT EXISTS `attachments` JSON AFTER `tags`,
  ADD COLUMN IF NOT EXISTS `is_escalated` BOOLEAN DEFAULT false AFTER `attachments`,
  ADD COLUMN IF NOT EXISTS `escalated_at` DATETIME NULL AFTER `is_escalated`,
  ADD COLUMN IF NOT EXISTS `escalated_to` VARCHAR(36) NULL AFTER `escalated_at`,
  ADD COLUMN IF NOT EXISTS `customer_impact` ENUM('none','low','medium','high','critical') DEFAULT 'low' AFTER `escalated_to`,
  ADD COLUMN IF NOT EXISTS `estimated_resolution_time` DATETIME NULL AFTER `customer_impact`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `estimated_resolution_time`,
  ADD COLUMN IF NOT EXISTS `location` VARCHAR(100) NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `sla_target` DATETIME NULL AFTER `estimated_resolution_time`,
  ADD COLUMN IF NOT EXISTS `resolution_notes` TEXT AFTER `attachments`,
  ADD COLUMN IF NOT EXISTS `resolved_at` DATETIME NULL AFTER `resolution_notes`,
  ADD COLUMN IF NOT EXISTS `closed_at` DATETIME NULL AFTER `resolved_at`;

-- Events table
ALTER TABLE `events`
  ADD COLUMN IF NOT EXISTS `expected_attendance` INT DEFAULT 0 AFTER `capacity`,
  ADD COLUMN IF NOT EXISTS `actual_attendance` INT DEFAULT 0 AFTER `expected_attendance`,
  ADD COLUMN IF NOT EXISTS `is_ticketed` BOOLEAN DEFAULT false AFTER `actual_attendance`,
  ADD COLUMN IF NOT EXISTS `ticket_price` DECIMAL(10,2) DEFAULT 0.00 AFTER `is_ticketed`,
  ADD COLUMN IF NOT EXISTS `ticket_quantity` INT DEFAULT 0 AFTER `ticket_price`,
  ADD COLUMN IF NOT EXISTS `tickets_sold` INT DEFAULT 0 AFTER `ticket_quantity`,
  ADD COLUMN IF NOT EXISTS `budget` DECIMAL(10,2) DEFAULT 0.00 AFTER `status`,
  ADD COLUMN IF NOT EXISTS `actual_cost` DECIMAL(10,2) DEFAULT 0.00 AFTER `budget`,
  ADD COLUMN IF NOT EXISTS `revenue` DECIMAL(10,2) DEFAULT 0.00 AFTER `actual_cost`,
  ADD COLUMN IF NOT EXISTS `performers` TEXT AFTER `revenue`,
  ADD COLUMN IF NOT EXISTS `requirements` TEXT AFTER `performers`,
  ADD COLUMN IF NOT EXISTS `marketing_plan` TEXT AFTER `requirements`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `marketing_plan`,
  ADD COLUMN IF NOT EXISTS `tags` JSON AFTER `notes`,
  ADD COLUMN IF NOT EXISTS `attachments` JSON AFTER `tags`;

-- Outlets table
ALTER TABLE `outlets`
  ADD COLUMN IF NOT EXISTS `tax_rate` DECIMAL(5,2) DEFAULT 0.00 AFTER `currency`,
  ADD COLUMN IF NOT EXISTS `service_charge` DECIMAL(5,2) DEFAULT 0.00 AFTER `tax_rate`,
  ADD COLUMN IF NOT EXISTS `delivery_fee` DECIMAL(5,2) DEFAULT 0.00 AFTER `service_charge`,
  ADD COLUMN IF NOT EXISTS `operating_hours` JSON AFTER `delivery_fee`,
  ADD COLUMN IF NOT EXISTS `settings` JSON AFTER `operating_hours`;

-- Create roles and permissions tables
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `resource` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `role_id` VARCHAR(36) NOT NULL,
  `permission_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`)
);

-- Verify all tables exist
SHOW TABLES;
EOF

echo "✅ Database migrations completed successfully!"

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ${PROJECT_DIR}/ecosystem.config.js --update-env
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now available at: https://${DOMAIN}"
echo "📊 Check PM2 status with: pm2 status"
echo "📋 Check logs with: pm2 logs"
