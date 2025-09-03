#!/bin/bash

# Hugamara EC2 Deployment Script
# This script sets up the Hugamara application on an EC2 instance

set -e  # Exit on error

echo "=== Hugamara EC2 Deployment Script ==="
echo "Starting deployment process..."

# Update system packages
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "2. Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "3. Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "4. Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "5. Installing Git..."
sudo apt install -y git

# Clone the repository
echo "6. Cloning Hugamara repository..."
cd /home/admin
if [ -d "hugamara" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd hugamara
    git checkout development
    git pull origin development
else
    git clone -b development https://github.com/Dlu6/hugamara-portal.git hugamara
    cd hugamara
fi

# Install dependencies
echo "7. Installing project dependencies..."
npm install

# Install backend dependencies
echo "8. Installing backend dependencies..."
cd backend
npm install

# Create .env file for backend
echo "9. Creating backend .env file..."
cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hugamara_db
DB_USER=hugamara_user
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://cs.hugamara.com
EOF

echo "NOTE: Please update the .env file with your actual database credentials and secrets"

# Install client dependencies and build
echo "10. Installing client dependencies and building..."
cd ../client
npm install
npm run build

# Set up PM2 for backend
echo "11. Setting up PM2 for backend..."
cd ../backend
pm2 delete hugamara-backend || true
pm2 start server.js --name hugamara-backend
pm2 save
pm2 startup systemd -u admin --hp /home/admin

# Configure Nginx
echo "12. Configuring Nginx..."
sudo tee /etc/nginx/sites-available/hugamara > /dev/null << 'EOF'
server {
    listen 80;
    server_name cs.hugamara.com;

    # Frontend
    location / {
        root /home/admin/hugamara/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/hugamara /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo "13. Testing and reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Let's Encrypt
echo "14. Setting up SSL certificate..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cs.hugamara.com --non-interactive --agree-tos --email admin@hugamara.com

# Set up firewall
echo "15. Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "=== Deployment Complete! ==="
echo ""
echo "Next steps:"
echo "1. Update /home/admin/hugamara/backend/.env with your database credentials"
echo "2. Set up your PostgreSQL database"
echo "3. Run database migrations: cd /home/admin/hugamara/backend && npm run migrate"
echo "4. Restart the backend: pm2 restart hugamara-backend"
echo ""
echo "Your application should be accessible at https://cs.hugamara.com"
