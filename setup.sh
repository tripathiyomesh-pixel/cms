#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Jewellery CMS — Setup Script"
echo "  Stack: Node.js + PostgreSQL + Redis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check .env exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env created from .env.example — please fill in your values then re-run"
  exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Run migrations in order
echo "🗄️  Running database migrations..."
node src/database/migrations/001_schema.js
node src/database/migrations/002_plugins.js
node src/database/migrations/003_universal.js
node src/database/migrations/004_jewellery_specs.js
node src/database/migrations/005_appointments_upgrade.js

# Seed master data if exists
if [ -f "backend/seed_masters.py" ]; then
  echo "🌱 Seeding master data..."
  python3 backend/seed_masters.py
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start backend:  pm2 start src/server.js --name jewellery-cms"
echo "Start admin:    cd admin && npm install && npm run dev -- --host 0.0.0.0"
echo "Admin URL:      http://YOUR_IP:3000"
echo "API URL:        http://YOUR_IP:4000"
