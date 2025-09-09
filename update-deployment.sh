#!/bin/bash

# Update Hugamara Portal with Call Center
set -e

echo "🚀 Updating Hugamara Portal with Call Center..."

# Configuration
EC2_HOST="ec2-13-234-18-2.ap-south-1.compute.amazonaws.com"
EC2_USER="admin"
SSH_KEY="/Users/matovumedhi/Downloads/hugamara.pem"
REMOTE_DIR="/home/admin/hugamara-portal"

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

print_status "Step 3: Preparing update files..."
cd ../..
mkdir -p update-temp
cp -r client/build update-temp/
cp -r mayday/mayday-client-dashboard/build update-temp/mayday-frontend-build
cp -r mayday/slave-backend update-temp/
cp ecosystem.config.js update-temp/
cp nginx-hugamara.conf update-temp/

print_status "Step 4: Uploading files to EC2..."
copy_to_remote "update-temp/*" "$REMOTE_DIR/"
print_success "Files uploaded to EC2"

print_status "Step 5: Installing call center dependencies..."
run_remote "cd $REMOTE_DIR/mayday/slave-backend && npm install"
run_remote "cd $REMOTE_DIR && npm install -g serve"

print_status "Step 6: Moving build files..."
run_remote "cd $REMOTE_DIR && mv mayday-frontend-build mayday/mayday-client-dashboard/build"

print_status "Step 7: Updating nginx configuration..."
run_remote "sudo cp $REMOTE_DIR/nginx-hugamara.conf /etc/nginx/sites-available/hugamara"
run_remote "sudo nginx -t && sudo systemctl reload nginx"
print_success "Nginx configuration updated"

print_status "Step 8: Updating PM2 applications..."
run_remote "cd $REMOTE_DIR && pm2 stop all"
run_remote "cd $REMOTE_DIR && pm2 start ecosystem.config.js"
run_remote "pm2 save"
print_success "PM2 applications updated"

print_status "Step 9: Checking application status..."
run_remote "pm2 status"

print_status "Step 10: Cleaning up..."
rm -rf update-temp

print_success "🎉 Update completed successfully!"
print_status "Applications are now running:"
print_status "- Hugamara Backend: http://$EC2_HOST:5000"
print_status "- Hugamara Frontend: https://cs.hugamara.com"
print_status "- Mayday Call Center Backend: http://$EC2_HOST:3002"
print_status "- Mayday Call Center Frontend: https://cs.hugamara.com/callcenter/"
print_status "- Mayday Call Center Direct: http://$EC2_HOST:3001"
