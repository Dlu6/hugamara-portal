#!/usr/bin/env bash

# Simple on-VM deployment helper
# Usage: (on VM) cd /home/admin/hugamara-portal && git pull && npm run deploy

set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERR]${NC} $1"; }

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

info "Project root: $ROOT_DIR"

# Frontend build-time variables for React builds
: "${REACT_APP_CALL_CENTER_URL:=https://cs.hugamara.com/callcenter/}"
export REACT_APP_CALL_CENTER_URL
info "REACT_APP_CALL_CENTER_URL=$REACT_APP_CALL_CENTER_URL"

# 1) Install/refresh dependencies where needed
info "Installing backend dependencies (production)"
if [ -f "$ROOT_DIR/backend/package.json" ]; then
  (cd backend && npm install --production --no-audit --no-fund)
fi

info "Installing callcenter backend dependencies (production)"
if [ -f "$ROOT_DIR/mayday/slave-backend/package.json" ]; then
  (cd mayday/slave-backend && npm install --production --no-audit --no-fund)
fi

# 2) Build frontends (always safe, skips if unchanged)
info "Building hospitality client"
(cd client && npm install --no-audit --no-fund && npm run build)

info "Building callcenter dashboard"
(cd mayday/mayday-client-dashboard && npm install --no-audit --no-fund && npm run build)

ok "Frontend builds completed"

# 3) Reload nginx if config is present
if [ -f "$ROOT_DIR/nginx-hugamara.conf" ]; then
  info "Validating and reloading nginx"
  if sudo nginx -t; then
    sudo cp "$ROOT_DIR/nginx-hugamara.conf" /etc/nginx/sites-available/hugamara || true
    sudo systemctl reload nginx || true
    ok "nginx reloaded"
  else
    warn "nginx config test failed; skipping reload"
  fi
fi

# 4) Restart PM2 apps
info "Restarting PM2 apps"
if pm2 describe hugamara-backend >/dev/null 2>&1; then
  pm2 restart hugamara-backend
else
  warn "PM2 app 'hugamara-backend' not found; starting via ecosystem"
  pm2 start ecosystem.config.js --only hugamara-backend || true
fi

if pm2 describe mayday-callcenter-backend >/dev/null 2>&1; then
  pm2 restart mayday-callcenter-backend
else
  warn "PM2 app 'mayday-callcenter-backend' not found; starting via ecosystem"
  pm2 start ecosystem.config.js --only mayday-callcenter-backend || true
fi

# Ensure callcenter frontend dev server is running for Nginx proxy
if pm2 describe mayday-callcenter-frontend >/dev/null 2>&1; then
  pm2 restart mayday-callcenter-frontend
else
  warn "PM2 app 'mayday-callcenter-frontend' not found; starting via ecosystem"
  pm2 start ecosystem.config.js --only mayday-callcenter-frontend || true
fi

pm2 save || true

ok "Deployment complete. Use 'pm2 status' and 'pm2 logs' to verify."


