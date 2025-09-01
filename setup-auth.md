# Hugamara Authentication Setup Guide

## Overview

This guide will help you set up and test the complete authentication system for the Hugamara Hospitality Management System.

## Prerequisites

- Node.js 16+ installed
- MySQL database running
- Backend dependencies installed

## Setup Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:reset
# This will create tables and seed with test data

# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
# In the root directory
npm run client:install

# Start the frontend
npm start
```

### 3. Test Data

The system comes with pre-seeded test data:

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

**Staff User:**

- `staff@hugamara.com` / `password123` - The Villa Ug

## Testing the Authentication

### 1. API Testing

Run the test script to verify backend functionality:

```bash
node test-auth.js
```

### 2. Frontend Testing

1. Open http://localhost:3000
2. Navigate to http://localhost:3000/auth-test to see authentication status
3. Try logging in with the test credentials above
4. Visit http://localhost:3000/login to test the login form

### 3. Login Flow

1. Select an outlet from the dropdown
2. Enter email and password
3. Click "Sign In"
4. You should be redirected to the dashboard

## Features Implemented

### ✅ Backend

- User authentication with JWT tokens
- Role-based access control
- Outlet-based user management
- Password hashing with bcrypt
- Token refresh mechanism
- Public outlets endpoint for login

### ✅ Frontend

- Login form with outlet selection
- Redux state management for auth
- Protected routes
- Token persistence in localStorage
- Error handling and loading states
- Authentication test component

### ✅ Security

- JWT token authentication
- Password hashing
- Role-based permissions
- CORS configuration
- Rate limiting (configurable)
- Input validation

## Troubleshooting

### Common Issues

1. **Backend won't start**

   - Check database connection in .env
   - Ensure MySQL is running
   - Verify all dependencies are installed

2. **Login fails**

   - Check browser console for errors
   - Verify backend is running on port 8000
   - Check network tab for API calls

3. **CORS errors**

   - Backend CORS is configured for localhost:3000
   - Ensure frontend is running on the correct port

4. **Database connection issues**
   - Verify MySQL credentials in .env
   - Check if database exists
   - Run `npm run db:reset` to recreate database

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your backend .env file.

## Next Steps

After authentication is working:

1. Implement user management UI
2. Add password reset functionality
3. Implement email verification
4. Add audit logging
5. Set up production environment

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/outlets/public` - Get outlets for login
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Protected Endpoints

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password
- `GET /api/outlets` - Get all outlets (admin)
- `GET /api/dashboard/*` - Dashboard data

## Security Notes

- JWT tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Passwords are hashed with bcrypt (12 rounds)
- All sensitive endpoints require authentication
- Role-based access control is enforced
