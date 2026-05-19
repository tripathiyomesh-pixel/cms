require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: +process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await client.connect();

  await client.query(`

    -- ── GOLD RATES TABLE ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS gold_rates (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rate_24k     DECIMAL(10,2) NOT NULL,
      rate_22k     DECIMAL(10,2) NOT NULL,
      rate_21k     DECIMAL(10,2) DEFAULT 0,
      rate_18k     DECIMAL(10,2) NOT NULL,
      rate_14k     DECIMAL(10,2) DEFAULT 0,
      currency     VARCHAR(10) DEFAULT 'AED',
      source       VARCHAR(100) DEFAULT 'manual',
      source_url   TEXT,
      fetched_at   TIMESTAMPTZ DEFAULT NOW(),
      is_active    BOOLEAN DEFAULT true,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── GOLD RATE HISTORY (keep last 90 days) ────────────────
    CREATE TABLE IF NOT EXISTS gold_rate_history (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rate_24k     DECIMAL(10,2) NOT NULL,
      rate_22k     DECIMAL(10,2) NOT NULL,
      rate_18k     DECIMAL(10,2) NOT NULL,
      currency     VARCHAR(10) DEFAULT 'AED',
      source       VARCHAR(100),
      recorded_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── DYNAMIC ROLE CAPABILITIES ────────────────────────────
    -- Stores role baseline capabilities in DB (not hardcoded)
    CREATE TABLE IF NOT EXISTS role_capabilities (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role         VARCHAR(100) NOT NULL UNIQUE,
      label        VARCHAR(200) NOT NULL,
      description  TEXT,
      capabilities JSONB NOT NULL DEFAULT '{}',
      is_system    BOOLEAN DEFAULT false,
      sort_order   INTEGER DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── INDEXES ───────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_gold_rates_active    ON gold_rates(is_active, fetched_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gold_history_date    ON gold_rate_history(recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_role_caps_role       ON role_capabilities(role);

    -- ── SEED GOLD RATE (today's approximate DJG rate) ────────
    INSERT INTO gold_rates (rate_24k, rate_22k, rate_21k, rate_18k, rate_14k, source)
    VALUES (547.00, 524.75, 500.00, 410.25, 318.75, 'manual')
    ON CONFLICT DO NOTHING;

    -- ── SEED ROLE CAPABILITIES (from permissions.js → DB) ────
    INSERT INTO role_capabilities (role, label, description, capabilities, is_system, sort_order) VALUES

    ('super_admin', 'Super Admin', 'Full system access — unrestricted', '{
      "dashboard.view":true,"products.view":true,"products.create":true,"products.edit":true,"products.delete":true,"products.publish":true,
      "diamonds.view":true,"diamonds.create":true,"diamonds.edit":true,"diamonds.delete":true,
      "gemstones.view":true,"gemstones.create":true,"gemstones.edit":true,"gemstones.delete":true,
      "inventory.view":true,"inventory.manage":true,"inventory.import":true,
      "orders.view":true,"orders.create":true,"orders.manage":true,"orders.approve":true,
      "enquiries.view":true,"enquiries.manage":true,"enquiries.assign":true,
      "appointments.view":true,"appointments.create":true,"appointments.manage":true,
      "customers.view":true,"customers.create":true,"customers.edit":true,"customers.delete":true,
      "exhibitions.view":true,"exhibitions.manage":true,
      "marketing.view":true,"marketing.manage":true,
      "blog.view":true,"blog.manage":true,
      "media.view":true,"media.manage":true,
      "builder.view":true,"builder.manage":true,
      "settings.view":true,"settings.manage":true,
      "users.view":true,"users.manage":true,
      "workforce.view":true,"workforce.manage":true,
      "reports.view":true,"reports.export":true,
      "suppliers.view":true,"suppliers.manage":true,
      "erp.view":true,"erp.manage":true,
      "payments.view":true,"payments.manage":true,
      "gold_rates.view":true,"gold_rates.manage":true
    }', true, 1),

    ('admin', 'Admin', 'Full access except system settings', '{
      "dashboard.view":true,"products.view":true,"products.create":true,"products.edit":true,"products.delete":true,"products.publish":true,
      "diamonds.view":true,"diamonds.create":true,"diamonds.edit":true,"diamonds.delete":true,
      "gemstones.view":true,"gemstones.create":true,"gemstones.edit":true,"gemstones.delete":true,
      "inventory.view":true,"inventory.manage":true,"inventory.import":true,
      "orders.view":true,"orders.create":true,"orders.manage":true,"orders.approve":true,
      "enquiries.view":true,"enquiries.manage":true,"enquiries.assign":true,
      "appointments.view":true,"appointments.create":true,"appointments.manage":true,
      "customers.view":true,"customers.create":true,"customers.edit":true,"customers.delete":true,
      "exhibitions.view":true,"exhibitions.manage":true,
      "marketing.view":true,"marketing.manage":true,
      "blog.view":true,"blog.manage":true,
      "media.view":true,"media.manage":true,
      "builder.view":true,"builder.manage":true,
      "settings.view":true,
      "users.view":true,"users.manage":true,
      "workforce.view":true,"workforce.manage":true,
      "reports.view":true,"reports.export":true,
      "suppliers.view":true,"suppliers.manage":true,
      "erp.view":true,
      "payments.view":true,
      "gold_rates.view":true,"gold_rates.manage":true
    }', true, 2),

    ('boutique_manager', 'Boutique Manager', 'Branch operations and team management', '{
      "dashboard.view":true,
      "products.view":true,"products.create":true,"products.edit":true,
      "diamonds.view":true,"diamonds.create":true,"diamonds.edit":true,
      "inventory.view":true,"inventory.manage":true,
      "orders.view":true,"orders.manage":true,"orders.approve":true,
      "enquiries.view":true,"enquiries.manage":true,"enquiries.assign":true,
      "appointments.view":true,"appointments.manage":true,
      "customers.view":true,"customers.edit":true,
      "exhibitions.view":true,"exhibitions.manage":true,
      "marketing.view":true,
      "media.view":true,"media.manage":true,
      "reports.view":true,
      "workforce.view":true,
      "gold_rates.view":true
    }', true, 3),

    ('sales_staff', 'Sales Staff', 'Customer-facing sales operations', '{
      "dashboard.view":true,
      "products.view":true,
      "diamonds.view":true,
      "enquiries.view":true,"enquiries.manage":true,
      "appointments.view":true,"appointments.create":true,
      "customers.view":true,"customers.create":true,"customers.edit":true,
      "orders.view":true,"orders.create":true,
      "gold_rates.view":true
    }', true, 4),

    ('inventory_staff', 'Inventory Staff', 'Product and stock management', '{
      "dashboard.view":true,
      "products.view":true,"products.create":true,"products.edit":true,
      "diamonds.view":true,"diamonds.create":true,"diamonds.edit":true,
      "gemstones.view":true,"gemstones.create":true,"gemstones.edit":true,
      "inventory.view":true,"inventory.manage":true,"inventory.import":true,
      "suppliers.view":true,
      "media.view":true,"media.manage":true,
      "gold_rates.view":true
    }', true, 5),

    ('marketing_staff', 'Marketing Staff', 'Content and website management', '{
      "dashboard.view":true,
      "products.view":true,
      "marketing.view":true,"marketing.manage":true,
      "blog.view":true,"blog.manage":true,
      "media.view":true,"media.manage":true,
      "builder.view":true,"builder.manage":true,
      "exhibitions.view":true
    }', true, 6),

    ('crm_staff', 'CRM Staff', 'Customer relationship management', '{
      "dashboard.view":true,
      "enquiries.view":true,"enquiries.manage":true,
      "appointments.view":true,"appointments.create":true,
      "customers.view":true,"customers.create":true,"customers.edit":true,
      "orders.view":true,
      "gold_rates.view":true
    }', true, 7),

    ('accountant', 'Accountant', 'Financial reporting and payments', '{
      "dashboard.view":true,
      "orders.view":true,
      "payments.view":true,
      "reports.view":true,"reports.export":true,
      "customers.view":true,
      "gold_rates.view":true
    }', true, 8),

    ('viewer', 'Viewer', 'Read-only access to all content', '{
      "dashboard.view":true,
      "products.view":true,
      "diamonds.view":true,
      "orders.view":true,
      "enquiries.view":true,
      "customers.view":true,
      "reports.view":true,
      "gold_rates.view":true
    }', true, 9)

    ON CONFLICT (role) DO UPDATE SET
      capabilities = EXCLUDED.capabilities,
      label = EXCLUDED.label,
      updated_at = NOW();

  `);

  console.log('✅ Migration 017 — Gold rates + dynamic role capabilities');
  console.log('   Tables: gold_rates, gold_rate_history, role_capabilities');
  console.log('   Seeded: current gold rate + 9 role capability sets');
  await client.end();
}

up().catch(e => { console.error('❌', e.message); process.exit(1); });
