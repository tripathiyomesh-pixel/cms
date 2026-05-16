require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected...');

  await client.query(`
    -- Make jewellery-specific columns optional
    -- They are required ONLY when jewellery plugin is installed
    ALTER TABLE products
      ALTER COLUMN metal_type  DROP NOT NULL,
      ALTER COLUMN purity      DROP NOT NULL,
      ALTER COLUMN gross_weight DROP NOT NULL;

    -- Set defaults for price columns
    ALTER TABLE products
      ALTER COLUMN final_price SET DEFAULT 0,
      ALTER COLUMN base_price  SET DEFAULT 0;
  `);

  console.log('✅ Migration 007 complete — product columns relaxed for universal use');
  await client.end();
}
up().catch(e => { console.error('❌', e.message); process.exit(1); });
