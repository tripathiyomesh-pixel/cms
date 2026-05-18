require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client }  = require('pg');
const bcrypt      = require('bcryptjs');
const crypto      = require('crypto');

async function seed() {
  const client = new Client({
    host:     process.env.DB_HOST     || 'postgres',
    port:     +process.env.DB_PORT    || 5432,
    database: process.env.DB_NAME     || 'jewellery_cms',
    user:     process.env.DB_USER     || 'cmsuser',
    password: process.env.DB_PASS     || 'CmsPass@2026',
  });
  await client.connect();
  const hash = await bcrypt.hash('Admin@2026', 12);
  const id   = crypto.randomUUID();
  await client.query(
    `INSERT INTO users (id,name,email,password,role,is_active,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,true,NOW(),NOW())
     ON CONFLICT (email) DO UPDATE SET password=$4, role=$5, is_active=true`,
    [id, 'Super Admin', 'admin@vantix.io', hash, 'super_admin']
  );
  console.log('✅ admin@vantix.io / Admin@2026 ready');
  await client.end();
}
seed().catch(e => { console.error('❌', e.message); process.exit(1); });
