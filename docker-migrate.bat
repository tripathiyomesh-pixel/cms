@echo off
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Running CMS migrations in Docker
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

docker compose exec backend node src/database/migrations/001_schema.js
docker compose exec backend node src/database/migrations/002_plugins.js
docker compose exec backend node src/database/migrations/003_universal.js
docker compose exec backend node src/database/migrations/004_jewellery_specs.js
docker compose exec backend node src/database/migrations/005_appointments_upgrade.js

echo.
echo All migrations complete!
pause
