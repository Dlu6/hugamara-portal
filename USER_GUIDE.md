# 🎯 Hugamara System User Guide

## 🚀 Getting Started

### 1. Access the System
- **URL**: http://localhost:3000
- **Backend API**: http://localhost:8000/api

### 2. Login Process
1. **Open your browser** and navigate to http://localhost:3000
2. **Select an Outlet** from the dropdown:
   - CS (Server Room) - HQ
   - VILLA (The Villa Ug) - Nightclub
   - LUNA (Luna - Cube Kisementi) - Nightclub
   - CUEVA (La Cueva) - Nightclub
   - PATIO (Patio Bella) - Restaurant
   - MAZE (Maze - Forest Mall) - Restaurant
   - MAZE_BISTRO (The Maze Bistro) - Restaurant

3. **Enter Demo Credentials**:
   - **Email**: `admin@hugamara.com`
   - **Password**: `password123`

4. **Click "Sign in"**

## 👥 User Roles & What You Can Do

### 🔑 Organization Admin (`admin@hugamara.com`)
**Full System Access** - You can do everything:
- ✅ Manage all users across all outlets
- ✅ View and manage all outlets
- ✅ Access all financial reports
- ✅ Manage orders, reservations, inventory
- ✅ View analytics and dashboards
- ✅ Handle support tickets and events

**Quick Actions Available**:
- New Order → Create customer orders
- New Reservation → Book tables
- Inventory → Manage stock
- Reports → View financial data
- Guests → Manage customers
- Support → Handle tickets

### 👨‍💼 General Manager
**Outlet Management** - Manage your assigned outlet:
- ✅ View users in your outlet
- ✅ Manage outlet operations
- ✅ Access financial reports
- ✅ Manage staff and shifts
- ❌ Cannot create/delete users

### 👮‍♂️ Supervisor
**Daily Operations** - Handle day-to-day tasks:
- ✅ Manage orders and reservations
- ✅ Handle inventory
- ✅ Manage guests and tickets
- ❌ No financial reports access
- ❌ Cannot manage users

### 👨‍🍳 Staff
**Basic Operations** - Customer service focused:
- ✅ View and create orders
- ✅ Handle reservations
- ✅ View inventory (read-only)
- ❌ Cannot manage inventory
- ❌ No financial access

### 📢 Marketing/CRM
**Customer Focus** - Guest relationship management:
- ✅ Manage guests and customer data
- ✅ View reservations and orders
- ✅ Access analytics
- ❌ Cannot manage inventory
- ❌ Cannot process payments

### 💰 Finance
**Financial Focus** - Money and reports:
- ✅ View all financial reports
- ✅ Access analytics
- ✅ View orders (for financial data)
- ❌ Cannot manage operations
- ❌ Cannot manage guests

## 🎛️ Dashboard Features

### Welcome Section
- **User Info**: Your name, email, and user ID
- **Role Badge**: Shows your current role and permission count
- **Outlet Info**: Current outlet name and code

### Quick Actions (Role-Based)
Click any quick action button to navigate to that section:
- **New Order**: Create customer orders (if you have permission)
- **New Reservation**: Book tables (if you have permission)
- **Inventory**: Manage stock levels (if you have permission)
- **Reports**: View financial analytics (if you have permission)
- **Guests**: Manage customer data (if you have permission)
- **Support**: Handle support tickets (if you have permission)

### Stats Cards
- **Today's Orders**: Number of orders today
- **Today's Reservations**: Table bookings today
- **Today's Revenue**: Total revenue in UGX
- **Total Guests**: Customer count

### Recent Activity
- **Recent Orders**: Latest customer orders with status
- **Recent Reservations**: Latest table bookings

## 🔧 System Navigation

### Current Working Features
1. **Login/Logout** ✅
2. **Role-based Dashboard** ✅
3. **Permission Checking** ✅
4. **Multi-outlet Support** ✅
5. **User Authentication** ✅

### Features Coming Soon
1. **Order Management** 🚧
2. **Reservation System** 🚧
3. **Inventory Tracking** 🚧
4. **Guest Management** 🚧
5. **Financial Reports** 🚧
6. **Support Tickets** 🚧

## 🛠️ Troubleshooting

### Can't Select Outlet?
1. **Refresh the page** - Sometimes the outlet list needs to reload
2. **Check network connection** - Ensure you can access http://localhost:8002
3. **Restart backend server**:
   ```bash
   cd "/Users/Mydhe Files/Hugamara/backend"
   npm run dev
   ```

### Login Not Working?
1. **Check credentials**:
   - Email: `admin@hugamara.com`
   - Password: `password123`
2. **Select an outlet** - This is required
3. **Clear browser cache** - Sometimes old tokens cause issues

### Quick Actions Not Working?
- **Check your role** - Some actions require specific permissions
- **Look at your permissions** - Listed in the dashboard
- **Try refreshing** - Sometimes state gets out of sync

### Backend Not Responding?
1. **Check if backend is running**:
   ```bash
   lsof -i :8002
   ```
2. **Restart backend**:
   ```bash
   cd "/Users/Mydhe Files/Hugamara/backend"
   npm run dev
   ```
3. **Check database connection** - Ensure MySQL is running

## 🎮 How to Test Different Roles

### Method 1: Create New Users (Org Admin Only)
1. **Login as admin** (`admin@hugamara.com`)
2. **Navigate to Users** (when implemented)
3. **Create new user** with different role
4. **Logout and login** with new credentials

### Method 2: Database Direct (Development)
```sql
-- Connect to MySQL
mysql -u root hugamara_dev

-- Create a test supervisor
INSERT INTO users (id, first_name, last_name, email, password, role, outlet_id, is_active, created_at, updated_at) 
VALUES (
  UUID(), 
  'Test', 
  'Supervisor', 
  'supervisor@hugamara.com', 
  '$2b$12$hash_here', -- Use bcrypt to hash 'password123'
  'supervisor', 
  '280813e4-86c8-11f0-bd5e-4df9fbfe051d', -- CS outlet
  1, 
  NOW(), 
  NOW()
);
```

## 📱 Mobile Usage
- **Responsive Design** - Works on tablets and phones
- **Touch-Friendly** - All buttons are touch-optimized
- **Mobile Navigation** - Optimized for smaller screens

## 🔐 Security Features
- **JWT Tokens** - Secure authentication
- **Role-based Access** - Only see what you're allowed to
- **Outlet Isolation** - Users only access their assigned outlet
- **Auto-logout** - Tokens expire for security

## 📞 Getting Help

### Current Status
- **Authentication**: ✅ Fully Working
- **Dashboard**: ✅ Fully Working
- **Role Management**: ✅ Fully Working
- **Quick Actions**: ✅ Navigation Working (pages not implemented yet)

### Next Steps
1. **Order Management** - Create and manage customer orders
2. **Reservation System** - Table booking and management
3. **Inventory System** - Stock tracking and alerts
4. **Reports** - Financial and operational analytics

### Development Notes
- **Database**: Pre-seeded with demo data
- **API**: RESTful endpoints with proper authentication
- **Frontend**: React with Redux state management
- **Styling**: Tailwind CSS for responsive design

---

**🎉 Welcome to Hugamara! Start by logging in and exploring the dashboard.**
