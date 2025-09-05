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
