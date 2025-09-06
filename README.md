# Hugamara Hospitality Management System

A comprehensive hospitality management dashboard for Hugamara's 6 outlets, built with React, Node.js, and MySQL.

## Project Structure

```
hugamara/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # React source code
│   ├── package.json       # Frontend dependencies
│   ├── .env               # Frontend environment variables
│   └── .env.example       # Frontend environment template
├── backend/               # Backend Node.js API
│   ├── controllers/       # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── package.json      # Backend dependencies
│   └── .env              # Backend environment variables
├── package.json          # Root package.json (orchestration)
└── README.md            # This file
```

## Quick Start

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- npm or yarn

### 1. Clone and Setup

```bash
git clone <repository-url>
cd hugamara
```

### 2. Environment Configuration

#### Backend (.env)

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

#### Frontend (.env)

```bash
cd client
cp .env.example .env
# The default API URL is http://localhost:8000/api
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run backend:install

# Install frontend dependencies
npm run client:install
```

### 4. Database Setup

```bash
# Setup database and seed data
npm run db:setup
```

#### Manual Database Migrations

If you encounter database schema issues or need to run migrations manually:

**For Development Environment:**

```bash
# Navigate to backend directory
cd backend

# Run migrations using Node.js directly (if npx is not available)
node -e "
const { sequelize } = require('./config/database-cli.cjs');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // List of migration files to run
    const migrations = [
      '20250115000000-add-department-id-to-staff.cjs',
      '20250115000001-create-departments-table.cjs',
      '20250115000002-add-name-fields-to-staff.cjs',
      '20250115000003-add-missing-ticket-columns.cjs'
    ];

    for (const migrationFile of migrations) {
      try {
        const migrationPath = path.join(__dirname, 'database/migrations', migrationFile);
        if (fs.existsSync(migrationPath)) {
          const migration = require(migrationPath);
          await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
          console.log(\`✅ Migration \${migrationFile} completed\`);
        }
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
          console.log(\`⚠️  Migration \${migrationFile} already applied\`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
"

# Alternative: Run individual migration scripts
node run-ticket-migration.cjs  # For ticket columns
```

**For Production Environment:**

When deploying to production, use the following approach:

1. **Create Missing Tables:**

```bash
# On production server, run the table creation script
mysql -u root -p hugamara_db < /home/admin/hugamara-portal/backend/create-missing-tables.sql
```

2. **Add Missing Columns:**

```bash
# Connect to MariaDB
mysql -u root -p
use hugamara_db;

# Add missing columns for each table
# Orders table
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

# Reservations table
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

# Order Items table
ALTER TABLE `order_items`
  ADD COLUMN IF NOT EXISTS `special_instructions` TEXT AFTER `total_price`,
  ADD COLUMN IF NOT EXISTS `preparation_start_time` DATETIME NULL AFTER `special_instructions`,
  ADD COLUMN IF NOT EXISTS `preparation_end_time` DATETIME NULL AFTER `preparation_start_time`,
  ADD COLUMN IF NOT EXISTS `served_at` DATETIME NULL AFTER `preparation_end_time`,
  ADD COLUMN IF NOT EXISTS `is_comped` BOOLEAN DEFAULT false AFTER `served_at`,
  ADD COLUMN IF NOT EXISTS `comp_reason` TEXT AFTER `is_comped`,
  ADD COLUMN IF NOT EXISTS `allergens` TEXT AFTER `comp_reason`;

# Inventory table
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

# Staff table
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

# Shifts table
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

# Tickets table
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

# Events table
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

# Outlets table
ALTER TABLE `outlets`
  ADD COLUMN IF NOT EXISTS `tax_rate` DECIMAL(5,2) DEFAULT 0.00 AFTER `currency`,
  ADD COLUMN IF NOT EXISTS `service_charge` DECIMAL(5,2) DEFAULT 0.00 AFTER `tax_rate`,
  ADD COLUMN IF NOT EXISTS `delivery_fee` DECIMAL(5,2) DEFAULT 0.00 AFTER `service_charge`,
  ADD COLUMN IF NOT EXISTS `operating_hours` JSON AFTER `delivery_fee`,
  ADD COLUMN IF NOT EXISTS `settings` JSON AFTER `operating_hours`;

# Create roles and permissions tables
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

# Verify all tables exist
SHOW TABLES;
```

#### Common Migration Issues

**Issue**: `npx: command not found`

- **Solution**: Use Node.js directly as shown above, or install npm globally

**Issue**: `Unknown column 'column_name' in 'field list'`

- **Solution**: Run the appropriate migration script to add missing columns

**Issue**: `Cannot read properties of undefined (reading 'query')`

- **Solution**: Ensure sequelize instance is properly initialized in migration scripts

**Issue**: `Unknown column 'tax_rate' in 'field list'` (Settings module)

- **Solution**: Run `node run-settings-migration.cjs` to add outlet columns

**Issue**: `Permission is not associated to Role!` (Settings module)

- **Solution**: Run `node run-settings-migration.cjs` to create role_permissions junction table

#### Creating New Migrations

When you need to create a new migration:

```bash
# Navigate to backend directory
cd backend

# Create a new migration file manually
touch database/migrations/YYYYMMDDHHMMSS-description.cjs

# Example migration template:
cat > database/migrations/YYYYMMDDHHMMSS-description.cjs << 'EOF'
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add your migration logic here
      await queryInterface.addColumn('table_name', 'column_name', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Column description'
      });
      console.log('✅ Added column_name to table_name');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️  column_name already exists');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('table_name', 'column_name');
      console.log('✅ Removed column_name from table_name');
    } catch (error) {
      console.log(`⚠️  Column may not exist: ${error.message}`);
    }
  }
};
EOF
```

#### Migration Best Practices

1. **Always test migrations** on a development database first
2. **Use try-catch blocks** to handle duplicate column/table errors gracefully
3. **Include rollback logic** in the `down` method
4. **Use descriptive names** for migration files
5. **Add comments** to explain what each migration does
6. **Test both up and down** migrations

## Debugging Guide

### Common Issues and Solutions

#### 1. "Table not found" Error in Seat Reservation

**Problem**: When trying to assign a table to a reservation, you get a 404 "Table not found" error.

**Root Cause**: The backend is enforcing strict `outletId` matching between user, reservation, and table, but these might not be properly aligned.

**Debugging Steps**:

1. **Check Database State**:

```bash
# Create a debug script
cat > backend/debug-tables.mjs << 'EOF'
import { sequelize } from "./config/database.js";
import { Table, Outlet, Reservation } from "./models/index.js";

async function debugTables() {
  try {
    console.log("Checking tables and outlets...");

    // Check outlets
    const outlets = await Outlet.findAll();
    console.log("Outlets:", outlets.map(o => ({ id: o.id, name: o.name })));

    // Check tables
    const tables = await Table.findAll();
    console.log("Tables:", tables.map(t => ({
      id: t.id,
      tableNumber: t.tableNumber,
      outletId: t.outletId,
      status: t.status,
      isActive: t.isActive
    })));

    // Check reservations
    const reservations = await Reservation.findAll();
    console.log("Reservations:", reservations.map(r => ({
      id: r.id,
      outletId: r.outletId,
      status: r.status
    })));

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

debugTables();
EOF

# Run the debug script
cd backend && node debug-tables.mjs
```

2. **Check User's OutletId**:

```bash
# Add temporary logging to see user's outletId
# In reservationController.js, add:
console.log('User outletId:', req.user.outletId);
```

3. **Fix the Issue**:

The issue is usually that the user doesn't have an `outletId` set, or the reservation/table has a different `outletId`. Here are the proper solutions:

**Option A: Ensure User Has Correct OutletId**

```javascript
// Check if user has outletId in auth middleware
// In middleware/auth.js, ensure user.outletId is set correctly
```

**Option B: Fix Data Alignment**

```bash
# Update reservation to match user's outlet
mysql -u root -p hugamara_dev -e "
UPDATE reservations
SET outlet_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE id = 'reservation-id-here';
"

# Update table to match user's outlet
mysql -u root -p hugamara_dev -e "
UPDATE tables
SET outlet_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE id = 'table-id-here';
"
```

**Option C: Temporary Bypass (NOT RECOMMENDED for production)**

```javascript
// In reservationController.js, modify seatReservation function:
export const seatReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableId } = req.body;
    const userOutletId = req.user.outletId;

    // Find reservation - require outletId matching for security
    const reservation = await Reservation.findOne({
      where: userOutletId ? { id, outletId: userOutletId } : { id },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Check if table exists and is available - require outletId matching for security
    const table = await Table.findOne({
      where: userOutletId
        ? { id: tableId, outletId: userOutletId }
        : { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Rest of the function...
  } catch (error) {
    console.error("Seat reservation error:", error);
    res.status(500).json({ error: "Failed to seat reservation" });
  }
};
```

4. **Clean Up**:

```bash
# Remove debug files
rm backend/debug-tables.mjs
```

#### 2. Dialog Boxes Being Covered by Header

**Problem**: Modal dialogs have their content covered by the fixed header.

**Solution**: Update all dialog z-index and positioning:

```javascript
// Change from:
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

// To:
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 sm:p-6 z-[9999] overflow-y-auto">
  <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl mt-8 sm:mt-12 mb-4 sm:mb-8 border border-neutral-700 min-h-fit max-h-[90vh] overflow-y-auto">
    {/* Sticky Header */}
    <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 pt-6 pb-4 rounded-t-lg z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Modal Title</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-white text-3xl font-bold p-2 hover:bg-neutral-700 rounded-full transition-colors" title="Close Modal">×</button>
      </div>
    </div>
    {/* Modal Content */}
    <div className="p-6 sm:p-8 pb-8">
      {/* Your content here */}
    </div>
  </div>
</div>
```

#### 3. Reservations Dropdown Not Populating in Orders

**Problem**: The reservations dropdown in Orders.js shows no options.

**Solution**: Use the correct slice for reservations data:

```javascript
// In Orders.js, update imports:
import {
  fetchReservations,
  selectReservations,
} from "../store/slices/reservationsSlice";

// Remove from ordersSlice imports:
// fetchReservations, selectReservations

// Update the filter to show more reservations:
{
  reservations
    .filter((r) => r.status === "seated" || r.status === "confirmed")
    .map((r) => (
      <option key={r.id} value={r.id} className="text-gray-900">
        {r.reservationNumber} • {r.partySize} people • {r.status}
      </option>
    ));
}
```

#### 4. Database Connection Issues

**Problem**: "Cannot read properties of undefined (reading 'query')" or similar database errors.

**Solution**:

```bash
# Check if database is running
mysql -u root -p -e "SELECT 1;"

# Check environment variables
cat backend/.env

# Test database connection
cd backend && node -e "
const { sequelize } = require('./config/database-cli.cjs');
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err))
  .finally(() => process.exit());
"
```

#### 5. Missing Database Columns

**Problem**: "Unknown column 'column_name' in 'field list'" errors.

**Solution**:

```bash
# Check what columns exist
mysql -u root -p hugamara_dev -e "DESCRIBE table_name;"

# Add missing columns
mysql -u root -p hugamara_dev -e "ALTER TABLE table_name ADD COLUMN column_name VARCHAR(255) NULL;"

# Or run the comprehensive migration
mysql -u root -p hugamara_dev < backend/create-missing-tables.sql
```

### Debugging Checklist

When encountering issues, follow this systematic approach:

1. **Check the Error Message**: Read the full error message and stack trace
2. **Check Database State**: Use debug scripts to verify data exists
3. **Check API Endpoints**: Test endpoints with tools like Postman or curl
4. **Check Frontend Console**: Look for JavaScript errors or network failures
5. **Check Backend Logs**: Monitor server console for error messages
6. **Check Environment Variables**: Ensure all required env vars are set
7. **Check Database Connection**: Verify database is running and accessible
8. **Check File Permissions**: Ensure proper read/write permissions
9. **Check Dependencies**: Verify all packages are installed correctly
10. **Check Code Syntax**: Look for typos, missing imports, or syntax errors

### Quick Fix Commands

```bash
# Reset everything and start fresh
npm run db:setup
npm run server_client

# Check specific table structure
mysql -u root -p hugamara_dev -e "DESCRIBE reservations;"

# Check if specific data exists
mysql -u root -p hugamara_dev -e "SELECT COUNT(*) FROM tables;"

# Restart just the backend
cd backend && npm run dev

# Restart just the frontend
cd client && npm start
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run server_client
```

## Available Scripts

### Root Level

- `npm run server_client` - Start both backend and frontend in development mode
- `npm run server` - Start only the backend server
- `npm run start` - Start only the frontend client
- `npm run build` - Build the frontend for production

### Backend

- `npm run backend:dev` - Start backend in development mode
- `npm run backend:start` - Start backend in production mode
- `npm run db:setup` - Reset and seed database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

#### Manual Migration Commands

```bash
# Run all migrations
cd backend && node -e "const { sequelize } = require('./config/database-cli.cjs'); /* migration code */"

# Run specific migration
node run-ticket-migration.cjs

# Run settings migration (outlet columns + role-permissions)
node run-settings-migration.cjs

# Check database schema
mysql -u root -p hugamara_dev -e "DESCRIBE table_name;"
```

#### Settings Migration Requirements

The settings module requires specific database columns and tables:

**Outlet Table Columns:**

- `tax_rate` (DECIMAL(5,2)) - Tax rate as percentage
- `service_charge` (DECIMAL(5,2)) - Service charge as percentage
- `delivery_fee` (DECIMAL(8,2)) - Delivery fee amount
- `operating_hours` (JSON) - Operating hours for each day

**Role-Permission Junction Table:**

- `role_permissions` table with `role_id` and `permission_id` foreign keys
- Unique constraint on `(role_id, permission_id)` combination

**Migration Script:**

```bash
# Run the settings migration
cd backend && node run-settings-migration.cjs
```

This migration adds the required columns and tables for the Settings module to function properly.

### Frontend

- `npm run client:install` - Install frontend dependencies
- `npm run lint` - Run ESLint on frontend code
- `npm run test` - Run frontend tests

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hugamara_dev
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=your-secret-key-here
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

## Test Data

The system comes with pre-seeded test users:

**Admin User:**

- Email: `admin@hugamara.com`
- Password: `password123`
- Outlet: Server Room (HQ)
- Role: org_admin

**Outlet Managers:**

- `villa.manager@hugamara.com` / `password123` - The Villa Ug
- `luna.manager@hugamara.com` / `password123` - Luna
- `cueva.manager@hugamara.com` / `password123` - La Cueva
- `patio.manager@hugamara.com` / `password123` - Patio Bella
- `maze.manager@hugamara.com` / `password123` - Maze
- `mazebistro.manager@hugamara.com` / `password123` - The Maze Bistro

## Development

### Backend Development

- API runs on `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/api`

### Frontend Development

- Client runs on `http://localhost:3000`
- Auth test page: `http://localhost:3000/auth-test`

## Features

### ✅ Completed

- **Authentication & Authorization**

  - JWT-based authentication system
  - Role-based access control (org_admin, general_manager, supervisor, staff, marketing_crm, finance)
  - Outlet-based user management
  - Protected routes and middleware

- **User Interface**

  - Modern responsive UI with Tailwind CSS
  - Mobile-optimized sidebar with slide-out navigation
  - Dark theme support with shadows and no gradients
  - Function-based React components using ES6

- **Core Management Modules**

  - **Staff Management**: Complete CRUD operations for staff members
  - **Shift Management**: Full shift scheduling, clock in/out, break management
  - **Support Tickets**: Ticket creation, assignment, and status tracking
  - **Events & Promotions**: Event management with full CRUD operations
  - **Settings**: Comprehensive system configuration including:
    - Outlet information management
    - System settings configuration
    - User preferences
    - Roles and permissions management
    - System statistics
    - Backup and restore functionality

- **Technical Features**
  - Redux state management with async thunks
  - RESTful API with Express.js
  - MySQL database with Sequelize ORM
  - Real-time updates with Socket.IO
  - Comprehensive error handling and validation

### 🚧 In Progress

- Table management system
- Reservation system
- Menu and inventory management
- Payment processing integration
- Advanced reporting and analytics

## Recent Updates

### Mobile Optimization (Latest)

- **Responsive Sidebar**: Implemented mobile-first sidebar design with slide-out navigation
- **Touch-Friendly Interface**: Optimized all components for mobile devices
- **Responsive Layout**: Updated CSS with mobile breakpoints and touch interactions
- **Mobile Navigation**: Added hamburger menu with overlay and smooth transitions

### New Modules Added

- **Shift Management**: Complete shift scheduling system with clock in/out functionality
- **Settings Module**: Comprehensive system configuration with 6 different tabs:
  - Outlet Information management
  - System settings configuration
  - User preferences
  - Roles and permissions management
  - System statistics dashboard
  - Backup and restore functionality

### Technical Improvements

- **Backend API**: Added new controllers and routes for all modules
- **Redux Integration**: Complete state management for all new features
- **Service Layer**: Centralized API communication with proper error handling
- **Form Validation**: Comprehensive client and server-side validation
- **Real-time Updates**: Socket.IO integration for live data updates

## Mobile Features

The application now includes comprehensive mobile optimization:

- **Responsive Sidebar**: Automatically adapts to screen size
- **Touch Navigation**: Optimized for touch interactions
- **Mobile-First Design**: Built with mobile devices as the primary consideration
- **Smooth Animations**: CSS transitions for better user experience
- **Overlay Navigation**: Mobile sidebar slides over content with backdrop

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Hugamara Hospitality Group.
