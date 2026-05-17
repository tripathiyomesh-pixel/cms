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
    -- Add ERP integration fields to custom_orders
    ALTER TABLE custom_orders
      ADD COLUMN IF NOT EXISTS erp_order_id  VARCHAR(100),
      ADD COLUMN IF NOT EXISTS erp_status     VARCHAR(100),
      ADD COLUMN IF NOT EXISTS quoted_amount  NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS quoted_at      TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS occasion       VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ring_size      VARCHAR(20);

    -- Simplify status to lead stages only
    -- Drop old manufacturing statuses, keep simple lead flow
    DO $$ BEGIN
      ALTER TABLE custom_orders DROP CONSTRAINT IF EXISTS custom_orders_status_check;
    EXCEPTION WHEN undefined_object THEN null; END $$;

    ALTER TABLE custom_orders
      ADD CONSTRAINT custom_orders_status_check
      CHECK (status IN ('INQUIRY','CONTACTED','QUOTED','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED'));

    -- Update any old statuses to INQUIRY
    UPDATE custom_orders
    SET status = 'INQUIRY'
    WHERE status NOT IN ('INQUIRY','CONTACTED','QUOTED','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED');

    -- ERP webhook log table
    CREATE TABLE IF NOT EXISTS erp_sync_log (
      id           SERIAL PRIMARY KEY,
      event_type   VARCHAR(100) NOT NULL,
      payload      JSONB,
      status       VARCHAR(20) DEFAULT 'received',
      error        TEXT,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    -- Remove suppliers and memos from feature flags (ERP handles them)
    DELETE FROM feature_flags WHERE flag_key IN ('module_supplier', 'module_memo');

    -- Add ERP integration flag
    INSERT INTO feature_flags (flag_key, label, module, is_enabled)
    VALUES ('module_erp_integration', 'Vantix ERP Integration', 'operations', false)
    ON CONFLICT (flag_key) DO NOTHING;
  `);

  console.log('✅ Migration 010 — ERP integration fields + simplified custom order statuses');
  await client.end();
}
up().catch(e => { console.error('❌', e.message); process.exit(1); });
