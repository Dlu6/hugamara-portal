# Development Guide - Backend-Frontend Connection

## 🚀 Quick Start

1. **Setup Development Environment**

   ```bash
   npm run setup
   ```

2. **Configure Database**

   - Copy `backend/env.example` to `backend/.env`
   - Update database credentials in `.env`

3. **Start Development Servers**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
Hugamara/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Main server file
├── client/                 # React frontend (moved from src/)
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── store/              # Redux store
│   └── utils/              # Utility functions
└── package.json            # Root package.json
```

## 🔌 Backend-Frontend Connection

### API Service Layer

The frontend communicates with the backend through a centralized service layer:

- **`src/services/apiService.js`** - Base API configuration with axios
- **`src/services/dashboardService.js`** - Dashboard-specific API calls
- **`src/services/outletService.js`** - Outlet management API calls
- **`src/services/reservationService.js`** - Reservation management API calls

### Authentication Flow

1. User logs in via `/api/auth/login`
2. JWT token is stored in localStorage
3. Token is automatically added to all subsequent requests
4. Token expiration redirects to login

### Data Flow

```
Frontend Component → Service Layer → Backend API → Database
                ←                ←            ←
```

## 🗄️ Database & Placeholder Data

### Seeding Database

```bash
# Reset and seed with placeholder data
npm run db:setup

# Seed only (if database exists)
npm run seed:placeholder
```

### Placeholder Data Includes

- **6 Outlets** (Downtown, Beach Resort, Mountain Lodge, etc.)
- **Users** (Admin, Managers)
- **Guests** (Sample customer data)
- **Reservations** (Sample booking data)
- **Events** (Wine tasting, Beach BBQ)
- **Inventory** (Sample stock items)
- **Menu Items** (Sample food items)

### Default Credentials

- **Admin**: admin@hugamara.com / password123
- **Manager**: manager1@hugamara.com / password123

## 🛠️ Development Workflow

### 1. Backend Development

```bash
cd backend
npm run dev          # Start backend with nodemon
npm run db:migrate   # Run database migrations
npm run seed:placeholder  # Add placeholder data
```

### 2. Frontend Development

```bash
npm start            # Start React development server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

### 3. Full Stack Development

```bash
npm run dev          # Start both frontend and backend
```

## 📊 API Endpoints

### Dashboard

- `GET /api/dashboard/stats` - Main dashboard data
- `GET /api/dashboard/revenue` - Revenue statistics
- `GET /api/dashboard/reservations` - Reservation statistics
- `GET /api/dashboard/inventory-alerts` - Inventory alerts

### Outlets

- `GET /api/outlets` - List all outlets
- `GET /api/outlets/:id` - Get outlet details
- `POST /api/outlets` - Create new outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet

### Reservations

- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hugamara_dev
DB_USER=root
DB_PASSWORD=your_password

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

The backend uses MySQL with Sequelize ORM. Models are defined in `backend/models/` and automatically sync in development mode.

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check MySQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **CORS Errors**

   - Verify `FRONTEND_URL` in backend `.env`
   - Check frontend is running on correct port

3. **Authentication Errors**

   - Clear localStorage
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration

4. **Port Conflicts**
   - Backend: 8000
   - Frontend: 3000
   - Change ports in respective config files if needed

### Debug Mode

Enable detailed logging by setting `NODE_ENV=development` in backend `.env`.

## 📝 Adding New Features

### 1. Backend

- Create model in `backend/models/`
- Add route in `backend/routes/`
- Create controller in `backend/controllers/`
- Update `server.js` with new route

### 2. Frontend

- Create service in `src/services/`
- Add Redux slice if needed
- Create component in `src/components/` or `src/pages/`
- Update routing in `src/App.js`

### 3. Database

- Create migration: `npx sequelize-cli migration:generate --name feature-name`
- Update seed data in `backend/insert-seed-data.js`

## 🎯 Next Steps

1. **Complete CRUD Operations** - Implement full CRUD for all entities
2. **Real-time Updates** - Add Socket.IO for live data updates
3. **File Uploads** - Implement image uploads for menu items
4. **Reporting** - Add comprehensive reporting and analytics
5. **Testing** - Add unit and integration tests
6. **Production Ready** - Environment-specific configurations

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [React Documentation](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
