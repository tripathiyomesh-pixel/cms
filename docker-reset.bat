@echo off
echo WARNING: This will delete all data and start fresh.
pause
docker compose down -v
docker compose up -d
echo Waiting for PostgreSQL...
timeout /t 10
call docker-migrate.bat
