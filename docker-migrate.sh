#!/bin/bash
# Run all migrations inside the running backend container
# Usage: bash docker-migrate.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Running CMS migrations in Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker compose exec backend node src/database/migrations/001_schema.js
docker compose exec backend node src/database/migrations/002_plugins.js
docker compose exec backend node src/database/migrations/003_universal.js
docker compose exec backend node src/database/migrations/004_jewellery_specs.js
docker compose exec backend node src/database/migrations/005_appointments_upgrade.js

echo ""
echo "✅ All migrations complete!"
docker compose exec backend node src/database/migrations/006_customers.js
docker compose exec backend node src/database/migrations/007_relax_product_columns.js
docker compose exec backend node src/database/migrations/008_inventory_engine.js
docker compose exec backend node src/database/migrations/009_blog.js
