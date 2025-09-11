## Hugamara Deployment (EC2 + PM2 + Nginx + MariaDB)

### Prerequisites

- A-record to the EC2 public IP for `cs.hugamara.com`
- Security Group: allow TCP 22, 80, 443
- SSH access as `admin`

### 1) Provision base system

```bash
# Login
ssh -i ~/Downloads/hugamara.pem admin@<ec2-public-dns>

# Packages
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt update -y && sudo apt install -y nodejs git nginx mariadb-server mariadb-client
sudo npm i -g pm2

# Clone (development branch)
cd /home/admin && git clone -b development https://github.com/Dlu6/hugamara-portal.git hugamara-portal
```

### 2) Database (MariaDB)

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS hugamara_db; \
CREATE USER IF NOT EXISTS 'hugamara_user'@'localhost' IDENTIFIED BY 'Pasword@256'; \
GRANT ALL PRIVILEGES ON hugamara_db.* TO 'hugamara_user'@'localhost'; FLUSH PRIVILEGES;"

# Create required tables with snake_case column names
mysql -u hugamara_user -p'Pasword@256' -D hugamara_db -e "
DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS outlets;

CREATE TABLE outlets (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('hq','branch','franchise','nightclub','restaurant') NOT NULL,
  domain VARCHAR(255),
  location VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Uganda',
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
  currency VARCHAR(3) DEFAULT 'UGX',
  is_active BOOLEAN DEFAULT true,
  settings JSON,
  operating_hours JSON,
  capacity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('org_admin','general_manager','supervisor','staff','marketing_crm','finance') NOT NULL DEFAULT 'staff',
  outlet_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP NULL,
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL
);
"

# Seed outlets (as in development)
mysql -u hugamara_user -p'Pasword@256' -D hugamara_db -e "
INSERT INTO outlets (id,name,code,type,domain,location,address,city,country,phone,email,timezone,currency,is_active,settings,operating_hours,capacity,created_at,updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001','Server Room','CS','hq','cs.hugamara.com','Server Room','Server Room, Hugamara HQ','Kampala','Uganda','+256-XXX-XXX-XXX','admin@hugamara.com','Africa/Kampala','UGX',1,'{\\"theme\\":\\"dark\\",\\"notifications\\":true,\\"autoBackup\\":true}','{\\"monday\\":{\\"isOpen\\":true,\\"open\\":\\"00:00\\",\\"close\\":\\"23:59\\"}}',0,NOW(),NOW()),
('550e8400-e29b-41d4-a716-446655440002','The Villa Ug','VILLA','nightclub',NULL,'Bukoto Ntinda Rd','Bukoto Ntinda Road, Kampala','Kampala','Uganda','+256-XXX-XXX-XXX','villa@hugamara.com','Africa/Kampala','UGX',1,'{\\"theme\\":\\"dark\\",\\"music\\":\\"afrobeat\\",\\"dressCode\\":\\"smart_casual\\"}','{\\"wednesday\\":{\\"isOpen\\":true,\\"open\\":\\"20:00\\",\\"close\\":\\"04:00\\"}}',200,NOW(),NOW());
"

# Set admin password properly (generate hash from backend)
cd /home/admin/hugamara-portal/backend
npm ci
ADMIN_HASH=$(node -e "console.log(require('bcryptjs').hashSync('password123', 12))")
mysql -u hugamara_user -p'Pasword@256' -D hugamara_db -e "
INSERT INTO users (id,first_name,last_name,email,password,phone,role,outlet_id,is_active,email_verified_at,created_at,updated_at)
VALUES ('660e8400-e29b-41d4-a716-446655440001','Admin','User','admin@hugamara.com','${ADMIN_HASH}','+256-XXX-XXX-XXX','org_admin','550e8400-e29b-41d4-a716-446655440001',1,NOW(),NOW(),NOW())
ON DUPLICATE KEY UPDATE password='${ADMIN_HASH}', updated_at=NOW();
"
```

### 3) PM2 (backend) – environment via ecosystem

We run via `ecosystem.config.js` to avoid mixing .env in production.

```bash
cat > /home/admin/hugamara-portal/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "hugamara-backend",
      script: "./backend/server.js",
      cwd: "/home/admin/hugamara-portal",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        DB_HOST: "127.0.0.1",
        DB_PORT: 3306,
        DB_NAME: "hugamara_db",
        DB_USER: "hugamara_user",
        DB_PASSWORD: "Pasword@256",
        DB_SSL: "false"
      },
      error_file: "/home/admin/logs/hugamara-backend-error.log",
      out_file: "/home/admin/logs/hugamara-backend-out.log",
      log_file: "/home/admin/logs/hugamara-backend-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
EOF

mkdir -p /home/admin/logs
pm2 start /home/admin/hugamara-portal/ecosystem.config.js --only hugamara-backend
pm2 save
pm2 startup systemd -u admin --hp /home/admin
```

### 4) Nginx (React SPA + API proxy)

```bash
sudo tee /etc/nginx/sites-available/hugamara > /dev/null << 'EOF'
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
  ssl_prefer_server_ciphers off;

  # Gzip
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

  # Frontend (CRA build)
  root /home/admin/hugamara-portal/client/build;
  index index.html index.htm;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy
  location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
  }
}
EOF

sudo ln -sf /etc/nginx/sites-available/hugamara /etc/nginx/sites-enabled/hugamara
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5) SSL (Let’s Encrypt)

If certificates are not yet issued:

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d cs.hugamara.com --non-interactive --agree-tos -m admin@hugamara.com
sudo systemctl start nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 6) Frontend build (production)

Build with API base `/api` so the browser uses the same origin:

```bash
cd /home/admin/hugamara-portal/client
npm ci
REACT_APP_API_URL=/api REACT_APP_ENV=production npm run build
sudo nginx -t && sudo systemctl reload nginx
```

### 7) Smoke tests

```bash
# Health
curl -sSf http://127.0.0.1:5000/health

# Login (replace outletId with CS Server Room ID)
curl -sS -X POST https://cs.hugamara.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@hugamara.com","password":"password123","outletId":"550e8400-e29b-41d4-a716-446655440001"}'
```

### Troubleshooting

- Unknown column errors (e.g. `is_active`, `first_name`): ensure tables use snake_case as defined in models (`underscored: true`). Alter columns or recreate tables accordingly.
- ER_NO_SUCH_TABLE: create tables as above or temporarily run with `DB_SYNC=true` in PM2 env for a one-time `sequelize.sync({ alter: true })`, then set back to `false`.
- MySQL SSL error “Server does not support secure connection”: set `DB_SSL=false` in PM2 env and ensure `backend/config/database*.{js,cjs}` respect it.
- ECONNREFUSED ::1:3306: set `DB_HOST=127.0.0.1` (avoid IPv6 localhost).
- 404 GET `/api/auth/login` in Network tab: harmless stray GET; only POST `/api/auth/login` is implemented.
- No redirect after login: rebuild frontend with `REACT_APP_API_URL=/api` and ensure Nginx proxies `/api` to `localhost:5000`.

### Useful PM2 commands

```bash
pm2 status
pm2 logs --lines 100
pm2 restart hugamara-backend --update-env
pm2 stop hugamara-backend
```

### Useful paths

- Backend: `/home/admin/hugamara-portal/backend`
- Frontend build: `/home/admin/hugamara-portal/client/build`
- PM2 config: `/home/admin/hugamara-portal/ecosystem.config.js`
- Logs: `/home/admin/logs/*`
