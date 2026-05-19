@echo off
echo ========================================
echo  JewelCMS — Database Setup
echo ========================================

echo [1/16] Running migration 001...
docker compose exec backend node src/database/migrations/001_schema.js

echo [2/16] Running migration 002...
docker compose exec backend node src/database/migrations/002_plugins.js

echo [3/16] Running migration 003...
docker compose exec backend node src/database/migrations/003_universal.js

echo [4/16] Running migration 004...
docker compose exec backend node src/database/migrations/004_jewellery_specs.js

echo [5/16] Running migration 005...
docker compose exec backend node src/database/migrations/005_appointments_upgrade.js

echo [6/16] Running migration 006...
docker compose exec backend node src/database/migrations/006_customers.js

echo [7/16] Running migration 007...
docker compose exec backend node src/database/migrations/007_relax_product_columns.js

echo [8/16] Running migration 008...
docker compose exec backend node src/database/migrations/008_inventory_engine.js

echo [9/16] Running migration 009...
docker compose exec backend node src/database/migrations/009_blog.js

echo [10/16] Running migration 010...
docker compose exec backend node src/database/migrations/010_erp_integration.js

echo [11/16] Running migration 011...
docker compose exec backend node src/database/migrations/011_complete_backend.js

echo [12/16] Running migration 012...
docker compose exec backend node src/database/migrations/012_exhibitions.js

echo [13/16] Running migration 013...
docker compose exec backend node src/database/migrations/013_erp_integration.js

echo [14/16] Running migration 014...
docker compose exec backend node src/database/migrations/014_payments.js

echo [15/16] Running migration 015...
docker compose exec backend node src/database/migrations/015_frontend_settings.js

echo [16/16] Running migration 016...
docker compose exec backend node src/database/migrations/016_workforce.js

echo [17/17] Running migration 017...
docker compose exec backend node src/database/migrations/017_gold_rates.js

echo [18/18] Running migration 018...
docker compose exec backend node src/database/migrations/018_notifications.js

echo [19/19] Creating admin user...
docker compose exec backend node src/database/seeds/seed_admin.js

echo ========================================
echo  DONE — Login: admin@vantix.io / Admin@2026
echo  Admin:      http://localhost:3010
echo  Storefront: http://localhost:3011
echo ========================================
pause
