@echo off
echo Starting Jewellery CMS...
docker compose up -d
echo.
echo Admin panel:  http://localhost:3000
echo API:          http://localhost:4000
echo Database GUI: http://localhost:5050
echo.
pause
