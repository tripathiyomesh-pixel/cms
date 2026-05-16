/**
 * Migration 005 — Appointments system (PostgreSQL)
 * Run: node src/database/migrations/005_appointments_upgrade.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'jewellery_cms',
    user:     process.env.DB_USER || 'cmsuser',
    password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected to PostgreSQL...');

  await client.query(`

    -- ── APPOINTMENTS ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS appointments (
      id                SERIAL PRIMARY KEY,
      license_id        UUID REFERENCES licenses(id),
      location_id       INT,
      customer_name     VARCHAR(150) NOT NULL,
      customer_phone    VARCHAR(30)  NOT NULL,
      customer_email    VARCHAR(150),
      preferred_date    DATE NOT NULL,
      preferred_time    VARCHAR(20),
      purpose           VARCHAR(255),
      product_ref       VARCHAR(100),
      product_name      VARCHAR(255),
      product_url       VARCHAR(500),
      party_size        INT DEFAULT 1,
      special_requests  TEXT,
      booking_ref       VARCHAR(50) UNIQUE,
      confirmed_time    VARCHAR(20),
      lang              VARCHAR(10) DEFAULT 'en',
      status            VARCHAR(20) DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','completed','cancelled')),
      notes             TEXT,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_appt_date   ON appointments(preferred_date);
    CREATE INDEX IF NOT EXISTS idx_appt_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appt_license ON appointments(license_id);

    -- ── APPOINTMENT PURPOSES ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS appointment_purposes (
      id            SERIAL PRIMARY KEY,
      license_id    UUID REFERENCES licenses(id),
      label         VARCHAR(100) NOT NULL,
      label_ar      VARCHAR(100),
      icon          VARCHAR(50),
      duration_mins INT DEFAULT 30,
      is_active     BOOLEAN DEFAULT TRUE,
      sort_order    INT DEFAULT 0
    );

    -- ── STORE SETTINGS (key-value per license) ───────────────────
    CREATE TABLE IF NOT EXISTS store_kv_settings (
      id            SERIAL PRIMARY KEY,
      license_id    UUID REFERENCES licenses(id),
      setting_key   VARCHAR(100) NOT NULL,
      setting_value TEXT,
      setting_type  VARCHAR(20) DEFAULT 'string'
                      CHECK (setting_type IN ('string','json','boolean','number')),
      UNIQUE (license_id, setting_key)
    );

  `);

  console.log('✅ Migration 005 complete — appointments tables created (PostgreSQL)');
  await client.end();
}

up().catch(e => { console.error('❌', e.message); process.exit(1); });
