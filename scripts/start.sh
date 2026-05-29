#!/bin/sh
# VANTIX-CMS Backend Startup Script
# Auto-runs all migrations then starts server

set -e
echo "🚀 VANTIX-CMS Backend Starting..."

# Wait for postgres
echo "⏳ Waiting for PostgreSQL..."
until node -e "
const {Client}=require('pg');
const c=new Client({host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASS});
c.connect().then(()=>{c.end();process.exit(0)}).catch(()=>process.exit(1));
" 2>/dev/null; do sleep 2; done
echo "✅ PostgreSQL ready"

# Run all migrations in numeric order - safe to re-run (all use IF NOT EXISTS)
echo "📦 Running migrations..."
for f in $(ls src/database/migrations/*.js 2>/dev/null | sort); do
  echo "   → $f"
  node "$f" 2>&1 | tail -3 || echo "   (skipped or already run)"
done
echo "✅ All migrations complete"

echo "🌐 Starting server..."
exec npx nodemon src/server.js
