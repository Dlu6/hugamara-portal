# 🔐 Hugamara Authentication & Authorization System

## Overview
Complete role-based authentication system for Hugamara's 6 hospitality outlets in Uganda, featuring JWT authentication, granular permissions, and multi-outlet access control.

## 🏗️ Architecture

### Backend Components
```
backend/
├── config/
│   ├── database.js          # Database connection
│   └── permissions.js       # Role & permission definitions
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User management
├── middleware/
│   └── auth.js             # JWT & permission middleware
├── models/
│   ├── User.js             # User model with roles
│   └── Outlet.js           # Outlet model
└── routes/
    ├── auth.js             # Auth endpoints
    └── users.js            # User management endpoints
```

### Frontend Components
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.js     # Login with outlet selection
│   │   └── ProtectedRoute.js # Route protection
│   └── dashboard/
│       └── Dashboard.js     # Role-based dashboard
├── hooks/
│   └── usePermissions.js    # Permission checking hook
├── services/
│   ├── apiService.js        # HTTP client with auth
│   └── authService.js       # Auth API calls
└── store/slices/
    ├── authSlice.js         # Auth state management
    └── outletSlice.js       # Outlet data
```

## 👥 User Roles & Permissions

### Role Hierarchy
1. **Organization Admin** (`org_admin`)
   - Full system access across all outlets
   - User management and system configuration
   - All permissions granted

2. **General Manager** (`general_manager`)
   - Outlet management and financial reporting
   - Staff management and performance tracking
   - Most operational permissions

3. **Supervisor** (`supervisor`)
   - Daily operations management
   - Staff scheduling and inventory control
   - Limited financial access

4. **Staff** (`staff`)
   - Basic operations (orders, reservations)
   - Customer service functions
   - Read-only access to most data

5. **Marketing/CRM** (`marketing_crm`)
   - Guest relationship management
   - Marketing analytics and campaigns
   - Customer data access

6. **Finance** (`finance`)
   - Financial reporting and analytics
   - Payment processing oversight
   - Revenue and cost analysis

### Permission Matrix
| Permission | Org Admin | Gen Manager | Supervisor | Staff | Marketing | Finance |
|------------|-----------|-------------|------------|-------|-----------|---------|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Orders | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Process Payments | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Inventory | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Financial Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage Guests | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |

## 🔑 Authentication Flow

### 1. Login Process
```javascript
// User selects outlet and enters credentials
POST /api/auth/login
{
  "email": "admin@hugamara.com",
  "password": "password123",
  "outletId": "280813e4-86c8-11f0-bd5e-4df9fbfe051d"
}

// Server validates and returns tokens + user data
{
  "user": {
    "id": "user-uuid",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@hugamara.com",
    "role": "org_admin",
    "outlet": { "name": "Server Room", "code": "CS" },
    "permissions": ["manage_users", "view_orders", ...]
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### 2. Token Management
- **Access Token**: 24-hour expiry, contains user ID, role, outlet
- **Refresh Token**: 7-day expiry, used to get new access tokens
- **Auto-refresh**: Frontend automatically refreshes expired tokens

### 3. Route Protection
```javascript
// Protected route example
<ProtectedRoute requiredPermission="manage_orders">
  <OrderManagement />
</ProtectedRoute>

// Multiple permissions (any)
<ProtectedRoute 
  requiredPermissions={["view_orders", "manage_orders"]} 
  requireAny={true}
>
  <OrdersList />
</ProtectedRoute>
```

## 🏪 Multi-Outlet System

### Outlet Configuration
```javascript
// 7 Hugamara outlets pre-configured
const outlets = [
  { name: "Server Room (cs.hugamara.com)", code: "CS", type: "hq" },
  { name: "The Villa Ug - Bukoto Ntinda Rd", code: "VILLA", type: "nightclub" },
  { name: "Luna - Cube Kisementi", code: "LUNA", type: "nightclub" },
  { name: "La Cueva - Bukoto, Ntinda Road", code: "CUEVA", type: "nightclub" },
  { name: "Patio Bella - Arena Mall", code: "PATIO", type: "restaurant" },
  { name: "Maze - Forest Mall", code: "MAZE", type: "restaurant" },
  { name: "The Maze Bistro - Mbuya Ismael Road", code: "MAZE_BISTRO", type: "restaurant" }
];
```

### Access Control
- **Org Admins**: Access all outlets
- **Other Roles**: Restricted to assigned outlet only
- **Public Endpoint**: `/api/outlets/public` for login dropdown

## 🛡️ Security Features

### Password Security
- **bcryptjs hashing** with salt rounds: 12
- **Password validation** on login
- **Secure password change** endpoint

### JWT Security
- **Signed tokens** with secret key
- **Token expiration** handling
- **Refresh token rotation** (optional)

### API Security
- **Rate limiting**: 100 requests per 15 minutes
- **CORS protection** with specific origins
- **Helmet.js** for security headers
- **Input validation** on all endpoints

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout  
GET    /api/auth/me              # Get current user
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/change-password # Change password
```

### User Management
```
GET    /api/users               # List users (filtered by outlet)
GET    /api/users/:id           # Get user details
POST   /api/users               # Create new user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user (org_admin only)
GET    /api/users/roles         # Get available roles
```

### Outlets
```
GET    /api/outlets/public      # Public outlet list (for login)
GET    /api/outlets             # Protected outlet list
GET    /api/outlets/:id         # Get outlet details
```

## 🎯 Frontend Integration

### Redux Store Structure
```javascript
// Auth state
{
  user: {
    id: "uuid",
    firstName: "John",
    lastName: "Doe", 
    email: "john@hugamara.com",
    role: "supervisor",
    outlet: { name: "Villa", code: "VILLA" },
    permissions: ["view_orders", "manage_orders", ...]
  },
  token: "jwt-token",
  isAuthenticated: true,
  loading: false,
  error: null
}
```

### Permission Hooks
```javascript
// usePermissions hook
const { hasPermission, hasAnyPermission, role } = usePermissions();

// Usage in components
if (hasPermission('manage_orders')) {
  return <OrderManagementButton />;
}

if (hasAnyPermission(['view_orders', 'manage_orders'])) {
  return <OrdersList />;
}
```

### Protected Components
```javascript
// Conditional rendering based on permissions
{hasPermission('view_financial_reports') && (
  <FinancialReportsCard />
)}

// Role-based navigation
{role === 'org_admin' && (
  <AdminNavigation />
)}
```

## 🚀 Getting Started

### 1. Environment Setup
```bash
# Backend .env
NODE_ENV=development
DB_USER=root
DB_PASSWORD=
DB_NAME=hugamara_dev
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=your-secret-key-here
PORT=8000

# Frontend .env
REACT_APP_API_URL=http://localhost:8000/api
```

### 2. Database Setup
```bash
# Install dependencies
npm install
cd backend && npm install

# Setup database
npm run db:setup

# Seed data (includes demo user)
cd backend && node insert-seed-data.js
```

### 3. Start Services
```bash
# Start backend (port 8002)
cd backend && npm run dev

# Start frontend (port 3000)  
npm start
```

### 4. Demo Login
- **URL**: http://localhost:3000
- **Email**: admin@hugamara.com
- **Password**: password123
- **Outlet**: CS (Server Room)

## 🔧 Customization

### Adding New Roles
1. Update `ROLES` in `backend/config/permissions.js`
2. Add role to User model enum in `backend/models/User.js`
3. Define permissions in `ROLE_PERMISSIONS`
4. Update frontend role handling

### Adding New Permissions
1. Add permission to `PERMISSIONS` object
2. Assign to appropriate roles in `ROLE_PERMISSIONS`
3. Create middleware checks in routes
4. Update frontend permission hooks

### Outlet Management
1. Add outlets via database or admin interface
2. Assign users to outlets via `outletId` field
3. Update outlet selection in login form

## 🐛 Troubleshooting

### Common Issues
1. **Token Expired**: Check JWT_SECRET consistency
2. **Permission Denied**: Verify user role and permissions
3. **Outlet Access**: Ensure user assigned to correct outlet
4. **Database Connection**: Check MySQL service and credentials

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'hugamara:*');

// Check user permissions
console.log('User permissions:', store.getState().auth.permissions);
```

## 📈 Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Session management dashboard
- [ ] Audit logging for user actions
- [ ] Password policy enforcement
- [ ] Social login integration
- [ ] Mobile app authentication

### Security Improvements
- [ ] Token blacklisting on logout
- [ ] IP-based access restrictions
- [ ] Failed login attempt tracking
- [ ] Password breach detection
- [ ] Regular security audits

---

**Built with ❤️ for Hugamara Hospitality - Uganda's Premier Entertainment Venues**
