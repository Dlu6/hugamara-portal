# Development Flow Documentation

## Overview

This document outlines the complete development flow for the Hugamara Hospitality Management System with integrated Mayday Call Center functionality.

## Architecture

### Frontend Applications

1. **Hospitality Management System** (`client/`)

   - Port: 3000 (pinned)
   - URL: `http://localhost:3000`
   - Login Component: `LoginHospitality.js`
   - Purpose: Multi-outlet hospitality management

2. **Call Center Dashboard** (`mayday/mayday-client-dashboard/`)
   - Port: 3002 (pinned)
   - URL: `http://localhost:3002`
   - Login Component: `LoginMayday.js`
   - Purpose: Call center operations and management

### Backend Services

1. **Hospitality Backend** (`backend/`)

   - Port: 8000
   - URL: `http://localhost:8000/api`
   - Purpose: Hospitality management API

2. **Call Center Backend** (`mayday/slave-backend/`)
   - Port: 8004
   - URL: `http://localhost:8004/api`
   - Purpose: Call center operations API

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL/MariaDB
- Redis
- Asterisk (for call center)

### Environment Configuration

#### Hospitality Frontend (`client/.env.development`)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
REACT_APP_CALL_CENTER_URL=http://localhost:3002/login
```

#### Call Center Frontend

- Uses environment variables from `mayday/mayday-client-dashboard/.env`
- API URL: `http://localhost:8004/api`

### Port Configuration

#### Pinned Ports (Prevents CRA Auto-Switch)

- **Hospitality Frontend**: Port 3000 (pinned in `client/package.json`)
- **Call Center Frontend**: Port 3002 (pinned in root `package.json`)

#### Backend Ports

- **Hospitality Backend**: Port 8000
- **Call Center Backend**: Port 8004

## Development Workflow

### Starting Development Servers

#### Option 1: Separate Terminals (Recommended)

```bash
# Terminal A: Hospitality + Backend
npm run server_client_hugamara

# Terminal B: Call Center Stack
npm run callcenter
```

#### Option 2: Individual Services

```bash
# Hospitality Backend
cd backend && npm run dev

# Hospitality Frontend
cd client && npm start

# Call Center Backend
cd mayday/slave-backend && npm run start

# Call Center Frontend
cd mayday/mayday-client-dashboard && PORT=3002 npm start
```

### User Flow

#### 1. Hospitality Login Flow

1. User visits `http://localhost:3000`
2. Sees `LoginHospitality.js` with outlet selection
3. Can select regular outlets or "Mayday Call Center"
4. For regular outlets: Standard email/password login
5. For call center: Opens new tab to `http://localhost:3002/login`

#### 2. Call Center Login Flow

1. User clicks "Open Mayday Call Center" in hospitality app
2. New tab opens to `http://localhost:3002/login`
3. Shows `LoginMayday.js` component
4. User enters username/password
5. Authenticates against call center backend (`http://localhost:8004/api`)

## Key Features Implemented

### 1. Port Pinning

- **Problem**: Create React App auto-switches ports when 3000 is occupied
- **Solution**: Explicitly pin hospitality to port 3000, call center to port 3002
- **Files Modified**:
  - `client/package.json`: Added `PORT=3000` to start script

### 2. Environment Configuration

- **Problem**: Call center URL was pointing to wrong endpoint
- **Solution**: Created development environment file with correct URLs
- **Files Created**:
  - `client/.env.development`: Development-specific environment variables

### 3. JWT Algorithm Fix

- **Problem**: Call center backend was using HS256 (symmetric) with RSA keys
- **Solution**: Changed to RS256 (asymmetric) algorithm
- **Files Modified**:
  - `mayday/slave-backend/services/licenseService.js`: Updated JWT algorithms

### 4. Cross-Application Navigation

- **Problem**: Selecting call center opened wrong login page
- **Solution**: Direct URL to `/login` endpoint in call center app
- **Implementation**: `REACT_APP_CALL_CENTER_URL=http://localhost:3002/login`

## File Structure

```
Hugamara/
├── client/                          # Hospitality Frontend
│   ├── .env.development            # Development environment
│   ├── package.json                # Pinned to port 3000
│   └── src/pages/LoginHospitality.js
├── backend/                         # Hospitality Backend
│   └── server.js                   # Runs on port 8000
├── mayday/
│   ├── mayday-client-dashboard/    # Call Center Frontend
│   │   ├── src/App.jsx            # Routes to /login
│   │   └── src/components/LoginMayday.js
│   └── slave-backend/              # Call Center Backend
│       ├── .env                    # JWT configuration
│       ├── server.js               # Runs on port 8004
│       └── services/licenseService.js  # Fixed JWT algorithms
└── package.json                    # Root scripts
```

## Troubleshooting

### Common Issues

#### 1. Wrong Login Page Shows

- **Symptom**: Call center opens but shows hospitality login
- **Cause**: Port collision or wrong URL
- **Solution**:
  - Ensure ports are pinned correctly
  - Check `REACT_APP_CALL_CENTER_URL` in `.env.development`
  - Hard refresh browser (Cmd/Cmd+Shift+R)

#### 1b. Call Center page blank with MIME error

- **Symptom**: Console shows: `Refused to execute script ... MIME type 'text/html'` and 404s at `/static/js/...`
- **Cause**: Call center bundle emitted asset paths under `/static/...` (root) instead of `/callcenter/static/...`, so Nginx serves hospitality `index.html` for those JS files.
- **Fix**:
  1. Set `homepage: "/callcenter/"` in `mayday/mayday-client-dashboard/package.json`
  2. Use `<Router basename="/callcenter">` in `mayday/mayday-client-dashboard/src/App.jsx`
  3. Rebuild with `PUBLIC_URL=/callcenter npm run build`
  4. Verify `build/index.html` references `/callcenter/static/...`

#### 2. JWT Secret Error

- **Symptom**: `"secretOrPrivateKey must be a symmetric key when using HS256"`
- **Cause**: Mismatch between JWT algorithm and key type
- **Solution**: Fixed in `licenseService.js` (HS256 → RS256)

#### 3. API Connection Issues

- **Symptom**: Frontend can't connect to backend
- **Solution**:
  - Verify backend is running on correct port
  - Check CORS configuration
  - Verify environment variables

#### 4. Port Conflicts (EADDRINUSE: :::5000)

- **Symptom**: Hospitality backend restarts repeatedly with `EADDRINUSE` errors.
- **Cause**: Another Node/PM2 instance using port 5000, possibly under a different user.
- **Fix**:
  - Stop PM2 as both `root` and `admin` users (see PM2 section)
  - Kill residual Node processes: `sudo pkill -9 -f node`
  - Verify: `sudo lsof -i :5000` shows nothing, then restart PM2 as `admin`.

#### 5. Redis Authentication Error (Call Center)

- **Symptom**: `ERR AUTH <password> called without any password configured` in logs.
- **Cause**: App configured a Redis password but Redis server has none.
- **Fix**:
  - Either configure `requirepass` in `/etc/redis/redis.conf` and restart Redis, or
  - Remove `REDIS_PASSWORD` from the call center app environment in `ecosystem.config.js`.

### Development Commands

```bash
# Install all dependencies
npm run install:all

# Start hospitality system
npm run server_client_hugamara

# Start call center system
npm run callcenter

# Start individual services
npm run client:install
npm run backend:install
npm run callcenter:install
```

## Production Deployment

This section outlines the definitive steps to deploy both applications to a production VM using Nginx and PM2.

### Final URL Mapping

- `https://cs.hugamara.com/` → Serves the **Hospitality Frontend**.
- `https://cs.hugamara.com/callcenter/` → Serves the **Call Center Frontend**.
- `https://cs.hugamara.com/api/` → Proxies to the **Hospitality Backend** on `localhost:5000`.
- `https://cs.hugamara.com/mayday-api/` → Proxies to the **Call Center Backend** on `localhost:5001`.

### 1. Backend Setup with PM2

- **User:** All PM2 commands **must** be run as the `admin` user, as the project files reside in `/home/admin`. Use `sudo -u admin pm2 ...`.
- **Configuration:** The backends are managed by `/home/admin/hugamara-portal/ecosystem.config.js`.
  - `hugamara-backend` runs on port `5000`.
  - `mayday-callcenter-backend` runs on port `5001`.

**Key Commands on VM:**

```bash
# Stop any existing PM2 instances (run for both root and admin to be safe)
pm2 kill
sudo -u admin pm2 kill

# Start the applications correctly as the admin user
cd /home/admin/hugamara-portal
sudo -u admin pm2 start ecosystem.config.js

# Save the process list to automatically restart on reboot
sudo -u admin pm2 save
```

### 2. Frontend Build Process

It is critical to build both frontends on the VM with the correct environment variables.

**A. Build Hospitality Frontend:**

```bash
cd /home/admin/hugamara-portal/client
rm -rf build
npm ci
# This variable ensures the 'Open Call Center' button points to the correct URL
REACT_APP_CALL_CENTER_URL=/callcenter/login npm run build
```

**B. Build Call Center Frontend:**

```bash
cd /home/admin/hugamara-portal/mayday/mayday-client-dashboard
rm -rf build
npm ci
# This variable ensures all asset paths (JS, CSS) are relative to /callcenter/
PUBLIC_URL=/callcenter npm run build
```

### 3. Final Nginx Configuration

The complete and correct configuration for `/etc/nginx/sites-available/hugamara`. This version is confirmed to work.

```nginx
server {
    listen 80;
    server_name cs.hugamara.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cs.hugamara.com;

    ssl_certificate /etc/letsencrypt/live/cs.hugamara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cs.hugamara.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # --- Headers & Gzip ---
    add_header X-Frame-Options "SAMEORIGIN" always;
    # ... (other headers) ...
    gzip on;
    # ... (gzip settings) ...

    # --- API PROXIES (High Priority) ---
    # The ^~ modifier ensures these rules are matched before the static file rule.

    location ^~ /api/ {
        proxy_pass http://localhost:5000;
        # ... (proxy headers) ...
    }

    location ^~ /mayday-api/ {
        proxy_pass http://localhost:5001/api/;
        # ... (proxy headers) ...
    }

    # --- FRONTEND APPLICATIONS ---

    # Call Center Assets (must be before /callcenter/)
    location ^~ /callcenter/static/ {
        alias /home/admin/hugamara-portal/mayday/mayday-client-dashboard/build/static/;
        expires 1y;
        add_header Cache-Control "public"; # Use "public", not "public, immutable"
    }

    # Call Center Main App
    location /callcenter/ {
        alias /home/admin/hugamara-portal/mayday/mayday-client-dashboard/build/;
        try_files $uri $uri/ /callcenter/index.html;
    }

    # Hospitality Main App (Catch-all)
    location / {
        root /home/admin/hugamara-portal/client/build;
        try_files $uri $uri/ /index.html;
    }

    # ... (other locations like /socket.io/) ...
}
```

### Production Troubleshooting Summary

- **Symptom:** Call Center login fails with **404** or **500** error.

  - **Cause 1:** PM2 is running as `root` instead of `admin`. **Fix:** Stop all PM2 instances and restart using `sudo -u admin pm2 start`.
  - **Cause 2:** Call center backend is not listening on its port (e.g., 5001). **Fix:** Corrected `server.js` to use `process.env.PORT` instead of the undefined `process.env.BACKEND_PORT`.
  - **Cause 3:** Nginx proxy rule is incorrect. **Fix:** Ensure `location ^~ /mayday-api/` uses `proxy_pass http://localhost:5001/api/;` to correctly map the URL.

- **Symptom:** Clicking "Open Call Center" leads to a blank page or wrong URL.

  - **Cause:** The main hospitality frontend was built without the correct `REACT_APP_CALL_CENTER_URL`. **Fix:** Rebuild the `client` app with the variable set, e.g., `... npm run build`.

- **Symptom:** Nginx fails to reload with an `invalid parameter "immutable"` error.
  - **Cause:** The server's Nginx version is older. **Fix:** Change `add_header Cache-Control "public, immutable";` to `add_header Cache-Control "public";`.

## Security Considerations

1. **JWT Configuration**: Uses RS256 for license tokens, HS256 for user tokens
2. **CORS**: Properly configured for development and production
3. **Environment Separation**: Development and production configs are separate
4. **Port Security**: Development ports are not exposed in production

## Next Steps

1. **Testing**: Implement comprehensive testing for both applications
2. **Error Handling**: Improve error handling and user feedback
3. **Performance**: Optimize bundle sizes and loading times
4. **Monitoring**: Add logging and monitoring for production
5. **Documentation**: Keep this documentation updated as features are added

---

_Last Updated: September 2025_
_Version: 1.0.0_
