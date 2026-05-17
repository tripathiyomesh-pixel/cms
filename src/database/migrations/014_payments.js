require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');
async function up() {
  const client = new Client({ host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432, database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS });
  await client.connect();
  await client.query(`

    -- Payment transactions table
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id          UUID REFERENCES orders(id),
      order_number      VARCHAR(50),
      gateway           VARCHAR(30) NOT NULL,
      gateway_order_id  VARCHAR(200),
      gateway_payment_id VARCHAR(200),
      gateway_session_id VARCHAR(200),
      amount            NUMERIC(15,2) NOT NULL,
      currency          VARCHAR(10)   DEFAULT 'AED',
      status            VARCHAR(30)   DEFAULT 'pending'
                          CHECK (status IN ('pending','initiated','processing','captured','failed','refunded','cancelled','disputed')),
      payment_method    VARCHAR(50),
      customer_email    VARCHAR(200),
      customer_phone    VARCHAR(50),
      customer_name     VARCHAR(200),
      metadata          JSONB DEFAULT '{}',
      webhook_payload   JSONB,
      error_message     TEXT,
      captured_at       TIMESTAMPTZ,
      refunded_at       TIMESTAMPTZ,
      refund_amount     NUMERIC(15,2),
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payment_gateway         ON payment_transactions(gateway);
    CREATE INDEX IF NOT EXISTS idx_payment_status          ON payment_transactions(status);
    CREATE INDEX IF NOT EXISTS idx_payment_gateway_order   ON payment_transactions(gateway_order_id);
    CREATE INDEX IF NOT EXISTS idx_payment_gateway_payment ON payment_transactions(gateway_payment_id);
    CREATE INDEX IF NOT EXISTS idx_payment_order_id        ON payment_transactions(order_id);

    -- Payment gateway settings
    INSERT INTO settings (id, key, value, is_public) VALUES
      (gen_random_uuid(), 'payment_gateways_enabled', '"tap,geidea,tabby"'::json, false),
      -- Tap Payments
      (gen_random_uuid(), 'tap_enabled',       '"false"'::json, false),
      (gen_random_uuid(), 'tap_public_key',    '""'::json,      false),
      (gen_random_uuid(), 'tap_secret_key',    '""'::json,      false),
      (gen_random_uuid(), 'tap_test_mode',     '"true"'::json,  false),
      -- Geidea
      (gen_random_uuid(), 'geidea_enabled',    '"false"'::json, false),
      (gen_random_uuid(), 'geidea_merchant_key','""'::json,     false),
      (gen_random_uuid(), 'geidea_password',   '""'::json,      false),
      (gen_random_uuid(), 'geidea_test_mode',  '"true"'::json,  false),
      -- Tabby
      (gen_random_uuid(), 'tabby_enabled',     '"false"'::json, false),
      (gen_random_uuid(), 'tabby_public_key',  '""'::json,      false),
      (gen_random_uuid(), 'tabby_secret_key',  '""'::json,      false),
      (gen_random_uuid(), 'tabby_test_mode',   '"true"'::json,  false),
      -- Tamara
      (gen_random_uuid(), 'tamara_enabled',    '"false"'::json, false),
      (gen_random_uuid(), 'tamara_token',      '""'::json,      false),
      (gen_random_uuid(), 'tamara_test_mode',  '"true"'::json,  false),
      -- Razorpay
      (gen_random_uuid(), 'razorpay_enabled',  '"false"'::json, false),
      (gen_random_uuid(), 'razorpay_key_id',   '""'::json,      false),
      (gen_random_uuid(), 'razorpay_key_secret','""'::json,     false),
      (gen_random_uuid(), 'razorpay_test_mode','"true"'::json,  false),
      -- Stripe
      (gen_random_uuid(), 'stripe_enabled',    '"false"'::json, false),
      (gen_random_uuid(), 'stripe_public_key', '""'::json,      false),
      (gen_random_uuid(), 'stripe_secret_key', '""'::json,      false),
      (gen_random_uuid(), 'stripe_test_mode',  '"true"'::json,  false)
    ON CONFLICT (key) DO NOTHING;

  `);
  console.log('✅ Migration 014 — payment gateways');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });
