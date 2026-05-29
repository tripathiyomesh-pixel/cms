#!/bin/sh
# VANTIX-CMS Backend Startup Script
echo "🚀 VANTIX-CMS Backend Starting..."
echo "   DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Wait for PostgreSQL — up to 60 seconds
echo "⏳ Waiting for PostgreSQL..."
i=0
until node -e "
const {Client}=require('pg');
const c=new Client({
  host:process.env.DB_HOST||'postgres',
  port:parseInt(process.env.DB_PORT)||5432,
  database:process.env.DB_NAME,
  user:process.env.DB_USER,
  password:process.env.DB_PASS
});
c.connect().then(()=>{c.end();process.exit(0)}).catch(()=>process.exit(1));
" 2>/dev/null; do
  i=$((i+1))
  if [ $i -gt 30 ]; then
    echo "❌ PostgreSQL not ready after 60s — starting server anyway"
    break
  fi
  sleep 2
done
echo "✅ PostgreSQL ready"

# Run migration runner — if it fails, log error but still start server
echo "📦 Running migrations..."
node scripts/migrate.js
if [ $? -ne 0 ]; then
  echo "⚠️  Migrations failed — server will start but DB may be incomplete"
  echo "⚠️  Check DB connection and run: docker compose exec backend node scripts/migrate.js"
else
  echo "✅ Migrations complete"
fi

echo "🌐 Starting server on port ${PORT:-4000}..."
exec npx nodemon src/server.js
