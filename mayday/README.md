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

   Configure the call center database connection in `mayday/slave-backend/.env`. Use a privileged user like `root` to ensure permissions for database migrations and schema synchronization.

   ```ini
   # Example for mayday/slave-backend/.env
   DB_HOST=cs.hugamara.com
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_ROOT_PASSWORD
   DB_NAME=asterisk
   ```

3. **Configure trunk provider settings:**

   ```bash
   # Add to mayday/slave-backend/.env
   echo "TRUNK_PROVIDER_AUTH_HEADER=MDMyMDAwMDAwODoxMy4yMzQuMTguMg==" >> mayday/slave-backend/.env
   echo "TRUNK_PROVIDER_VALIDATE_URL=https://ug.cyber-innovative.com:444/cyber-api/cyber_validate.php" >> mayday/slave-backend/.env
   ```

4. **Start the call center system:**

   ```bash
   npm run callcenter
   ```

5. **Access the application:**
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
- **Chrome Extension**: Multi-tenant softphone extension with dynamic configuration
- **Trunk Provider Integration**: External API integration for call validation

## 📞 Outbound Dialing: Default DID, DID Inventory, and Helper Context

- Default DID per agent: Stored in `users.callerid` and editable in the dashboard (Agents → Voice → “Default DID (no‑prefix CLI)”). No‑prefix calls will use this DID unless an explicit route overrides it.
- DID Inventory (DB): Table `did_inventory` contains your outlet DIDs and metadata (outlet name, allow_inbound/outbound, etc.). The dashboard uses it to populate DID dropdowns (endpoint: `/api/users/inbound_route/dids`).
- File-based helper: Asterisk dialplan defines `outbound-dial` in your file include. It receives `${ARG1}` = destination, `${ARG2}` = DID and:
  - Sets `CALLERID(num)` and `CALLERID(name)` from `${ARG2}`
  - Dials `PJSIP/${ARG1}@Hugamara_Trunk`
- Usage patterns:
  - Prefix dialing (recommended for ad‑hoc DID choice): agents dial 2‑digit prefix (43–49) + number; the file dialplan forces the corresponding DID and jumps into `outbound-dial`.
  - No‑prefix dialing (fixed/default): the helper uses the agent’s `DEFAULT_DID` (from endpoint) or a UI route can set a specific DID via a “Set CALLERID(all)=...” prior to the Dial.

## 🧭 Contexts

- Per‑agent context selection is no longer used in the UI. Agents are provisioned into standard contexts server‑side; the Agent Edit form does not expose context.
- The file include `extensions_mayday_context.conf` is the single source of truth for outbound logic (prefixes and `outbound-dial`). The server does not auto‑generate this context to avoid conflicts.

## 🖥️ Dashboard Workflows

### Set Default DID per Agent

1. Agents → select agent → Voice tab
2. “Default DID (no‑prefix CLI)” → choose from dropdown (pulled from `did_inventory`)
3. Save (writes `users.callerid`)

### Configure a Fixed Outbound Route (optional)

Use when you want a route that always presents one DID without agent prefixes.

1. Voice → Outbound Routes → Edit (or Create)
2. Actions tab → drag “Outbound Dial” into the flow
3. In the dialog:
   - Trunk: `Hugamara_Trunk`
   - Caller ID (DID): select from dropdown (labels like `LaCueva (0323300245)`)
   - Prefix: leave blank unless provider needs a prepend
4. Save. The UI auto‑inserts a “Custom → Set CALLERID(all)="<DID> <DID>"” immediately above Dial, mirroring the helper’s behavior

Notes:

- You don’t need a UI Outbound Route for prefix use cases; the file dialplan already handles 43–49.
- For per‑agent defaults (no prefix), setting `users.callerid` is enough; no UI route is required.

## 🔌 API Endpoints (DID Dropdown)

- List DIDs (inventory first, fallback to inbound routes):
  - `GET /api/users/inbound_route/dids` → `[{ did: "0323300245", label: "LaCueva (0323300245)" }, ...]`

## ✅ Verification

On the PBX:

- Reload dialplan after editing your file include:
  - `asterisk -rx 'dialplan reload'`
- Show helper context:
  - `asterisk -rx 'dialplan show outbound-dial'`
- Quick call test flow (agent 1009):
  - No prefix: expect `Gosub(outbound-dial,s,1(0700...,<DEFAULT_DID>))`
  - Prefix 45: expect `Gosub(outbound-dial,s,1(0700...,0323300245))`

## 🧪 Troubleshooting Outbound Calls

Symptoms: `Everyone is busy/congested` immediately after Dial.

Checklist:

1. Endpoint name matches dial string:
   - Dial uses `PJSIP/${ARG1}@Hugamara_Trunk` → endpoint id must be `Hugamara_Trunk`.
2. Registration/peer status:
   - Registration: `asterisk -rx 'pjsip show registrations'` → Status: Registered
   - Peer/IP: `pjsip show endpoint Hugamara_Trunk` → AOR Contacts > 0, `pjsip show identify` matches provider IP
3. Number format:
   - Some providers require E.164 (e.g., `256700…`). Add a Prefix in the Outbound Dial dialog to prepend country code
4. See actual SIP error:
   - `asterisk -rx 'pjsip set logger on'` → place call → check 403/404/480 codes from provider

Provider requirements:

- Ensure trunk has `send_pai=yes` and `send_rpid=yes` so the asserted CLI is honored.
- Provider must allow the DID you present as CLI.

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

#### Running Database Migrations Manually

Due to a custom programmatic setup in `config/sequelize.js`, the standard `npx sequelize-cli db:migrate` command will fail because it cannot find a `config/config.json` file.

To run a migration, you must use a custom script.

**1. Create a Runner Script**

Create a temporary file in the `mayday/slave-backend/` directory (e.g., `run-migration.mjs`):

```javascript
// run-migration.mjs
import { sequelize } from "./config/sequelize.js";

// Use a dynamic import for the migration file, as it is a CommonJS module
const migration = await import(
  "./migrations/20250924180000-add-qualify-fields-to-ps-contacts.js"
);

import pkg from "sequelize";
const { Sequelize } = pkg;

const { up } = migration;

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();
  console.log("Starting migration...");
  try {
    await up(queryInterface, Sequelize);
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
```

**2. Run the Script**

Execute the script from within the `mayday/slave-backend` directory on the server:

```bash
node --experimental-specifier-resolution=node run-migration.mjs
```

**3. Reliable Fallback: Direct SQL**

If Node.js scripting fails due to environment issues, the most reliable method is to apply the change with a direct SQL command.

```bash
# Example for adding a column
ssh -i <your-key.pem> admin@<your-server-ip> "sudo mysql -uroot asterisk -e \"ALTER TABLE ps_contacts ADD COLUMN qualify_2xx_only ENUM('yes', 'no') NOT NULL DEFAULT 'no';\""
```

#### Troubleshooting: ER_TOO_MANY_KEYS (Duplicate Indexes)

If you encounter the error `ER_TOO_MANY_KEYS (1069): Too many keys specified; max 64 keys allowed` during database sync, it means a table has accumulated duplicate unique indexes from repeated syncs with older model definitions. This has been observed on `dialplan_contexts` (`name` column) and `client_session` (`session_token` column).

**Fix (run on the VM as root):**

```bash
# This script drops all extra indexes on the specified column and ensures a single, named unique index exists.
# --- Fix for dialplan_contexts ---
DB=asterisk
TBL=dialplan_contexts
COL=name
mysql -uroot -N -e "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='${DB}' AND TABLE_NAME='${TBL}' AND COLUMN_NAME='${COL}' AND INDEX_NAME NOT IN ('PRIMARY', 'ux_${TBL}_${COL}');" | while read idx; do
  if [ -n "$idx" ]; then
    echo "Dropping index: $idx from ${TBL}"
    mysql -uroot "$DB" -e "ALTER TABLE ${TBL} DROP INDEX \`$idx\`"
  fi
done
mysql -uroot "${DB}" -e "CREATE UNIQUE INDEX ux_${TBL}_${COL} ON ${TBL} (${COL});" || echo "Index on ${TBL} already exists or failed."

# --- Fix for client_session ---
TBL=client_session
COL=session_token
mysql -uroot -N -e "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='${DB}' AND TABLE_NAME='${TBL}' AND COLUMN_NAME='${COL}' AND INDEX_NAME <> 'PRIMARY';" | while read idx; do
  if [ -n "$idx" ]; then
    echo "Dropping index: $idx from ${TBL}"
    mysql -uroot "$DB" -e "ALTER TABLE ${TBL} DROP INDEX \`$idx\`"
  fi
done
mysql -uroot "${DB}" -e "CREATE UNIQUE INDEX ux_${TBL}_${COL} ON ${TBL} (${COL}(255));" || echo "Index on ${TBL} already exists or failed."

# Verify final indexes
echo "--- Final indexes for dialplan_contexts ---"
mysql -uroot "${DB}" -e "SHOW INDEX FROM dialplan_contexts;"
echo "--- Final indexes for client_session ---"
mysql -uroot "${DB}" -e "SHOW INDEX FROM client_session;"
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

### External Integrations

#### Trunk Provider Integration

The call center system integrates with external trunk providers for call validation and account management:

**Configuration:**

- **Auth Header**: Base64 encoded credentials for API authentication
- **Validate URL**: Endpoint for account balance and validation checks
- **Environment Variables**: Configured in both development (.env) and production (ecosystem.config.js)

**Usage Example:**

```bash
curl --location 'https://ug.cyber-innovative.com:444/cyber-api/cyber_validate.php' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: Basic MDMyMDAwMDAwODoxMy4yMzQuMTguMg==' \
--data-urlencode 'account=0320000008' \
--data-urlencode 'BALANCE=BALANCE'
```

**Environment Configuration:**

- **Development**: Set in `mayday/slave-backend/.env`
- **Production**: Set in `ecosystem.config.js` for PM2 management

**API Integration:**

```javascript
// In your backend code
const authHeader = process.env.TRUNK_PROVIDER_AUTH_HEADER;
const validateUrl = process.env.TRUNK_PROVIDER_VALIDATE_URL;

const response = await fetch(validateUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${authHeader}`,
  },
  body: new URLSearchParams({
    account: "0320000008",
    BALANCE: "BALANCE",
  }),
});
```

#### Chrome Extension Multi-Tenant Configuration

The Chrome extension supports dynamic multi-tenant configuration:

**Features:**

- **Dynamic URL Detection**: Automatically detects current domain and generates appropriate API endpoints
- **Tenant-Specific API Paths**: Uses `/mayday-api` for Hugamara domains, `/api` for others
- **CORS-Friendly**: Each tenant uses their own domain, eliminating cross-origin issues
- **No Hardcoded URLs**: All endpoints are generated dynamically based on current origin

**Configuration Priority:**

1. Stored host URL (from Chrome storage)
2. Current origin (detected from window.location)
3. Environment variables
4. Dynamic fallback based on current origin

**Usage:**

```javascript
// The extension automatically detects the current domain
// For https://cs.hugamara.com → uses /mayday-api endpoints
// For https://client1.example.com → uses /api endpoints

// Health check example:
const endpoints = await config.getDynamicEndpoints();
const response = await fetch(endpoints.users.systemHealth, {
  method: "GET",
  signal: AbortSignal.timeout(5000),
});
```

## 📩 SMS Integration

The Call Center now supports outbound SMS via an external provider and a built-in UI in the Electron softphone.

### Provider

- Default provider: Cyber Innovative SMS
- Base URL: `https://sms.cyber-innovative.com/secure`
- Optional Override IP (when DNS fails): `41.77.78.156`

### Backend Configuration (Production)

Add these variables to the `mayday-callcenter-backend` app in `ecosystem.config.js`:

```js
// SMS Provider Configuration
SMS_PROVIDER_BASE_URL: "https://sms.cyber-innovative.com/secure",
SMS_PROVIDER_OVERRIDE_IP: "41.77.78.156",     // optional; for DNS issues
SMS_PROVIDER_STRICT_TLS: "false",             // "true" if NOT using override IP
// Use either USER/PASS or AUTH header (prefer user/pass)
SMS_PROVIDER_USERNAME: "medhi",
SMS_PROVIDER_PASSWORD: "Lusuku@#2025!",
// Alternatively:
// SMS_PROVIDER_AUTH: "Basic bWVkaGk6THVzdWt1QCMyMDI1IQ==",
SMS_DEFAULT_SENDER: "Hugamara",
SMS_DLR_URL: "https://cs.hugamara.com/api/sms/dlr",
```

Notes:

- Use one authentication method only: Username/Password, or `SMS_PROVIDER_AUTH`.
- If DNS works on the server, omit `SMS_PROVIDER_OVERRIDE_IP` and set `SMS_PROVIDER_STRICT_TLS` to `"true"`.

### Backend Configuration (Development)

- Dashboard API client points to `http://localhost:8004/api` automatically when accessed on `localhost`.
- Delivery Report (DLR) URL in dev: `http://localhost:8004/api/sms/dlr`.

### Runtime Configuration (Dashboard)

You can configure the provider at runtime in the Call Center Dashboard:

- Navigate: `Integrations → SMS`
- Fields:
  - Base URL
  - Override IP (optional)
  - Strict TLS (enable if no Override IP)
  - Auth Header (Basic ...) or Username/Password
  - Default Sender
  - DLR URL (dev/prod values above)
- Actions:
  - Save Configuration
  - Check Balance

Internally, the runtime config is stored in Redis (`key: sms_provider_config`). If this key exists, it overrides environment variables. To revert to env values in production:

```bash
redis-cli DEL sms_provider_config
pm2 restart mayday-callcenter-backend
```

### API Endpoints (Backend)

- `POST /api/sms/send` — Send an SMS
- `GET  /api/sms/balance` — Provider balance (admin)
- `GET  /api/sms/providers` — Provider metadata (admin)
- `GET  /api/sms/config` — Get current configuration (admin)
- `PUT|POST /api/sms/config` — Update runtime configuration (admin)
- `POST /api/sms/dlr` — Delivery Report webhook (public)
- `GET  /api/sms/conversations` — List SMS conversations (latest per partner)
- `GET  /api/sms/conversations/:phoneNumber` — Messages for a phone number

### cURL Examples

Send SMS:

```bash
curl --location 'https://sms.cyber-innovative.com/secure/send' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic bWVkaGk6THVzdWt1QCMyMDI1IQ==' \
  --data '{
    "to":"+256700771301",
    "from":"Hugamara",
    "content":"This is a test message from Hugamara Mayday",
    "dlr":"yes",
    "dlr-url":"https://cs.hugamara.com/api/sms/dlr",
    "dlr-level":3
  }'
```

Check Balance:

```bash
curl --location 'https://sms.cyber-innovative.com/secure/balance' \
  --header 'Authorization: Basic bWVkaGk6THVzdWt1QCMyMDI1IQ=='
```

If DNS fails, temporarily resolve via IP and Host override (example):

```bash
curl --location 'https://sms.cyber-innovative.com/secure/send' \
  --resolve 'sms.cyber-innovative.com:443:41.77.78.156' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Basic bWVkaGk6THVzdWt1QCMyMDI1IQ==' \
  --data '{"to":"+256700771301","from":"Hugamara","content":"Test","dlr":"yes"}'
```

### Electron Softphone – SMS UI

- New sidebar item: **SMS**
- Features:
  - List conversations (latest message per partner)
  - View thread and send messages
  - Messages persist to the database (`SmsMessages` table)
  - Delivery status updates via DLR handler

### Data Model

`SmsMessage` (MySQL):

- `id` (UUID, PK)
- `providerMessageId` (string, nullable)
- `fromNumber` (string)
- `toNumber` (string)
- `content` (text)
- `direction` (`inbound` | `outbound`)
- `status` (`queued` | `sent` | `delivered` | `failed` | `received` | `undelivered`)
- `createdAt` / `updatedAt`

### Troubleshooting

- 404 on saving config: ensure backend accepts `PUT`/`POST /api/sms/config` and the dashboard points to the correct base URL.
- HTML returned instead of JSON on balance: verify the dashboard API base resolves to the backend (`http://localhost:8004/api` in dev) and not the React app.
- TLS/Host issues: when using Override IP, set `Strict TLS` to `false` or configure proper certificates for the IP/Host combination.

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
