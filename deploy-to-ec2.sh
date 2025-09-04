#!/bin/bash

# Hugamara EC2 Deployment Script
# This script sets up the complete deployment environment on EC2

set -e

echo "🚀 Starting Hugamara deployment on EC2..."

# Configurable variables
PROJECT_DIR=/home/admin/hugamara-portal
DOMAIN=cs.hugamara.com
DB_ROOT_PASSWORD="Pasword@256"
DB_APP_PASSWORD="Pasword@256"
DB_NAME="hugamara_db"
DB_USER="hugamara_user"

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install MariaDB
echo "📦 Installing MariaDB..."
apt install -y mariadb-server mariadb-client

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot

# Start and enable services
echo "🔄 Starting and enabling services..."
systemctl start nginx
systemctl enable nginx
systemctl start mariadb
systemctl enable mariadb

# Secure MariaDB installation
echo "🔒 Securing MariaDB..."
mysql_secure_installation <<EOF

y
${DB_ROOT_PASSWORD}
${DB_ROOT_PASSWORD}
y
y
y
y
EOF

# Create database and user
echo "🗄️ Setting up database..."
mysql -u root -p"${DB_ROOT_PASSWORD}" <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/admin/logs

# Clone the repository
echo "📥 Ensuring project directory exists..."
cd /home/admin
if [ -d "${PROJECT_DIR}" ]; then
  echo "ℹ️ Project directory ${PROJECT_DIR} already exists. Skipping clone."
else
  echo "❗ PROJECT_DIR ${PROJECT_DIR} not found. Please clone your repo into this path with the development branch."
  echo "   Example: git clone <REPO_URL> ${PROJECT_DIR} && cd ${PROJECT_DIR} && git checkout development"
  exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd ${PROJECT_DIR}/backend
npm install --production

echo "📦 Installing frontend dependencies..."
cd ${PROJECT_DIR}/client
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

############### SSL + Nginx setup ###############
# Obtain SSL certificate first (standalone), then enable SSL in nginx
echo "🔒 Obtaining SSL certificate (standalone)..."
systemctl stop nginx
certbot certonly --standalone -d ${DOMAIN} --non-interactive --agree-tos --email admin@hugamara.com || true
systemctl start nginx

# Configure nginx site with SSL
echo "🌐 Setting up Nginx configuration..."
cp ${PROJECT_DIR}/nginx-hugamara.conf /etc/nginx/sites-available/hugamara
ln -sf /etc/nginx/sites-available/hugamara /etc/nginx/sites-enabled/hugamara
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ${PROJECT_DIR}/ecosystem.config.js --update-env
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now available at: https://${DOMAIN}"
echo "📊 Check PM2 status with: pm2 status"
echo "📋 Check logs with: pm2 logs"
