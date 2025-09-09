# Mayday Call Center - Quick Start Guide

## 🚀 One-Command Startup

```bash
npm run callcenter
```

This starts both the backend (port 8004) and frontend (port 3000/3002) services concurrently.

## 📋 Available Commands

| Command                       | Description                          |
| ----------------------------- | ------------------------------------ |
| `npm run callcenter`          | Start both backend and frontend      |
| `npm run callcenter:install`  | Install all dependencies             |
| `npm run callcenter:backend`  | Start backend only (port 8004)       |
| `npm run callcenter:frontend` | Start frontend only (port 3000/3002) |

## 🔑 Login Credentials

- **URL**: http://localhost:3000 (or 3002)
- **Username**: `admin`
- **Password**: `Pasword@256`

## 🌐 Service URLs

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8004
- **API Documentation**: http://localhost:8004/api

## 🔧 Troubleshooting

### Services Not Starting

1. Check if ports 8004 and 3000 are available
2. Ensure Redis is running: `redis-server`
3. Verify database connection in `.env` files

### AMI Connection Issues

1. Check Asterisk server is running on EC2
2. Verify AMI credentials in `.env`
3. Ensure your IP is in Asterisk manager.conf

### Database Issues

1. Run database sync: `cd mayday/slave-backend && node scripts/sync-db.js`
2. Check MariaDB connection
3. Verify database credentials

## 📁 Key Files

- **Backend Config**: `mayday/slave-backend/.env`
- **Frontend Config**: `mayday/mayday-client-dashboard/.env`
- **Asterisk Config**: `mayday/slave-backend/config/asterisk/manager.conf`
- **Database Sync**: `mayday/slave-backend/scripts/sync-db.js`

## 🆘 Quick Fixes

```bash
# Kill all services
pkill -f "node server.js"
pkill -f "npm start"

# Restart everything
npm run callcenter

# Check what's running
lsof -i :8004 -i :3000 -i :3002
```

---

**Need more help?** Check the full documentation in `mayday/README.md`
