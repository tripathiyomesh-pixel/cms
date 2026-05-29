#!/bin/sh
# VANTIX-CMS Backend Startup Script
set -e

echo "🚀 VANTIX-CMS Backend Starting..."
echo "   DB: $DB_HOST:$DB_PORT/$DB_NAME"

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until node -e "
const {Client}=require('pg');
const c=new Client({host:process.env.DB_HOST,port:process.env.DB_PORT||5432,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASS});
c.connect().then(()=>{c.end();process.exit(0)}).catch(()=>process.exit(1));
" 2>/dev/null; do
  sleep 2
done
echo "✅ PostgreSQL ready"

# Run all migrations via the runner (env vars already set by Docker)
echo "📦 Running migrations..."
node scripts/migrate.js
echo "✅ Migrations done"

echo "🌐 Starting server on port ${PORT:-4000}..."
exec npx nodemon src/server.js
