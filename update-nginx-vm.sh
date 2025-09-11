#!/bin/bash

# Update nginx configuration on VM to include call center routes
set -e

echo "🔧 Updating nginx configuration on VM..."

# Configuration
EC2_HOST="ec2-13-234-18-2.ap-south-1.compute.amazonaws.com"
EC2_USER="admin"
SSH_KEY="/Users/matovumedhi/Downloads/hugamara.pem"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

run_remote() {
    ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "$1"
}

print_status "Step 1: Creating updated nginx configuration..."

# Create the updated nginx config with call center routes
cat > nginx-update.conf << 'EOF'
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

print_status "Step 2: Uploading updated nginx configuration to VM..."
scp -i "$SSH_KEY" nginx-update.conf "$EC2_USER@$EC2_HOST:/tmp/nginx-update.conf"

print_status "Step 3: Updating nginx configuration on VM..."
run_remote "sudo cp /tmp/nginx-update.conf /etc/nginx/sites-available/hugamara"

print_status "Step 4: Testing nginx configuration..."
run_remote "sudo nginx -t"

print_status "Step 5: Reloading nginx..."
run_remote "sudo systemctl reload nginx"

print_status "Step 6: Cleaning up..."
rm nginx-update.conf
run_remote "rm /tmp/nginx-update.conf"

print_success "🎉 Nginx configuration updated successfully!"
print_status "Call center routes added:"
print_status "- /mayday/ → Call Center API (port 3002)"
print_status "- /callcenter/ → Call Center Frontend (port 3001)"
