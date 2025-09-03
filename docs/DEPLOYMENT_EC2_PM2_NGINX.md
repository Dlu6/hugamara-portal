## Hugamara Deployment (EC2 + PM2 + Nginx)

### Prerequisites
- Domain A-record to the EC2 public IP (`cs.hugamara.com`)
- Security Group allows inbound 80 and 443 (and 22 for SSH)
- SSH access with key

### One-time server setup (as admin)
```bash
# login
ssh -i ~/Downloads/hugamara.pem admin@ec2-3-108-42-65.ap-south-1.compute.amazonaws.com

# packages
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt update -y && sudo apt install -y nodejs git nginx mariadb-server mariadb-client
sudo npm i -g pm2

# clone (development branch)
cd /home/admin && git clone -b development https://github.com/Dlu6/hugamara-portal.git hugamara
```

### Backend setup
```bash
cd /home/admin/hugamara/backend
npm install
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hugamara_db
DB_USER=hugamara_user
DB_PASSWORD=HugamaraPass2024!
JWT_SECRET=hugamara_jwt_secret_2024_secure_key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://cs.hugamara.com
EOF

sudo mysql -e "CREATE DATABASE IF NOT EXISTS hugamara_db; \
CREATE USER IF NOT EXISTS 'hugamara_user'@'localhost' IDENTIFIED BY 'HugamaraPass2024!'; \
GRANT ALL PRIVILEGES ON hugamara_db.* TO 'hugamara_user'@'localhost'; FLUSH PRIVILEGES;"

pm2 start server.js --name hugamara-backend
pm2 save
pm2 startup systemd -u admin --hp /home/admin
```

### Frontend build
```bash
cd /home/admin/hugamara/client
# ensure public/index.html exists (CRA requirement)
[ -f public/index.html ] || (mkdir -p public && cat > public/index.html <<'EOH'
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Hugamara</title></head><body><div id="root"></div></body></html>
EOH
)

npm install
npm run build
```

### Nginx
```bash
sudo tee /etc/nginx/sites-available/hugamara > /dev/null << 'EOF'
server {
    listen 80;
    server_name cs.hugamara.com;

    root /home/admin/hugamara/client/build;
    index index.html index.htm;

    location / { try_files $uri $uri/ /index.html; }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/hugamara /etc/nginx/sites-enabled/hugamara
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### SSL (optional)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cs.hugamara.com --non-interactive --agree-tos --email admin@hugamara.com
```

### Verify
```bash
pm2 status
curl -sSf http://127.0.0.1:5000/health
curl -I http://cs.hugamara.com
```
