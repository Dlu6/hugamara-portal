#!/bin/bash

# Complete Hugamara Portal Deployment with Call Center
set -e

echo "🚀 Complete Hugamara Portal Deployment with Call Center..."

# Configuration
EC2_HOST="ec2-13-234-18-2.ap-south-1.compute.amazonaws.com"
EC2_USER="admin"
SSH_KEY="/Users/matovumedhi/Downloads/hugamara.pem"
REMOTE_DIR="/home/admin/hugamara-portal"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

run_remote() {
    ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "$1"
}

copy_to_remote() {
    scp -i "$SSH_KEY" -r "$1" "$EC2_USER@$EC2_HOST:$2"
}

print_status "Step 1: Building React client with call center integration..."
cd client
npm run build
print_success "Client build completed"

print_status "Step 2: Building Mayday call center application..."
cd ../mayday/mayday-client-dashboard
npm run build
print_success "Mayday call center build completed"

print_status "Step 3: Preparing deployment files..."
cd ../..
mkdir -p deploy-temp
cp -r client/build deploy-temp/
cp -r mayday/mayday-client-dashboard/build deploy-temp/mayday-frontend-build
cp -r mayday/slave-backend deploy-temp/
cp ecosystem.config.js deploy-temp/

print_status "Step 4: Creating updated nginx configuration..."
cat > deploy-temp/nginx-hugamara.conf << 'EOF'
server {
    listen 80;
    server_name cs.hugamara.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cs.hugamara.com;

    # SSL Configuration (will be updated after Let's Encrypt setup)
    ssl_certificate /etc/letsencrypt/live/cs.hugamara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cs.hugamara.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Serve React app
    location / {
        root /home/admin/hugamara-portal/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /home/admin/hugamara-portal/client/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Call Center API proxy
    location /mayday/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Call Center Frontend
    location /callcenter/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

print_status "Step 5: Uploading files to EC2..."
copy_to_remote "deploy-temp/*" "$REMOTE_DIR/"
print_success "Files uploaded to EC2"

print_status "Step 6: Installing call center dependencies..."
run_remote "cd $REMOTE_DIR/mayday/slave-backend && npm install"
run_remote "cd $REMOTE_DIR && npm install -g serve"

print_status "Step 7: Moving build files..."
run_remote "cd $REMOTE_DIR && mv mayday-frontend-build mayday/mayday-client-dashboard/build"

print_status "Step 8: Updating nginx configuration..."
run_remote "sudo cp $REMOTE_DIR/nginx-hugamara.conf /etc/nginx/sites-available/hugamara"
run_remote "sudo nginx -t && sudo systemctl reload nginx"
print_success "Nginx configuration updated"

print_status "Step 9: Updating PM2 applications..."
run_remote "cd $REMOTE_DIR && pm2 stop all"
run_remote "cd $REMOTE_DIR && pm2 start ecosystem.config.js"
run_remote "pm2 save"
print_success "PM2 applications updated"

print_status "Step 10: Checking application status..."
run_remote "pm2 status"

print_status "Step 11: Cleaning up..."
rm -rf deploy-temp

print_success "🎉 Complete deployment successful!"
print_status "Applications are now running:"
print_status "- Hugamara Backend: http://$EC2_HOST:5000"
print_status "- Hugamara Frontend: https://cs.hugamara.com"
print_status "- Mayday Call Center Backend: http://$EC2_HOST:3002"
print_status "- Mayday Call Center Frontend: https://cs.hugamara.com/callcenter/"
print_status "- Mayday Call Center API: https://cs.hugamara.com/mayday/"
print_status "- Mayday Call Center Direct: http://$EC2_HOST:3001"

print_warning "Note: The call center will open at https://cs.hugamara.com/callcenter/ when selected from the login page."
