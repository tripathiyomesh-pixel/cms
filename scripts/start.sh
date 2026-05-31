#!/bin/sh
set -e

echo "Starting VANTIX-CMS..."
echo "DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Wait for PostgreSQL using pg_isready via node
echo "Waiting for PostgreSQL..."
MAX=30
i=0
while [ $i -lt $MAX ]; do
  node -e "require('pg').Pool && new (require('pg').Pool)({host:process.env.DB_HOST||'postgres',port:process.env.DB_PORT||5432,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASS}).query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null && break
  i=$((i+1))
  echo "  Waiting... ($i/$MAX)"
  sleep 2
done

if [ $i -eq $MAX ]; then
  echo "PostgreSQL timeout after ${MAX} attempts - starting anyway"
else
  echo "PostgreSQL ready after $i attempts"
fi

echo "Running migrations..."
node scripts/migrate.js && echo "Migrations OK" || echo "Migration warning - continuing"

echo "Starting server on port ${PORT:-4000}..."
exec node src/server.js
