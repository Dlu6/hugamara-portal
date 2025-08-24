# Hugamara Hospitality App - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- Git

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install
```

### 2. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE hugamara_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE hugamara_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Configure Environment Variables
```bash
# Copy backend environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hugamara_dev
```

### 3. Database Initialization

```bash
# Run database migrations and seeders
npm run db:setup

# Or run individually:
npm run db:migrate
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm start          # Frontend only
npm run backend:dev # Backend only
```

## 🏗 Project Structure

```
Hugamara/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-based pages
│   │   ├── store/           # Redux store and slices
│   │   ├── services/        # API services
│   │   └── styles/          # CSS and Tailwind
│   └── package.json
├── backend/                  # Node.js backend
│   ├── controllers/         # Business logic
│   ├── models/              # Sequelize models
│   ├── routes/              # API endpoints
│   ├── middleware/          # Custom middleware
│   ├── config/              # Configuration files
│   ├── database/            # Migrations and seeders
│   └── package.json
└── package.json             # Root package.json
```

## 🔧 Development Commands

### Frontend (React)
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

### Backend (Node.js)
```bash
npm run backend:dev    # Start with nodemon
npm run backend:start  # Start production server
npm run backend:test   # Run backend tests
```

### Database
```bash
npm run db:setup       # Reset and setup database
npm run db:migrate     # Run migrations
npm run db:seed        # Run seeders
```

### Concurrent Development
```bash
npm run dev            # Start both frontend and backend
npm run server         # Start backend only
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/change-password` - Change password

### Outlets
- `GET /api/outlets` - Get all outlets
- `GET /api/outlets/:id` - Get outlet by ID
- `POST /api/outlets` - Create outlet (Admin only)
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet (Admin only)

### Coming Soon
- `GET /api/users` - User management
- `GET /api/reservations` - Reservation management
- `GET /api/guests` - Guest management
- `GET /api/tickets` - Support tickets
- `GET /api/events` - Event management
- `GET /api/dashboard` - Dashboard data

## 🔐 Default Users

After running seeders, you can login with:

### Admin User
- **Email**: admin@hugamara.com
- **Password**: password123
- **Role**: Org Admin
- **Access**: All outlets

### Outlet Managers
- **Villa Manager**: villa.manager@hugamara.com
- **Luna Manager**: luna.manager@hugamara.com
- **Cueva Manager**: cueva.manager@hugamara.com
- **Patio Manager**: patio.manager@hugamara.com
- **Maze Manager**: maze.manager@hugamara.com
- **Maze Bistro Manager**: mazebistro.manager@hugamara.com

All managers use: **password123**

## 🗄 Database Models

### Core Entities
- **Users** - Staff and management users
- **Outlets** - 7 Hugamara locations
- **Guests** - Customer profiles and preferences
- **Reservations** - Booking management
- **Tickets** - Support and incident management
- **Events** - Special events and performances

### Key Features
- **Multi-tenant** - Outlet-scoped data
- **Role-based access** - 6 distinct user roles
- **Audit trails** - Track all changes
- **Soft deletes** - Preserve data integrity

## 🚀 Deployment

### Frontend (React)
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend (Node.js)
```bash
cd backend
npm install --production
npm start
# Use PM2 or similar for production
```

### Database
- Use RDS or managed MySQL service
- Set up automated backups
- Configure connection pooling

## 🔧 Environment Variables

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
```

### Backend (.env)
```bash
# Server
PORT=8000
NODE_ENV=production

# Database
DB_HOST=your-rds-endpoint
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=hugamara_prod

# Security
JWT_SECRET=your-super-secret-key
```

## 🧪 Testing

### Frontend Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm test -- --watch     # Watch mode
```

## 📚 Documentation

- **README.md** - Project overview
- **DEVELOPMENT.md** - Development guidelines
- **.cursorrules/rules.md** - Cursor development rules
- **API Documentation** - Coming soon with Swagger

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MySQL service
sudo service mysql status

# Verify credentials in backend/.env
# Test connection manually
mysql -u your_user -p -h localhost
```

#### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Kill processes if needed
kill -9 <PID>
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For technical support:
1. Check the troubleshooting section
2. Review error logs in console
3. Check database connectivity
4. Verify environment variables

---

**Happy Coding! 🎉**