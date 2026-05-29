#!/bin/sh
echo "Starting VANTIX-CMS..."
echo "DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Waiting for PostgreSQL..."
i=0
while true; do
  node -e "
const {Client}=require('pg');
const c=new Client({host:process.env.DB_HOST||'postgres',port:parseInt(process.env.DB_PORT)||5432,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASS});
c.connect().then(()=>{c.end();process.exit(0)}).catch(()=>process.exit(1));
" 2>/dev/null && break
  i=$((i+1))
  if [ $i -gt 30 ]; then
    echo "PostgreSQL timeout - starting anyway"
    break
  fi
  sleep 2
done
echo "PostgreSQL ready"

echo "Running migrations..."
node scripts/migrate.js && echo "Migrations done" || echo "Migration warning - check logs"

echo "Starting server on port ${PORT:-4000}..."
exec npx nodemon src/server.js
