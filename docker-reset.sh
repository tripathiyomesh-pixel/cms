#!/bin/bash
# Full reset — stops containers, deletes volumes, restarts fresh
# WARNING: Deletes all data
echo "⚠️  Resetting all Docker volumes (all data will be lost)..."
docker compose down -v
docker compose up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 8
bash docker-migrate.sh
echo "✅ Fresh environment ready!"
