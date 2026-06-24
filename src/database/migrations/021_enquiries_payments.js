/**
 * Migration 021 — Enquiries + Payment Transactions
 *
 * Creates:
 *   - enquiries          — storefront product enquiry capture (POST /api/enquiries)
 *   - payment_transactions — payment gateway transaction log (payments module)
 *
 * Safe to re-run — all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jewellery_cms',
  user:     process.env.DB_USER     || 'cmsuser',
  password: process.env.DB_PASS     || 'CmsPass@2026',
  ssl:      process.env.DB_SSL === 'true',
});

async function up() {
  await client.connect();
  console.log('🔗 Connected — running migration 021 (enquiries + payments)...');

  // ── enquiries ────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      -- Customer
      customer_name    VARCHAR(200) NOT NULL,
      customer_phone   VARCHAR(30)  NOT NULL,
      customer_email   VARCHAR(200),
      -- Product reference (nullable — may be a general enquiry)
      product_id       UUID        REFERENCES products(id) ON DELETE SET NULL,
      product_name     VARCHAR(300),
      product_sku      VARCHAR(100),
      product_url      TEXT,
      -- Enquiry content
      message          TEXT,
      source           VARCHAR(100) DEFAULT 'website',  -- website / instagram / whatsapp / walk-in
      status           VARCHAR(50)  DEFAULT 'new'
                         CHECK (status IN ('new','contacted','quoted','closed','spam')),
      -- CRM links
      lead_id          UUID        REFERENCES leads(id) ON DELETE SET NULL,
      customer_id      UUID        REFERENCES customers(id) ON DELETE SET NULL,
      assigned_to      UUID        REFERENCES users(id) ON DELETE SET NULL,
      notes            TEXT,
      -- Store WhatsApp used at time of enquiry
      whatsapp_number  VARCHAR(30),
      -- Timestamps
      created_at       TIMESTAMP   DEFAULT NOW(),
      updated_at       TIMESTAMP   DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_enquiries_customer_phone ON enquiries(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_enquiries_product_id     ON enquiries(product_id);
    CREATE INDEX IF NOT EXISTS idx_enquiries_status         ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_lead_id        ON enquiries(lead_id);
    CREATE INDEX IF NOT EXISTS idx_enquiries_created_at     ON enquiries(created_at DESC);
  `);
  console.log('✅ enquiries table created');

  // ── payment_transactions ──────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      -- Order link
      order_id            UUID,
      order_number        VARCHAR(100),
      -- Gateway
      gateway             VARCHAR(50)  NOT NULL,  -- tap | geidea | tabby | tamara | razorpay | stripe
      gateway_order_id    VARCHAR(300),
      gateway_session_id  VARCHAR(300),
      gateway_payment_id  VARCHAR(300),
      -- Amount
      amount              NUMERIC(12,2) NOT NULL,
      currency            VARCHAR(10)   DEFAULT 'AED',
      -- Status
      status              VARCHAR(50)   DEFAULT 'initiated'
                            CHECK (status IN ('initiated','pending','captured','failed','refunded','cancelled','expired')),
      -- Customer snapshot
      customer_name       VARCHAR(200),
      customer_email      VARCHAR(200),
      customer_phone      VARCHAR(30),
      -- Refund
      refund_amount       NUMERIC(12,2),
      refunded_at         TIMESTAMP,
      -- Webhook / verification payloads
      webhook_payload     JSONB,
      metadata            JSONB        DEFAULT '{}',
      -- Timestamps
      initiated_at        TIMESTAMP    DEFAULT NOW(),
      captured_at         TIMESTAMP,
      created_at          TIMESTAMP    DEFAULT NOW(),
      updated_at          TIMESTAMP    DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payment_tx_order_number    ON payment_transactions(order_number);
    CREATE INDEX IF NOT EXISTS idx_payment_tx_gateway         ON payment_transactions(gateway);
    CREATE INDEX IF NOT EXISTS idx_payment_tx_status          ON payment_transactions(status);
    CREATE INDEX IF NOT EXISTS idx_payment_tx_gateway_order   ON payment_transactions(gateway_order_id);
    CREATE INDEX IF NOT EXISTS idx_payment_tx_created_at      ON payment_transactions(created_at DESC);
  `);
  console.log('✅ payment_transactions table created');

  // ── erp_sync_log — ensure direction + resource_id columns exist ──────────
  // erp.routes.js references these columns but may have been created before they were added
  await client.query(`
    ALTER TABLE erp_sync_log
      ADD COLUMN IF NOT EXISTS direction   VARCHAR(20) DEFAULT 'inbound',
      ADD COLUMN IF NOT EXISTS resource_id UUID;

    CREATE INDEX IF NOT EXISTS idx_erp_sync_log_direction ON erp_sync_log(direction);
  `).catch(e => console.warn('⚠️  erp_sync_log alter skipped (table may not exist yet):', e.message));
  console.log('✅ erp_sync_log columns verified');

  // ── notifications — ensure resource columns exist ──────────────────────────
  await client.query(`
    ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS resource      VARCHAR(100),
      ADD COLUMN IF NOT EXISTS resource_id   UUID;
  `).catch(e => console.warn('⚠️  notifications alter skipped:', e.message));
  console.log('✅ notifications columns verified');

  // ── leads — ensure all fields used by crm.routes exist ────────────────────
  await client.query(`
    ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS value           NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS expected_close  DATE,
      ADD COLUMN IF NOT EXISTS lost_reason     TEXT,
      ADD COLUMN IF NOT EXISTS converted_at    TIMESTAMP,
      ADD COLUMN IF NOT EXISTS assigned_name   VARCHAR(200),
      ADD COLUMN IF NOT EXISTS budget_min      NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS budget_max      NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS priority        VARCHAR(20) DEFAULT 'normal';
  `).catch(e => console.warn('⚠️  leads alter skipped:', e.message));
  console.log('✅ leads columns verified');

  // ── purchases — ensure erp_id column exists ────────────────────────────────
  await client.query(`
    ALTER TABLE purchase_orders
      ADD COLUMN IF NOT EXISTS erp_id VARCHAR(200);
  `).catch(e => console.warn('⚠️  purchase_orders alter skipped (table may not exist yet):', e.message));

  // ── orders — ensure erp_id + payment_status columns exist ─────────────────
  await client.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid',
      ADD COLUMN IF NOT EXISTS erp_id         VARCHAR(200);
  `).catch(e => console.warn('⚠️  orders alter skipped:', e.message));
  console.log('✅ orders columns verified');

  console.log('\n✅ Migration 021 complete');
}

up()
  .catch(e => { console.error('❌ Migration 021 failed:', e.message); process.exit(1); })
  .finally(() => client.end());
