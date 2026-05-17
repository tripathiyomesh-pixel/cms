require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432,
    database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS
  });
  await client.connect();

  await client.query(`

    -- ERP fields on products table
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS erp_id           VARCHAR(100) UNIQUE,
      ADD COLUMN IF NOT EXISTS erp_source        VARCHAR(50) DEFAULT 'manual',
      ADD COLUMN IF NOT EXISTS erp_synced_at    TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS video_url         VARCHAR(500),
      ADD COLUMN IF NOT EXISTS three_sixty_url   VARCHAR(500);

    CREATE INDEX IF NOT EXISTS idx_products_erp_id ON products(erp_id);

    -- Expand erp_sync_log (already exists from migration 010)
    ALTER TABLE erp_sync_log
      ADD COLUMN IF NOT EXISTS direction     VARCHAR(20) DEFAULT 'inbound',
      ADD COLUMN IF NOT EXISTS response_data JSONB,
      ADD COLUMN IF NOT EXISTS error_message TEXT;

    -- Media table: add source column (erp vs manual upload)
    ALTER TABLE media
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'upload',
      ADD COLUMN IF NOT EXISTS alt_text VARCHAR(200);

    -- Add unique constraint on media (product_id, file_url) if not exists
    DO $$ BEGIN
      ALTER TABLE media ADD CONSTRAINT media_product_url_unique UNIQUE (product_id, file_url);
    EXCEPTION WHEN duplicate_table THEN null; END $$;

    -- ERP API settings (UUID must be provided, value is JSON type)
    INSERT INTO settings (id, key, value, is_public) VALUES
      (gen_random_uuid(), 'erp_api_url',       '""'::json,       false),
      (gen_random_uuid(), 'erp_api_key',       '""'::json,       false),
      (gen_random_uuid(), 'erp_sync_enabled',  '"false"'::json,  false),
      (gen_random_uuid(), 'erp_sync_interval', '"15"'::json,     false)
    ON CONFLICT (key) DO NOTHING;

    -- Jewellery specs constraint skipped — table created separately

  `);

  console.log('✅ Migration 013 — ERP integration fields');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });
