#!/bin/bash
set -e

echo "🚀 JCOS Deploying..."

# Pull latest code
git pull origin main

# Rebuild and restart all containers
docker compose -f docker-compose.prod.yml down
docker builder prune -f
docker compose -f docker-compose.prod.yml up -d --build

# Wait for DB to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Run migrations
docker compose -f docker-compose.prod.yml exec backend \
  node src/database/migrate.js

echo "✅ Deploy complete!"
echo "Storefront: https://$(grep FRONTEND_URL .env | cut -d= -f2)"
echo "Admin:      https://$(grep ADMIN_URL .env | cut -d= -f2)"
