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

    -- ── IDENTITY LAYER ──────────────────────────────────────────
    -- Separate account types: workforce / customer / partner / api
    DO $$ BEGIN
      CREATE TYPE account_type AS ENUM ('workforce','customer','partner','api');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    -- ── BRANCHES ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS branches (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(200) NOT NULL,
      code          VARCHAR(50) UNIQUE,
      city          VARCHAR(100),
      country       VARCHAR(100) DEFAULT 'UAE',
      address       TEXT,
      phone         VARCHAR(50),
      email         VARCHAR(200),
      is_active     BOOLEAN DEFAULT true,
      is_main       BOOLEAN DEFAULT false,
      meta          JSONB DEFAULT '{}',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── DEPARTMENTS ───────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS departments (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(200) NOT NULL,
      code          VARCHAR(50) UNIQUE,
      description   TEXT,
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── PERMISSION POLICIES ───────────────────────────────────────
    -- ABAC: named policies that grant specific capabilities
    CREATE TABLE IF NOT EXISTS permission_policies (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(200) NOT NULL UNIQUE,
      description   TEXT,
      -- capabilities: { "products.view": true, "products.edit": false, ... }
      capabilities  JSONB NOT NULL DEFAULT '{}',
      -- conditions: { "branch_id": "assigned", "amount_limit": 10000 }
      conditions    JSONB DEFAULT '{}',
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── WORKFORCE PROFILES ────────────────────────────────────────
    -- Extends users table for internal staff
    CREATE TABLE IF NOT EXISTS workforce_profiles (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      employee_id     VARCHAR(100) UNIQUE,
      branch_id       UUID REFERENCES branches(id),
      department_id   UUID REFERENCES departments(id),
      manager_id      UUID REFERENCES users(id),
      job_title       VARCHAR(200),
      employment_type VARCHAR(50) DEFAULT 'full_time',
      -- RBAC role
      role            VARCHAR(100) DEFAULT 'sales_staff',
      -- ABAC: assigned policy IDs
      policy_ids      UUID[] DEFAULT '{}',
      -- Direct capability overrides (per-person)
      capability_overrides JSONB DEFAULT '{}',
      join_date       DATE,
      is_active       BOOLEAN DEFAULT true,
      activation_token VARCHAR(255),
      activation_expires TIMESTAMPTZ,
      last_active     TIMESTAMPTZ,
      meta            JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── CUSTOMER ACCOUNTS ─────────────────────────────────────────
    -- Separate from workforce — customer-facing accounts
    CREATE TABLE IF NOT EXISTS customer_accounts (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
      email           VARCHAR(255) NOT NULL UNIQUE,
      password_hash   VARCHAR(255),
      first_name      VARCHAR(100),
      last_name       VARCHAR(100),
      phone           VARCHAR(50),
      country_code    VARCHAR(10) DEFAULT 'AE',
      is_active       BOOLEAN DEFAULT true,
      is_verified     BOOLEAN DEFAULT false,
      verify_token    VARCHAR(255),
      reset_token     VARCHAR(255),
      reset_expires   TIMESTAMPTZ,
      last_login      TIMESTAMPTZ,
      preferences     JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── CUSTOMER WISHLIST ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS customer_wishlists (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id      UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
      product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
      diamond_id      UUID,
      item_type       VARCHAR(50) DEFAULT 'product',
      notes           TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── PARTNER ACCOUNTS ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS partner_accounts (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name            VARCHAR(200) NOT NULL,
      type            VARCHAR(100) DEFAULT 'supplier',
      email           VARCHAR(255) UNIQUE,
      api_key         VARCHAR(255) UNIQUE,
      api_secret      VARCHAR(255),
      permissions     JSONB DEFAULT '{}',
      is_active       BOOLEAN DEFAULT true,
      expires_at      TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── WORKFORCE DEVICE SESSIONS ─────────────────────────────────
    CREATE TABLE IF NOT EXISTS workforce_sessions (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_name     VARCHAR(200),
      device_type     VARCHAR(50),
      ip_address      VARCHAR(50),
      user_agent      TEXT,
      token_hash      VARCHAR(255),
      is_active       BOOLEAN DEFAULT true,
      last_seen       TIMESTAMPTZ DEFAULT NOW(),
      expires_at      TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── INDEXES ───────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_workforce_user    ON workforce_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_workforce_branch  ON workforce_profiles(branch_id);
    CREATE INDEX IF NOT EXISTS idx_workforce_dept    ON workforce_profiles(department_id);
    CREATE INDEX IF NOT EXISTS idx_workforce_manager ON workforce_profiles(manager_id);
    CREATE INDEX IF NOT EXISTS idx_customer_email    ON customer_accounts(email);
    CREATE INDEX IF NOT EXISTS idx_wishlist_account  ON customer_wishlists(account_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user     ON workforce_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_policies_caps     ON permission_policies USING GIN(capabilities);

    -- ── SEED DEFAULT BRANCHES ─────────────────────────────────────
    INSERT INTO branches (name, code, city, country, is_main)
    VALUES ('Main Branch', 'HQ', 'Dubai', 'UAE', true)
    ON CONFLICT (code) DO NOTHING;

    -- ── SEED DEFAULT DEPARTMENTS ──────────────────────────────────
    INSERT INTO departments (name, code) VALUES
      ('Sales',       'SALES'),
      ('Inventory',   'INV'),
      ('Marketing',   'MKT'),
      ('CRM',         'CRM'),
      ('Accounting',  'ACC'),
      ('Management',  'MGT')
    ON CONFLICT (code) DO NOTHING;

    -- ── SEED DEFAULT PERMISSION POLICIES ─────────────────────────
    INSERT INTO permission_policies (name, description, capabilities) VALUES
      ('sales_full', 'Full sales access', '{
        "enquiries.view": true, "enquiries.manage": true,
        "appointments.view": true, "appointments.manage": true,
        "customers.view": true, "customers.edit": true,
        "products.view": true,
        "orders.view": true, "orders.create": true
      }'),
      ('inventory_full', 'Full inventory access', '{
        "products.view": true, "products.edit": true, "products.create": true,
        "diamonds.view": true, "diamonds.edit": true, "diamonds.create": true,
        "inventory.view": true, "inventory.manage": true,
        "suppliers.view": true
      }'),
      ('marketing_full', 'Full marketing access', '{
        "blog.view": true, "blog.manage": true,
        "marketing.view": true, "marketing.manage": true,
        "media.view": true, "media.manage": true,
        "builder.view": true, "builder.manage": true
      }'),
      ('viewer_only', 'Read-only access', '{
        "products.view": true, "orders.view": true,
        "enquiries.view": true, "customers.view": true,
        "dashboard.view": true
      }'),
      ('admin_full', 'Full admin access', '{
        "products.view": true, "products.edit": true, "products.create": true, "products.delete": true,
        "diamonds.view": true, "diamonds.edit": true, "diamonds.create": true, "diamonds.delete": true,
        "orders.view": true, "orders.manage": true,
        "enquiries.view": true, "enquiries.manage": true,
        "appointments.view": true, "appointments.manage": true,
        "customers.view": true, "customers.edit": true, "customers.delete": true,
        "inventory.view": true, "inventory.manage": true,
        "marketing.view": true, "marketing.manage": true,
        "blog.view": true, "blog.manage": true,
        "builder.view": true, "builder.manage": true,
        "settings.view": true, "settings.manage": true,
        "users.view": true, "users.manage": true,
        "reports.view": true,
        "dashboard.view": true
      }')
    ON CONFLICT (name) DO NOTHING;

  `);

  console.log('✅ Migration 016 — Workforce architecture');
  console.log('   Tables: branches, departments, permission_policies');
  console.log('   Tables: workforce_profiles, customer_accounts, customer_wishlists');
  console.log('   Tables: partner_accounts, workforce_sessions');
  console.log('   Seeded: 1 branch, 6 departments, 5 policies');

  await client.end();
}

up().catch(e => { console.error('❌', e.message); process.exit(1); });
