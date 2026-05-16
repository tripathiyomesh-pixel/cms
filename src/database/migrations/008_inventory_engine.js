/**
 * Migration 008 — Inventory Engine Foundation
 * Transforms products table into unified inventory_entities
 * Adds: inventory_type, inventory_mode, specialized detail tables
 * Run: node src/database/migrations/008_inventory_engine.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected to PostgreSQL...');

  await client.query(`

    -- ── STEP 1: Add inventory_type + inventory_mode to products ──
    DO $$ BEGIN
      CREATE TYPE inventory_type_enum AS ENUM (
        'JEWELLERY',        -- finished jewellery (rings, necklaces, etc)
        'NATURAL_DIAMOND',  -- loose natural diamond
        'LAB_GROWN_DIAMOND',-- loose lab-grown diamond (CVD/HPHT)
        'GEMSTONE',         -- loose coloured stone (ruby, sapphire, etc)
        'PEARL',            -- loose pearl
        'MOUNTING',         -- gold/platinum setting without stone
        'CUSTOM_DESIGN',    -- made-to-order custom piece
        'PARCEL'            -- bulk lot of stones
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE inventory_mode_enum AS ENUM (
        'IN_HOUSE',     -- physically in stock
        'MEMO',         -- out on memo/approval
        'SUPPLIER',     -- vendor/supplier stock
        'MADE_TO_ORDER',-- manufactured on demand
        'VIRTUAL'       -- imported/API sourced
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS inventory_type inventory_type_enum DEFAULT 'JEWELLERY',
      ADD COLUMN IF NOT EXISTS inventory_mode inventory_mode_enum DEFAULT 'IN_HOUSE',
      ADD COLUMN IF NOT EXISTS inventory_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS brand VARCHAR(150),
      ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

    -- Update existing rows
    UPDATE products SET inventory_type = 'JEWELLERY' WHERE inventory_type IS NULL;

    CREATE INDEX IF NOT EXISTS idx_products_inventory_type ON products(inventory_type);
    CREATE INDEX IF NOT EXISTS idx_products_inventory_mode ON products(inventory_mode);

    -- ── STEP 2: DIAMOND DETAILS TABLE ────────────────────────────
    CREATE TABLE IF NOT EXISTS diamond_details (
      id                  SERIAL PRIMARY KEY,
      product_id          UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      -- Type
      diamond_type        VARCHAR(20) DEFAULT 'NATURAL' CHECK (diamond_type IN ('NATURAL','LAB_GROWN')),
      growth_type         VARCHAR(10) CHECK (growth_type IN ('CVD','HPHT')), -- lab only
      country_of_origin   VARCHAR(100),
      -- 4Cs
      shape               VARCHAR(30),  -- Round, Princess, Oval, etc.
      carat               NUMERIC(8,3),
      color               VARCHAR(5),   -- D-Z scale
      clarity             VARCHAR(6),   -- FL, IF, VVS1...I3
      cut                 VARCHAR(20),  -- Excellent, Very Good, Good, Fair, Poor
      -- Advanced grading
      polish              VARCHAR(20),  -- Excellent, Very Good, Good, Fair, Poor
      symmetry            VARCHAR(20),
      fluorescence        VARCHAR(20),  -- None, Faint, Medium, Strong, Very Strong
      fluorescence_color  VARCHAR(20),
      laser_inscription   VARCHAR(100),
      -- Measurements (mm)
      meas_length         NUMERIC(6,2),
      meas_width          NUMERIC(6,2),
      meas_depth          NUMERIC(6,2),
      table_percent       NUMERIC(5,2),
      depth_percent       NUMERIC(5,2),
      crown_angle         NUMERIC(5,2),
      pavilion_angle      NUMERIC(5,2),
      girdle              VARCHAR(50),
      culet               VARCHAR(20),
      -- Rapaport pricing
      rap_rate            NUMERIC(10,2), -- USD per carat (Rapaport list price)
      rap_discount_pct    NUMERIC(6,2),  -- % below/above rap (negative = below)
      -- Availability
      is_available        BOOLEAN DEFAULT TRUE,
      hold_until          TIMESTAMPTZ,   -- reserved for a customer
      hold_by_customer    VARCHAR(150),
      -- Certificate (links to product_certifications)
      primary_cert_no     VARCHAR(100),
      primary_cert_lab    VARCHAR(20),
      cert_url            VARCHAR(500),  -- direct cert URL (IGI/GIA website)
      -- Notes
      internal_notes      TEXT,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_diamond_shape     ON diamond_details(shape);
    CREATE INDEX IF NOT EXISTS idx_diamond_carat     ON diamond_details(carat);
    CREATE INDEX IF NOT EXISTS idx_diamond_color     ON diamond_details(color);
    CREATE INDEX IF NOT EXISTS idx_diamond_clarity   ON diamond_details(clarity);
    CREATE INDEX IF NOT EXISTS idx_diamond_type      ON diamond_details(diamond_type);
    CREATE INDEX IF NOT EXISTS idx_diamond_avail     ON diamond_details(is_available);

    -- ── STEP 3: GEMSTONE DETAILS TABLE ───────────────────────────
    CREATE TABLE IF NOT EXISTS gemstone_details (
      id                SERIAL PRIMARY KEY,
      product_id        UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      -- Identity
      gemstone_type     VARCHAR(50) NOT NULL, -- Ruby, Sapphire, Emerald, etc.
      species           VARCHAR(100),         -- Corundum, Beryl, etc.
      variety           VARCHAR(100),         -- e.g. "Padparadscha" for sapphire
      -- Origin & treatment
      country_of_origin VARCHAR(100),
      mine_of_origin    VARCHAR(100),
      treatment         VARCHAR(200),         -- Heat, No heat, Fracture filled, etc.
      is_treated        BOOLEAN DEFAULT FALSE,
      -- Physical
      shape             VARCHAR(50),
      carat             NUMERIC(8,3),
      dimensions_mm     VARCHAR(50),          -- e.g. "8.5 x 6.2 x 4.1"
      -- Quality
      transparency      VARCHAR(30),          -- Transparent, Translucent, Opaque
      color_description VARCHAR(200),
      color_hue         VARCHAR(50),
      saturation        VARCHAR(30),          -- Faint, Light, Medium, Vivid, etc.
      tone              VARCHAR(30),          -- Very Light to Very Dark
      luster            VARCHAR(50),
      -- Certification (GRS, SSEF, GIA, Gübelin, Lotus)
      cert_lab          VARCHAR(50),
      cert_number       VARCHAR(100),
      cert_url          VARCHAR(500),
      -- Notes
      internal_notes    TEXT,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_gemstone_type   ON gemstone_details(gemstone_type);
    CREATE INDEX IF NOT EXISTS idx_gemstone_origin ON gemstone_details(country_of_origin);

    -- ── STEP 4: PEARL DETAILS TABLE ──────────────────────────────
    CREATE TABLE IF NOT EXISTS pearl_details (
      id              SERIAL PRIMARY KEY,
      product_id      UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      pearl_type      VARCHAR(30) NOT NULL, -- Akoya, South Sea, Tahitian, Freshwater
      pearl_color     VARCHAR(50),
      overtone        VARCHAR(50),          -- Rose, Silver, Cream, Gold, etc.
      shape           VARCHAR(30),          -- Round, Near-round, Drop, Baroque
      size_mm_min     NUMERIC(5,2),
      size_mm_max     NUMERIC(5,2),
      nacre_quality   VARCHAR(30),          -- Excellent, Good, Fair, Poor
      luster          VARCHAR(30),
      surface         VARCHAR(30),          -- Clean, Lightly spotted, Moderately, etc.
      matching_grade  VARCHAR(10),          -- AAA, AA+, AA, A (for strands)
      is_strand       BOOLEAN DEFAULT FALSE,
      strand_length   VARCHAR(30),          -- e.g. "18 inches"
      num_pearls      INT,
      cert_lab        VARCHAR(50),
      cert_number     VARCHAR(100),
      internal_notes  TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 5: MOUNTING DETAILS TABLE ───────────────────────────
    CREATE TABLE IF NOT EXISTS mounting_details (
      id                    SERIAL PRIMARY KEY,
      product_id            UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      -- Structure
      mounting_type         VARCHAR(50),   -- Solitaire, Halo, Pave, Bezel, etc.
      style                 VARCHAR(50),   -- Classic, Vintage, Modern, etc.
      category              VARCHAR(50),   -- Ring, Pendant, Earring, Bracelet
      gender                VARCHAR(20),   -- Women, Men, Unisex
      shank_style           VARCHAR(50),   -- Plain, Knife edge, Twisted, etc.
      head_type             VARCHAR(50),   -- 4-prong, 6-prong, Bezel, Tension
      prong_type            VARCHAR(50),
      -- Stone compatibility
      compatible_shapes     JSONB DEFAULT '[]', -- ["Round","Oval","Cushion"]
      min_carat             NUMERIC(6,3),
      max_carat             NUMERIC(6,3),
      min_stone_size        NUMERIC(5,2),  -- mm
      max_stone_size        NUMERIC(5,2),
      -- Metal options
      metal_options         JSONB DEFAULT '[]', -- [{"metal":"18K Yellow Gold","price_add":0},...]
      casting_weight        NUMERIC(8,3),   -- grams
      -- Sizing
      ring_sizes_available  JSONB DEFAULT '[]',
      -- Manufacturing
      cad_file_url          VARCHAR(500),
      production_days       INT DEFAULT 7,
      -- Pricing
      base_labor_price      NUMERIC(10,2),
      customization_fee     NUMERIC(10,2),
      internal_notes        TEXT,
      created_at            TIMESTAMPTZ DEFAULT NOW(),
      updated_at            TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 6: JEWELLERY COMPONENTS (BOM) ───────────────────────
    CREATE TABLE IF NOT EXISTS jewellery_components (
      id              SERIAL PRIMARY KEY,
      jewellery_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      component_type  VARCHAR(30) NOT NULL CHECK (component_type IN ('diamond','gemstone','pearl','mounting','metal','other')),
      component_id    UUID REFERENCES products(id), -- links to loose stone if in inventory
      description     VARCHAR(200),                 -- e.g. "Centre diamond 1.2ct Round"
      quantity        INT DEFAULT 1,
      carat           NUMERIC(8,3),
      weight_grams    NUMERIC(8,3),
      cert_number     VARCHAR(100),
      unit_cost       NUMERIC(12,2),
      sort_order      INT DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_jewel_comp_id ON jewellery_components(jewellery_id);

    -- ── STEP 7: SUPPLIERS TABLE ───────────────────────────────────
    CREATE TABLE IF NOT EXISTS suppliers (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name            VARCHAR(200) NOT NULL,
      code            VARCHAR(50) UNIQUE,
      contact_name    VARCHAR(150),
      email           VARCHAR(200),
      phone           VARCHAR(50),
      whatsapp        VARCHAR(50),
      country         VARCHAR(100),
      city            VARCHAR(100),
      address         TEXT,
      payment_terms   VARCHAR(100),
      currency        VARCHAR(10) DEFAULT 'USD',
      discount_pct    NUMERIC(5,2) DEFAULT 0,
      notes           TEXT,
      is_active       BOOLEAN DEFAULT TRUE,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 8: MEMO TRACKING ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS memos (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      memo_number     VARCHAR(50) UNIQUE NOT NULL,
      supplier_id     UUID REFERENCES suppliers(id),
      customer_name   VARCHAR(200),
      customer_phone  VARCHAR(50),
      customer_email  VARCHAR(200),
      issued_date     DATE NOT NULL DEFAULT CURRENT_DATE,
      due_date        DATE,
      status          VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN','RETURNED','SOLD','OVERDUE')),
      total_value     NUMERIC(15,2),
      currency        VARCHAR(10) DEFAULT 'USD',
      notes           TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS memo_items (
      id          SERIAL PRIMARY KEY,
      memo_id     UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
      product_id  UUID REFERENCES products(id),
      description VARCHAR(200),
      carat       NUMERIC(8,3),
      cert_number VARCHAR(100),
      value       NUMERIC(12,2),
      returned    BOOLEAN DEFAULT FALSE,
      returned_at TIMESTAMPTZ,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 9: CUSTOM ORDERS (Manufacturing flow) ────────────────
    CREATE TABLE IF NOT EXISTS custom_orders (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number    VARCHAR(50) UNIQUE NOT NULL,
      customer_name   VARCHAR(200) NOT NULL,
      customer_phone  VARCHAR(50) NOT NULL,
      customer_email  VARCHAR(200),
      -- Product info
      description     TEXT,                -- what they want
      inspiration_urls JSONB DEFAULT '[]', -- uploaded reference images
      metal_preference  VARCHAR(100),
      stone_preference  VARCHAR(200),
      budget_min      NUMERIC(12,2),
      budget_max      NUMERIC(12,2),
      currency        VARCHAR(10) DEFAULT 'AED',
      -- Workflow status
      status          VARCHAR(30) DEFAULT 'INQUIRY' CHECK (status IN (
        'INQUIRY','DESIGNING','APPROVAL_PENDING','APPROVED',
        'MANUFACTURING','STONE_SETTING','POLISHING','QC','READY','SHIPPED','CANCELLED'
      )),
      -- Quotation
      quoted_amount   NUMERIC(12,2),
      quoted_at       TIMESTAMPTZ,
      approved_at     TIMESTAMPTZ,
      -- Delivery
      estimated_days  INT,
      delivered_at    TIMESTAMPTZ,
      -- Assignment
      assigned_to     UUID,               -- users.id (craftsman/manager)
      notes           TEXT,
      internal_notes  TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_order_cad (
      id              SERIAL PRIMARY KEY,
      custom_order_id UUID NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
      version         INT DEFAULT 1,
      cad_file_url    VARCHAR(500),
      preview_url     VARCHAR(500),
      notes           TEXT,
      status          VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
      customer_feedback TEXT,
      uploaded_at     TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 10: IMPORT JOBS ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS import_jobs (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      import_type     VARCHAR(50) NOT NULL, -- 'rapnet','supplier_csv','manual'
      supplier_id     UUID REFERENCES suppliers(id),
      filename        VARCHAR(300),
      file_url        VARCHAR(500),
      status          VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','DONE','FAILED')),
      total_rows      INT DEFAULT 0,
      imported        INT DEFAULT 0,
      skipped         INT DEFAULT 0,
      errors          INT DEFAULT 0,
      error_log       JSONB DEFAULT '[]',
      created_by      UUID,
      started_at      TIMESTAMPTZ,
      completed_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── STEP 11: FEATURE FLAGS (module on/off per client) ─────────
    CREATE TABLE IF NOT EXISTS feature_flags (
      id          SERIAL PRIMARY KEY,
      flag_key    VARCHAR(100) NOT NULL UNIQUE,
      label       VARCHAR(200),
      is_enabled  BOOLEAN DEFAULT FALSE,
      module      VARCHAR(50),  -- which module this belongs to
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- Seed default feature flags
    INSERT INTO feature_flags (flag_key, label, module, is_enabled) VALUES
      ('module_jewellery',        'Finished Jewellery',         'inventory',      true),
      ('module_loose_diamonds',   'Loose Diamonds',             'inventory',      false),
      ('module_lab_grown',        'Lab-Grown Diamonds',         'inventory',      false),
      ('module_gemstones',        'Coloured Gemstones',         'inventory',      false),
      ('module_pearls',           'Pearls',                     'inventory',      false),
      ('module_mountings',        'Mountings Catalogue',        'inventory',      false),
      ('module_custom_orders',    'Custom Jewellery Orders',    'manufacturing',  false),
      ('module_manufacturing',    'Workshop & Manufacturing',   'manufacturing',  false),
      ('module_supplier',         'Supplier Management',        'operations',     false),
      ('module_memo',             'Memo Tracking',              'operations',     false),
      ('module_import',           'Bulk Import Engine',         'operations',     false),
      ('module_rapaport',         'Rapaport Pricing',           'pricing',        false),
      ('module_appointments',     'Boutique Appointments',      'crm',            true),
      ('module_whatsapp',         'WhatsApp Enquiry',           'crm',            true),
      ('module_certificate',      'Certificate Verification',   'trust',          true),
      ('module_blog',             'Blog & Education',           'cms',            false),
      ('module_cart_checkout',    'Cart & Checkout',            'commerce',       false),
      ('module_customer_portal',  'Customer Portal',            'commerce',       false),
      ('module_b2b',              'B2B Wholesale',              'commerce',       false)
    ON CONFLICT (flag_key) DO NOTHING;

  `);

  console.log('✅ Migration 008 complete — Inventory Engine foundation');
  console.log('   Tables created: diamond_details, gemstone_details, pearl_details,');
  console.log('   mounting_details, jewellery_components, suppliers, memos,');
  console.log('   custom_orders, custom_order_cad, import_jobs, feature_flags');
  console.log('   Columns added: inventory_type, inventory_mode, brand, barcode');
  await client.end();
}

up().catch(e => { console.error('❌', e.message); process.exit(1); });
