# Port Management Guide

## 🚀 **Unified Port Strategy**

### **Main Hugamara System**

```bash
npm run server_client
```

- **Backend**: Port 8000 (`backend/server.js`)
- **Frontend**: Port 3000 (`client/`)

### **Call Center System**

```bash
npm run callcenter
```

- **Provisioning Backend**: Port 8001 (`mayday/provisioning_backend/server.js`)
- **Slave Backend**: Port 8004 (`mayday/slave-backend/server.js`)
- **Frontend**: Port 3002 (`mayday/mayday-client-dashboard/`)

## 📊 **Port Allocation Table**

| Service                      | Port | Description           | Command                           |
| ---------------------------- | ---- | --------------------- | --------------------------------- |
| **Hospitality Backend**      | 8000 | Main API server       | `npm run server`                  |
| **Hospitality Frontend**     | 3000 | Main dashboard        | `npm run start`                   |
| **Call Center Provisioning** | 8001 | License management    | `npm run callcenter:provisioning` |
| **Call Center Backend**      | 8004 | Call center API       | `npm run callcenter:backend`      |
| **Call Center Frontend**     | 3002 | Call center dashboard | `npm run callcenter:frontend`     |
| **Redis**                    | 6379 | Session storage       | `redis-server`                    |
| **MariaDB**                  | 3306 | Database              | External                          |
| **Asterisk AMI**             | 5038 | Asterisk interface    | External                          |

## 🔄 **Running Both Systems**

### **Option 1: Sequential (Recommended)**

```bash
# Terminal 1: Start main system
npm run server_client

# Terminal 2: Start call center
npm run callcenter
```

### **Option 2: All-in-One (Advanced)**

```bash
# Start everything at once
concurrently "npm run server_client" "npm run callcenter"
```

## 🌐 **Access URLs**

- **Main Hospitality**: http://localhost:3000
- **Call Center**: http://localhost:3002
- **Main API**: http://localhost:8000/api
- **Call Center Provisioning API**: http://localhost:8001/api
- **Call Center API**: http://localhost:8004/api

## ⚠️ **Important Notes**

1. **Port 3000**: Reserved for main hospitality system
2. **Port 3002**: Reserved for call center system
3. **Port 8000**: Main backend API
4. **Port 8001**: Call center provisioning backend API
5. **Port 8004**: Call center slave backend API
6. **No Conflicts**: Each system has dedicated ports

## 🔧 **Troubleshooting Port Conflicts**

```bash
# Check what's using ports
lsof -i :3000 -i :3002 -i :8000 -i :8001 -i :8004

# Kill specific processes
pkill -f "react-scripts start"
pkill -f "node server.js"

# Restart specific service
npm run callcenter:provisioning  # Port 8001
npm run callcenter:backend       # Port 8004
npm run callcenter:frontend      # Port 3002
```
