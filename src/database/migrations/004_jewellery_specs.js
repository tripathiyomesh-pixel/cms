/**
 * Migration 004 — Jewellery specs tables (PostgreSQL)
 * Run: node src/database/migrations/004_jewellery_specs.js
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

    -- ── JEWELLERY SPECS ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_jewellery_specs (
      id              SERIAL PRIMARY KEY,
      product_id      UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      metal_type      VARCHAR(20) NOT NULL DEFAULT 'gold'
                        CHECK (metal_type IN ('gold','silver','platinum','rose_gold','white_gold','yellow_gold','two_tone')),
      purity          VARCHAR(10) NOT NULL DEFAULT '18K'
                        CHECK (purity IN ('24K','22K','21K','18K','14K','10K','925','950','999')),
      gross_weight    NUMERIC(8,3),
      net_weight      NUMERIC(8,3),
      has_diamond     BOOLEAN DEFAULT FALSE,
      diamond_carat   NUMERIC(6,3),
      diamond_cut     VARCHAR(20) CHECK (diamond_cut IN ('Excellent','Very Good','Good','Fair','Poor')),
      diamond_color   VARCHAR(5)  CHECK (diamond_color IN ('D','E','F','G','H','I','J','K','L','M')),
      diamond_clarity VARCHAR(10) CHECK (diamond_clarity IN ('FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3')),
      diamond_shape   VARCHAR(20) CHECK (diamond_shape IN ('Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart')),
      has_gemstone    BOOLEAN DEFAULT FALSE,
      gemstone_type   VARCHAR(100),
      gemstone_carat  NUMERIC(6,3),
      gemstone_color  VARCHAR(50),
      making_charges  NUMERIC(8,2) DEFAULT 0,
      making_pct      NUMERIC(5,2) DEFAULT 0,
      use_live_rate   BOOLEAN DEFAULT FALSE,
      ring_size_min   NUMERIC(4,1),
      ring_size_max   NUMERIC(4,1),
      ring_sizes      JSONB DEFAULT '[]',
      occasion        TEXT[],
      gender          VARCHAR(10) DEFAULT 'women' CHECK (gender IN ('women','men','unisex','kids')),
      care_instructions TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── CERTIFICATIONS ───────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_certifications (
      id            SERIAL PRIMARY KEY,
      product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      cert_type     VARCHAR(20) NOT NULL
                      CHECK (cert_type IN ('IGI','GIA','SGL','HRD','AGS','BIS_Hallmark','Other')),
      cert_number   VARCHAR(100) NOT NULL,
      cert_lab      VARCHAR(100),
      cert_date     DATE,
      cert_file_url VARCHAR(500),
      is_primary    BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_cert_product ON product_certifications(product_id);

    -- ── PRODUCT IMAGES ───────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_images (
      id          SERIAL PRIMARY KEY,
      product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url         VARCHAR(500) NOT NULL,
      alt_text    VARCHAR(255),
      is_primary  BOOLEAN DEFAULT FALSE,
      sort_order  INT DEFAULT 0,
      image_type  VARCHAR(20) DEFAULT 'photo'
                    CHECK (image_type IN ('photo','360','video_thumb','lifestyle')),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_img_product ON product_images(product_id);

    -- ── METAL RATES ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS metal_rates (
      id            SERIAL PRIMARY KEY,
      metal         VARCHAR(20) NOT NULL CHECK (metal IN ('gold','silver','platinum')),
      purity        VARCHAR(10) NOT NULL,
      rate_per_gram NUMERIC(10,4) NOT NULL,
      rate_aed      NUMERIC(10,4),
      rate_inr      NUMERIC(10,4),
      rate_sar      NUMERIC(10,4),
      source        VARCHAR(50) DEFAULT 'manual',
      fetched_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_rate_metal ON metal_rates(metal, purity);
    CREATE INDEX IF NOT EXISTS idx_rate_time  ON metal_rates(fetched_at DESC);

    -- ── ENQUIRIES ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS enquiries (
      id              SERIAL PRIMARY KEY,
      license_id      UUID REFERENCES licenses(id),
      product_id      UUID REFERENCES products(id),
      enquiry_type    VARCHAR(20) DEFAULT 'product'
                        CHECK (enquiry_type IN ('product','general','appointment','bulk')),
      channel         VARCHAR(20) DEFAULT 'form'
                        CHECK (channel IN ('whatsapp','form','email','phone','chat')),
      customer_name   VARCHAR(150),
      customer_phone  VARCHAR(30),
      customer_email  VARCHAR(150),
      country_code    VARCHAR(10) DEFAULT 'AE',
      message         TEXT,
      product_sku     VARCHAR(100),
      product_name    VARCHAR(255),
      product_price   NUMERIC(12,4),
      status          VARCHAR(20) DEFAULT 'new'
                        CHECK (status IN ('new','contacted','converted','closed')),
      notes           TEXT,
      assigned_to     UUID,
      followed_up_at  TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_enq_status  ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enq_product ON enquiries(product_id);
    CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at DESC);

    -- ── WISHLISTS ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS wishlists (
      id            SERIAL PRIMARY KEY,
      license_id    UUID REFERENCES licenses(id),
      session_token VARCHAR(64),
      customer_email VARCHAR(150),
      product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      added_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_wish_session ON wishlists(session_token);

    -- ── TRUST BADGES ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS trust_badges (
      id          SERIAL PRIMARY KEY,
      license_id  UUID REFERENCES licenses(id),
      label       VARCHAR(100) NOT NULL,
      icon        VARCHAR(100),
      icon_url    VARCHAR(500),
      sort_order  INT DEFAULT 0,
      is_active   BOOLEAN DEFAULT TRUE
    );

    -- ── CONTENT PAGES ────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS content_pages (
      id          SERIAL PRIMARY KEY,
      license_id  UUID REFERENCES licenses(id),
      slug        VARCHAR(150) NOT NULL,
      page_type   VARCHAR(20) DEFAULT 'guide'
                    CHECK (page_type IN ('guide','about','policy','faq','custom')),
      status      VARCHAR(10) DEFAULT 'draft' CHECK (status IN ('draft','published')),
      sort_order  INT DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (slug, license_id)
    );

    CREATE TABLE IF NOT EXISTS content_page_translations (
      id         SERIAL PRIMARY KEY,
      page_id    INT NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
      lang_code  VARCHAR(10) NOT NULL DEFAULT 'en',
      title      VARCHAR(255) NOT NULL,
      content    TEXT,
      meta_title VARCHAR(255),
      meta_desc  TEXT,
      UNIQUE (page_id, lang_code)
    );

    -- ── STORE LOCATIONS ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS store_locations (
      id              SERIAL PRIMARY KEY,
      license_id      UUID REFERENCES licenses(id),
      name            VARCHAR(150) NOT NULL,
      address         TEXT NOT NULL,
      city            VARCHAR(100),
      country_code    VARCHAR(10) DEFAULT 'AE',
      phone           VARCHAR(30),
      whatsapp        VARCHAR(30),
      email           VARCHAR(150),
      google_maps_url VARCHAR(500),
      working_hours   VARCHAR(255),
      is_active       BOOLEAN DEFAULT TRUE,
      is_primary      BOOLEAN DEFAULT FALSE
    );

  `);

  console.log('✅ Migration 004 complete — jewellery tables created (PostgreSQL)');
  await client.end();
}

up().catch(e => { console.error('❌', e.message); process.exit(1); });
