require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(200),
      email         VARCHAR(200),
      phone         VARCHAR(30) NOT NULL,
      country_code  VARCHAR(10) DEFAULT 'AE',
      notes         TEXT,
      tags          JSONB DEFAULT '[]',
      source        VARCHAR(50) DEFAULT 'manual',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  `);
  console.log('✅ Migration 006 complete — customers table');
  await client.end();
}
up().catch(e => { console.error('❌', e.message); process.exit(1); });
