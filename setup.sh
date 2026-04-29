#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# JewelleryCMS — Ubuntu VM Full Setup Script
# Run: chmod +x setup.sh && sudo ./setup.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "══════════════════════════════════════════════"
echo "  JewelleryCMS — Ubuntu VM Setup Starting"
echo "══════════════════════════════════════════════"

# ─── 1. SYSTEM UPDATE ────────────────────────────────────────
echo ""
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# ─── 2. INSTALL ESSENTIAL TOOLS ──────────────────────────────
echo ""
echo "[2/8] Installing essential tools..."
apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw nano htop unzip

# ─── 3. INSTALL NODE.JS 20 LTS ──────────────────────────────
echo ""
echo "[3/8] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   Node: $(node -v)"
echo "   NPM:  $(npm -v)"

# Install global tools
npm install -g nodemon pm2

# ─── 4. INSTALL MYSQL 8 ─────────────────────────────────────
echo ""
echo "[4/8] Installing MySQL 8..."
apt install -y mysql-server mysql-client

# Start & enable MySQL
systemctl start mysql
systemctl enable mysql

# Secure MySQL — set root password
MYSQL_ROOT_PASS="JewelCMS@2026"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';"
mysql -e "FLUSH PRIVILEGES;"

# Create database and user
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "
CREATE DATABASE IF NOT EXISTS jewellery_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'cmsuser'@'localhost' IDENTIFIED BY 'CmsPass@2026';
GRANT ALL PRIVILEGES ON jewellery_cms.* TO 'cmsuser'@'localhost';
FLUSH PRIVILEGES;
"
echo "   MySQL installed & configured"
echo "   Database: jewellery_cms"
echo "   User: cmsuser / CmsPass@2026"

# ─── 5. INSTALL REDIS ───────────────────────────────────────
echo ""
echo "[5/8] Installing Redis..."
apt install -y redis-server

# Configure Redis to start on boot
systemctl enable redis-server
systemctl start redis-server

# Test Redis
redis-cli ping
echo "   Redis installed & running"

# ─── 6. FIREWALL SETUP ──────────────────────────────────────
echo ""
echo "[6/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 4000/tcp    # API port
ufw allow 3000/tcp    # Frontend (future)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable
echo "   Firewall enabled — ports: 22, 80, 443, 3000, 4000"

# ─── 7. CLONE & SETUP PROJECT ───────────────────────────────
echo ""
echo "[7/8] Cloning JewelleryCMS backend..."

# Create project directory
mkdir -p /var/www
cd /var/www

# Clone repo
git clone https://github.com/tripathiyomesh-pixel/cms.git
cd cms

# Install dependencies
npm install

# Create .env file
cat > .env << 'ENVEOF'
# App
NODE_ENV=development
PORT=4000
APP_NAME=JewelleryCMS
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jewellery_cms
DB_USER=cmsuser
DB_PASS=CmsPass@2026

# JWT — CHANGE THIS IN PRODUCTION!
JWT_SECRET=JewelCMS_SuperSecret_Key_Change_Me_2026
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=JewelCMS_Refresh_Secret_Change_Me
JWT_REFRESH_EXPIRE=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# Cloudinary — fill these with your actual keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=jewellery-cms

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ENVEOF

echo "   .env file created"

# ─── 8. RUN MIGRATION & START ───────────────────────────────
echo ""
echo "[8/8] Running database migration..."
node src/database/migrations/001_schema.js

# Create PM2 ecosystem file for production
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'jewellery-cms-api',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development',
      PORT: 4000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
  }],
};
PM2EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE — JewelleryCMS is LIVE!"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "  📦 Project:   /var/www/cms"
echo "  🌐 API:       http://$(hostname -I | awk '{print $1}'):4000"
echo "  🏥 Health:    http://$(hostname -I | awk '{print $1}'):4000/health"
echo ""
echo "  🗄  MySQL"
echo "     Host:      localhost"
echo "     Database:  jewellery_cms"
echo "     User:      cmsuser"
echo "     Password:  CmsPass@2026"
echo "     Root Pass: JewelCMS@2026"
echo ""
echo "  🔴 Redis:     localhost:6379"
echo ""
echo "  ⚡ PM2 Commands:"
echo "     pm2 status              — check status"
echo "     pm2 logs                — view logs"
echo "     pm2 restart all         — restart"
echo "     pm2 stop all            — stop"
echo ""
echo "  🔧 Next Steps:"
echo "     1. Update .env with your Cloudinary keys"
echo "     2. Change JWT_SECRET to a strong random string"
echo "     3. Test API: curl http://localhost:4000/health"
echo "     4. Register first user:"
echo '        curl -X POST http://localhost:4000/api/auth/register \'
echo '          -H "Content-Type: application/json" \'
echo '          -d '"'"'{"name":"Yomesh","email":"admin@kentech.dev","password":"Admin@2026","role":"super_admin"}'"'"''
echo ""
echo "══════════════════════════════════════════════════════════"
