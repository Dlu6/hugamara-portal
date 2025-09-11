# Mayday Call Center System

A comprehensive Asterisk-based call center solution integrated into the Hugamara hospitality management system.

## 🏗️ Architecture Overview

The Mayday Call Center system consists of two main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Hugamara Main Project                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Main Backend  │  │  Main Frontend  │  │   Mayday    │  │
│  │   (Port 8000)   │  │   (Port 3000)   │  │  Call Center│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Mayday Call Center System                 │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │  Slave Backend  │  │    Client Dashboard         │  │ │
│  │  │  (Port 8004)    │  │    (Port 3002)              │  │ │
│  │  └─────────────────┘  └─────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Asterisk PBX   │
                    │  (EC2 Server)   │
                    │  Port 5038 AMI  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- Redis server running locally
- Access to EC2 Asterisk server
- MariaDB database access

### Installation & Setup

1. **Install dependencies:**

   ```bash
   npm run callcenter:install
   ```

2. **Configure environment:**

   ```bash
   # Copy environment files
   cp mayday/slave-backend/env.example mayday/slave-backend/.env
   cp mayday/mayday-client-dashboard/env.example mayday/mayday-client-dashboard/.env
   ```

3. **Start the call center system:**

   ```bash
   npm run callcenter
   ```

4. **Access the application:**
   - **Call Center Dashboard**: http://localhost:3002
   - **Login Credentials**:
     - Username: `admin`
     - Password: `Pasword@256`

### Individual Services

- **Provisioning Backend only:** `npm run callcenter:provisioning` (Port 8001)
- **Slave Backend only:** `npm run callcenter:backend` (Port 8004)
- **Frontend only:** `npm run callcenter:frontend` (Port 3002)

## 📁 Project Structure

```
mayday/
├── slave-backend/                 # Node.js backend service
│   ├── config/                   # Configuration files
│   │   ├── sequelize.js         # Database configuration
│   │   ├── redis.js             # Redis configuration
│   │   └── amiClient.js         # Asterisk AMI client
│   ├── controllers/              # API controllers
│   ├── models/                   # Database models
│   ├── routes/                   # Express routes
│   ├── services/                 # Business logic services
│   │   ├── amiService.js        # Asterisk AMI service
│   │   ├── callMonitoringService.js
│   │   └── agentStatusService.js
│   ├── scripts/                  # Utility scripts
│   │   └── setup-asterisk-config.sh
│   └── server.js                 # Main server file
│
├── mayday-client-dashboard/       # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── features/             # Feature modules
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API services
│   │   └── store/                # Redux store
│   └── public/
│
└── README.md                     # This file
```

## 🌐 Services & Ports

| Service                  | Port | Description                |
| ------------------------ | ---- | -------------------------- |
| **Provisioning Backend** | 8001 | License management server  |
| **Slave Backend**        | 8004 | Node.js API server         |
| **Client Dashboard**     | 3002 | React frontend             |
| **Asterisk AMI**         | 5038 | Asterisk Manager Interface |
| **Redis**                | 6379 | Session storage            |
| **MariaDB**              | 3306 | Database                   |

## 🔌 Integration with Main Hugamara System

### How It Fits In

The Mayday Call Center system is designed as a **standalone module** within the Hugamara ecosystem:

1. **Independent Operation**: Runs on separate ports (8001, 8004, 3002)
2. **Shared Database**: Uses the same MariaDB instance with dedicated `asterisk` database
3. **Shared Infrastructure**: Leverages existing Redis and EC2 infrastructure
4. **Modular Design**: Can be enabled/disabled without affecting main hospitality system

### Data Flow

```
Main Hugamara System          Mayday Call Center
┌─────────────────┐          ┌─────────────────┐
│   Hospitality   │          │   Call Center   │
│   Management    │          │   Operations    │
│                 │          │                 │
│  - Reservations │          │  - Call Queue   │
│  - Orders       │          │  - Agent Status │
│  - Inventory    │          │  - Call Records │
│  - Staff        │          │  - IVR System   │
└─────────────────┘          └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
            ┌─────────────────┐
            │   Shared DB     │
            │   (MariaDB)     │
            └─────────────────┘
```

## 🎯 Features

### Core Call Center Features

- **Real-time Call Monitoring**: Live call status and queue management
- **Agent Management**: Agent status, availability, and performance tracking
- **IVR System**: Interactive Voice Response configuration
- **Call Routing**: Inbound and outbound call routing rules
- **Queue Management**: Call queue configuration and monitoring
- **Call Recording**: CDR (Call Detail Records) and call history
- **WebRTC Support**: Browser-based softphone capabilities
- **Asterisk AMI Integration**: Full Asterisk Manager Interface connectivity
- **WebSocket Real-time Updates**: Live status updates to dashboard

### Integration Features

- **Asterisk AMI**: Full Asterisk Manager Interface integration
- **Database Sync**: Real-time database synchronization
- **WebSocket Communication**: Real-time updates to frontend
- **License Management**: Integrated licensing system with development fallback
- **Multi-tenant Support**: Support for multiple organizations
- **Redis Session Management**: Persistent session storage and cleanup
- **Development Mode**: Automatic fallback license creation for development

## 🛠️ Development

### Available Scripts

```bash
# Start both services
npm run callcenter

# Install dependencies
npm run callcenter:install

# Start individual services
npm run callcenter:backend
npm run callcenter:frontend
```

### Database Management

```bash
# Sync database schema
cd mayday/slave-backend
node scripts/sync-db.js

# Check database connection
cd mayday/slave-backend
node -e "import('./config/sequelize.js').then(db => db.sequelize.authenticate().then(() => console.log('✅ Database connected')).catch(err => console.error('❌ Database error:', err)))"
```

### Asterisk Configuration

The system includes scripts to configure Asterisk on your EC2 server:

```bash
# On EC2 server
sudo ./mayday/slave-backend/scripts/setup-asterisk-config.sh
```

## 🔐 Security

### Authentication

- JWT-based authentication for API access
- Session management via Redis
- Role-based access control (Admin, Agent, Manager)

### Network Security

- AMI access restricted to specific IP ranges
- HTTPS support for production deployments
- CORS configuration for cross-origin requests

## 🚀 Deployment

### Production Setup

1. **Configure Environment Variables**

   - Update `.env` files with production values
   - Set secure JWT secrets and session keys
   - Configure production database credentials

2. **Set up Asterisk on EC2 server**

   - Install Asterisk and required modules
   - Configure AMI access and permissions
   - Set up ODBC connections for database integration

3. **Configure ODBC connections**

   - Install MariaDB ODBC drivers
   - Configure `odbc.ini` and `odbcinst.ini`
   - Test database connectivity

4. **Set up reverse proxy (nginx)**

   - Configure SSL termination
   - Set up load balancing if needed
   - Configure CORS and security headers

5. **Configure SSL certificates**

   - Obtain valid SSL certificates
   - Configure HTTPS for all services
   - Set up certificate auto-renewal

6. **Set up monitoring and logging**
   - Configure log rotation
   - Set up health checks
   - Monitor AMI connections and database performance

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000 -i :3002 -i :8000 -i :8004

# Kill conflicting processes
pkill -f "react-scripts start"
pkill -f "node server.js"
```

#### Database Connection Issues

```bash
# Test database connection
cd mayday/slave-backend
node -e "import('./config/sequelize.js').then(db => db.sequelize.authenticate())"
```

#### AMI Connection Issues

- Verify Asterisk server is running on EC2
- Check AMI credentials in `.env`
- Ensure your IP is whitelisted in `manager.conf`

#### JWT Secret Errors

- Ensure `JWT_SECRET` is set in `.env`
- Verify secret is long enough (minimum 32 characters)
- Restart the backend after changing secrets

### Development Mode Features

- **Automatic License Fallback**: Creates development license when master server unavailable
- **Error Resilience**: Server continues running despite AMI connection failures
- **WebSocket Reconnection**: Automatic reconnection to frontend clients
- **Session Cleanup**: Automatic cleanup of expired sessions and orphaned data

---

**Note**: This call center system is designed to work alongside the main Hugamara hospitality management system, providing a complete solution for both hospitality operations and customer service management.
