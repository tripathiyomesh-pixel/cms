/**
 * VANTIX-CMS Migration Runner
 * 
 * Runs all schema migrations in a single pg connection.
 * Env vars come from Docker environment (already set), no dotenv needed.
 * Safe to re-run — every statement uses IF NOT EXISTS / ON CONFLICT.
 */
'use strict';
const { Client } = require('pg');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');

const client = new Client({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jewellery_cms',
  user:     process.env.DB_USER     || 'cmsuser',
  password: process.env.DB_PASS     || 'CmsPass@2026',
  ssl:      false,
});

async function run() {
  await client.connect();
  console.log('🔗 Connected to PostgreSQL');

  // ── Helper ─────────────────────────────────────────────────────────────────
  const q = (sql, params) => client.query(sql, params);
  const addCol = (table, col, def) =>
    q(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${def}`).catch(() => {});
  const createIdx = (name, table, col) =>
    q(`CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${col})`).catch(() => {});

  // ── CORE TABLES ────────────────────────────────────────────────────────────
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(150) NOT NULL,
      email       VARCHAR(200) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(30)  NOT NULL DEFAULT 'editor',
      permissions JSONB        DEFAULT '{}',
      is_active   BOOLEAN      DEFAULT TRUE,
      last_login  TIMESTAMP,
      created_at  TIMESTAMP    DEFAULT NOW(),
      updated_at  TIMESTAMP    DEFAULT NOW(),
      deleted_at  TIMESTAMP
    )
  `); console.log('✓ users');

  await q(`
    CREATE TABLE IF NOT EXISTS categories (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(150) NOT NULL,
      slug        VARCHAR(200) NOT NULL UNIQUE,
      description TEXT,
      parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
      image_url   TEXT,
      sort_order  INTEGER     DEFAULT 0,
      is_active   BOOLEAN     DEFAULT TRUE,
      seo_title   VARCHAR(200),
      seo_desc    TEXT,
      created_at  TIMESTAMP   DEFAULT NOW(),
      updated_at  TIMESTAMP   DEFAULT NOW(),
      deleted_at  TIMESTAMP
    )
  `); console.log('✓ categories');

  await q(`
    CREATE TABLE IF NOT EXISTS collections (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(200) NOT NULL,
      slug          VARCHAR(250) NOT NULL UNIQUE,
      description   TEXT,
      banner_url    TEXT,
      thumbnail_url TEXT,
      image_url     TEXT,
      is_featured   BOOLEAN DEFAULT FALSE,
      is_active     BOOLEAN DEFAULT TRUE,
      sort_order    INTEGER DEFAULT 0,
      seo_title     VARCHAR(200),
      seo_desc      TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW(),
      deleted_at    TIMESTAMP
    )
  `); console.log('✓ collections');

  await q(`
    CREATE TABLE IF NOT EXISTS products (
      id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name                 VARCHAR(300) NOT NULL,
      sku                  VARCHAR(100) NOT NULL UNIQUE,
      slug                 VARCHAR(350) NOT NULL UNIQUE,
      description          TEXT,
      short_description    VARCHAR(500),
      category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
      collection_id        UUID REFERENCES collections(id) ON DELETE SET NULL,
      metal_type           VARCHAR(30),
      purity               VARCHAR(20),
      gross_weight         DECIMAL(10,3) DEFAULT 0,
      net_weight           DECIMAL(10,3),
      gemstone_details     JSONB DEFAULT '[]',
      certifications       JSONB DEFAULT '[]',
      base_price           DECIMAL(15,2) DEFAULT 0,
      making_charges       DECIMAL(15,2) DEFAULT 0,
      making_charge_pct    DECIMAL(5,2)  DEFAULT 0,
      discount             DECIMAL(15,2) DEFAULT 0,
      discount_pct         DECIMAL(5,2)  DEFAULT 0,
      discount_percent     DECIMAL(5,2)  DEFAULT 0,
      final_price          DECIMAL(15,2) DEFAULT 0,
      country_pricing      JSONB DEFAULT '{}',
      currency             VARCHAR(10)   DEFAULT 'AED',
      tax_class            VARCHAR(20)   DEFAULT 'standard',
      stock_quantity       INTEGER       DEFAULT 0,
      low_stock_alert      INTEGER       DEFAULT 5,
      is_made_to_order     BOOLEAN       DEFAULT FALSE,
      tags                 JSONB DEFAULT '[]',
      status               VARCHAR(20)   DEFAULT 'draft',
      is_featured          BOOLEAN       DEFAULT FALSE,
      is_new_arrival       BOOLEAN       DEFAULT FALSE,
      is_best_seller       BOOLEAN       DEFAULT FALSE,
      is_lab_grown         BOOLEAN       DEFAULT FALSE,
      embossing_available  BOOLEAN       DEFAULT FALSE,
      engraving_available  BOOLEAN       DEFAULT FALSE,
      video_url            TEXT,
      seo_title            VARCHAR(200),
      seo_description      TEXT,
      seo_slug             VARCHAR(255),
      sort_order           INTEGER       DEFAULT 0,
      product_type         VARCHAR(50),
      inventory_type       VARCHAR(30)   DEFAULT 'jewellery',
      is_active            BOOLEAN       DEFAULT TRUE,
      created_by           UUID,
      updated_by           UUID,
      created_at           TIMESTAMP     DEFAULT NOW(),
      updated_at           TIMESTAMP     DEFAULT NOW(),
      deleted_at           TIMESTAMP
    )
  `); console.log('✓ products');

  await q(`
    CREATE TABLE IF NOT EXISTS media (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
      entity_id     UUID,
      entity_type   VARCHAR(50),
      file_url      TEXT NOT NULL,
      thumb_url     TEXT,
      cloudinary_id VARCHAR(300),
      file_type     VARCHAR(30) DEFAULT 'image',
      media_type    VARCHAR(30) DEFAULT 'image',
      file_size     INTEGER,
      width         INTEGER,
      height        INTEGER,
      alt_text      VARCHAR(300),
      is_primary    BOOLEAN DEFAULT FALSE,
      sort_order    INTEGER DEFAULT 0,
      created_at    TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ media');

  await q(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_name       VARCHAR(200) DEFAULT 'TEJORI',
      tagline          VARCHAR(500),
      logo_url         TEXT,
      favicon_url      TEXT,
      primary_color    VARCHAR(10)  DEFAULT '#b8860b',
      secondary_color  VARCHAR(10)  DEFAULT '#1a1a1a',
      font_display     VARCHAR(100) DEFAULT 'Cormorant Garamond',
      font_body        VARCHAR(100) DEFAULT 'Inter',
      default_currency VARCHAR(10)  DEFAULT 'AED',
      default_country  VARCHAR(5)   DEFAULT 'AE',
      default_lang     VARCHAR(5)   DEFAULT 'en',
      whatsapp         VARCHAR(30),
      social_links     JSONB DEFAULT '{}',
      seo_title        VARCHAR(200),
      seo_description  TEXT,
      theme_config     JSONB DEFAULT '{}',
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ store_settings');

  await q(`
    CREATE TABLE IF NOT EXISTS settings (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key        VARCHAR(200) NOT NULL UNIQUE,
      value      JSONB,
      group_name VARCHAR(100) DEFAULT 'general',
      label      VARCHAR(200),
      type       VARCHAR(30)  DEFAULT 'text',
      options    JSONB,
      is_public  BOOLEAN      DEFAULT FALSE,
      created_at TIMESTAMP    DEFAULT NOW(),
      updated_at TIMESTAMP    DEFAULT NOW()
    )
  `); console.log('✓ settings');

  await q(`
    CREATE TABLE IF NOT EXISTS menus (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       VARCHAR(100) NOT NULL,
      slug       VARCHAR(100) NOT NULL UNIQUE,
      location   VARCHAR(30)  DEFAULT 'header',
      items      JSONB        NOT NULL DEFAULT '[]',
      is_active  BOOLEAN      DEFAULT TRUE,
      created_at TIMESTAMP    DEFAULT NOW(),
      updated_at TIMESTAMP    DEFAULT NOW()
    )
  `); console.log('✓ menus');

  await q(`
    CREATE TABLE IF NOT EXISTS store_locations (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(200) NOT NULL,
      area        VARCHAR(200),
      address     TEXT,
      city        VARCHAR(100) DEFAULT 'Dubai',
      country     VARCHAR(100) DEFAULT 'UAE',
      phone       VARCHAR(30),
      whatsapp    VARCHAR(30),
      email       VARCHAR(200),
      hours       TEXT,
      latitude    DECIMAL(10,8),
      longitude   DECIMAL(11,8),
      image_url   TEXT,
      is_primary  BOOLEAN DEFAULT FALSE,
      is_active   BOOLEAN DEFAULT TRUE,
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ store_locations');

  await q(`
    CREATE TABLE IF NOT EXISTS appointment_slots (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      location_id  UUID REFERENCES store_locations(id) ON DELETE CASCADE,
      day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time   VARCHAR(5)  NOT NULL,
      end_time     VARCHAR(5),
      max_bookings INTEGER DEFAULT 2,
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMP DEFAULT NOW(),
      UNIQUE(location_id, day_of_week, start_time)
    )
  `); console.log('✓ appointment_slots');

  await q(`
    CREATE TABLE IF NOT EXISTS appointments (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_code   VARCHAR(20) UNIQUE,
      location_id      UUID REFERENCES store_locations(id),
      slot_id          UUID REFERENCES appointment_slots(id),
      customer_name    VARCHAR(200) NOT NULL,
      customer_phone   VARCHAR(30)  NOT NULL,
      customer_email   VARCHAR(200),
      preferred_date   DATE NOT NULL,
      preferred_time   VARCHAR(5),
      purpose          VARCHAR(100),
      party_size       VARCHAR(5) DEFAULT '1',
      notes            TEXT,
      status           VARCHAR(20) DEFAULT 'pending',
      confirmed_at     TIMESTAMP,
      cancelled_at     TIMESTAMP,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ appointments');

  await q(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
      customer_name   VARCHAR(200),
      customer_phone  VARCHAR(30),
      customer_email  VARCHAR(200),
      country_code    VARCHAR(5) DEFAULT '+971',
      message         TEXT,
      source          VARCHAR(30) DEFAULT 'website',
      status          VARCHAR(20) DEFAULT 'new',
      assigned_to     UUID,
      notes           TEXT,
      created_at      TIMESTAMP DEFAULT NOW(),
      updated_at      TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ enquiries');

  await q(`
    CREATE TABLE IF NOT EXISTS product_jewellery_specs (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id       UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      metal_color      VARCHAR(50),
      metal_purity     VARCHAR(20),
      gross_weight     DECIMAL(10,3),
      net_weight       DECIMAL(10,3),
      diamond_pieces   INTEGER DEFAULT 0,
      diamond_shape    VARCHAR(50),
      diamond_cut      VARCHAR(50),
      diamond_color    VARCHAR(10),
      diamond_clarity  VARCHAR(10),
      diamond_carat    DECIMAL(8,3),
      gemstone_type    VARCHAR(100),
      gemstone_carat   DECIMAL(8,3),
      gemstone_color   VARCHAR(50),
      gemstone_origin  VARCHAR(100),
      cert_type        VARCHAR(20),
      cert_number      VARCHAR(100),
      cert_pdf_url     TEXT,
      making_charges   DECIMAL(15,2) DEFAULT 0,
      stone_value      DECIMAL(15,2) DEFAULT 0,
      notes            TEXT,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ product_jewellery_specs');

  await q(`
    CREATE TABLE IF NOT EXISTS product_certifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      cert_type   VARCHAR(20) NOT NULL,
      cert_number VARCHAR(100),
      issued_by   VARCHAR(100),
      issued_date DATE,
      file_url    TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ product_certifications');

  await q(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name         VARCHAR(200) NOT NULL,
      sku          VARCHAR(100) UNIQUE,
      attributes   JSONB DEFAULT '{}',
      price_delta  DECIMAL(15,2) DEFAULT 0,
      stock        INTEGER DEFAULT 0,
      weight       DECIMAL(10,3),
      image_url    TEXT,
      is_active    BOOLEAN DEFAULT TRUE,
      sort_order   INTEGER DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ product_variants');

  await q(`
    CREATE TABLE IF NOT EXISTS metal_rates (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metal_type    VARCHAR(30) NOT NULL,
      purity        VARCHAR(20),
      rate_per_gram DECIMAL(15,4) NOT NULL,
      currency      VARCHAR(3) DEFAULT 'AED',
      country       VARCHAR(50) DEFAULT 'UAE',
      source        VARCHAR(50) DEFAULT 'manual',
      is_active     BOOLEAN DEFAULT TRUE,
      effective_at  TIMESTAMP DEFAULT NOW(),
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ metal_rates');

  await q(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID,
      user_email  VARCHAR(200),
      action      VARCHAR(100) NOT NULL,
      resource    VARCHAR(100) NOT NULL,
      resource_id VARCHAR(100),
      old_data    JSONB,
      new_data    JSONB,
      ip_address  VARCHAR(50),
      user_agent  TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ audit_logs');

  await q(`
    CREATE TABLE IF NOT EXISTS page_sections (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page         VARCHAR(100) NOT NULL DEFAULT 'homepage',
      section_key  VARCHAR(100) NOT NULL,
      section_type VARCHAR(100) NOT NULL,
      content      JSONB DEFAULT '{}',
      is_visible   BOOLEAN DEFAULT TRUE,
      sort_order   INTEGER DEFAULT 0,
      country_code VARCHAR(5),
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ page_sections');

  await q(`
    CREATE TABLE IF NOT EXISTS plugins (
      id             VARCHAR(50) PRIMARY KEY,
      name           VARCHAR(100) NOT NULL,
      description    TEXT,
      icon           VARCHAR(50),
      color          VARCHAR(20),
      version        VARCHAR(20) DEFAULT '1.0.0',
      category       VARCHAR(50),
      author         VARCHAR(100) DEFAULT 'VANTIX',
      is_premium     BOOLEAN DEFAULT FALSE,
      config_schema  JSONB DEFAULT '{}',
      product_fields JSONB DEFAULT '[]',
      created_at     TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ plugins');

  await q(`
    CREATE TABLE IF NOT EXISTS installed_plugins (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plugin_id    VARCHAR(50) NOT NULL REFERENCES plugins(id),
      is_active    BOOLEAN DEFAULT TRUE,
      settings     JSONB DEFAULT '{}',
      installed_at TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ installed_plugins');

  await q(`
    CREATE TABLE IF NOT EXISTS product_extensions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      plugin_id  VARCHAR(50) NOT NULL REFERENCES plugins(id),
      data       JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(product_id, plugin_id)
    )
  `); console.log('✓ product_extensions');

  await q(`
    CREATE TABLE IF NOT EXISTS themes (
      id               VARCHAR(50) PRIMARY KEY,
      name             VARCHAR(100) NOT NULL,
      description      TEXT,
      preview_url      TEXT,
      category         VARCHAR(30) DEFAULT 'minimal',
      is_premium       BOOLEAN DEFAULT FALSE,
      is_active        BOOLEAN DEFAULT FALSE,
      default_settings JSONB DEFAULT '{}',
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ themes');

  await q(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url            TEXT NOT NULL,
      events         JSONB NOT NULL DEFAULT '[]',
      secret         VARCHAR(255),
      is_active      BOOLEAN DEFAULT TRUE,
      last_triggered TIMESTAMP,
      last_status    INTEGER,
      fail_count     INTEGER DEFAULT 0,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ webhooks');

  await q(`
    CREATE TABLE IF NOT EXISTS password_resets (
      user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      token      VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ password_resets');

  await q(`
    CREATE TABLE IF NOT EXISTS exhibitions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title             VARCHAR(255) NOT NULL,
      slug              VARCHAR(300) NOT NULL UNIQUE,
      subtitle          VARCHAR(300),
      description       TEXT,
      hero_image        TEXT,
      gallery_images    JSONB DEFAULT '[]',
      venue_name        VARCHAR(200),
      venue_city        VARCHAR(100),
      venue_address     TEXT,
      venue_map_url     TEXT,
      booth_number      VARCHAR(50),
      start_date        DATE NOT NULL,
      end_date          DATE NOT NULL,
      start_time        VARCHAR(10) DEFAULT '10:00',
      end_time          VARCHAR(10) DEFAULT '20:00',
      registration_open BOOLEAN DEFAULT TRUE,
      max_registrations INTEGER,
      reg_close_date    DATE,
      is_vip            BOOLEAN DEFAULT FALSE,
      is_published      BOOLEAN DEFAULT FALSE,
      is_active         BOOLEAN DEFAULT TRUE,
      featured_products JSONB DEFAULT '[]',
      created_at        TIMESTAMP DEFAULT NOW(),
      updated_at        TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ exhibitions');

  await q(`
    CREATE TABLE IF NOT EXISTS exhibition_registrations (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      full_name   VARCHAR(200) NOT NULL,
      email       VARCHAR(200),
      phone       VARCHAR(30) NOT NULL,
      company     VARCHAR(200),
      visit_date  DATE,
      visit_time  VARCHAR(10),
      party_size  VARCHAR(5) DEFAULT '1',
      notes       TEXT,
      status      VARCHAR(20) DEFAULT 'confirmed',
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ exhibition_registrations');

  await q(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email          VARCHAR(255) UNIQUE NOT NULL,
      name           VARCHAR(100),
      is_active      BOOLEAN DEFAULT TRUE,
      source         VARCHAR(50) DEFAULT 'website',
      subscribed_at  TIMESTAMP DEFAULT NOW(),
      unsubscribed_at TIMESTAMP
    )
  `); console.log('✓ newsletter_subscribers');

  await q(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name     VARCHAR(100) NOT NULL,
      customer_location VARCHAR(100),
      review            TEXT NOT NULL,
      rating            INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
      image_url         TEXT,
      is_featured       BOOLEAN DEFAULT FALSE,
      is_active         BOOLEAN DEFAULT TRUE,
      created_at        TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ testimonials');

  await q(`
    CREATE TABLE IF NOT EXISTS banners (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title        VARCHAR(200),
      subtitle     VARCHAR(300),
      image_url    TEXT NOT NULL,
      mobile_url   TEXT,
      link_url     TEXT,
      link_text    VARCHAR(100),
      cta_text     VARCHAR(100),
      cta_link     TEXT,
      position     VARCHAR(30) DEFAULT 'hero',
      country_code VARCHAR(5),
      is_active    BOOLEAN DEFAULT TRUE,
      starts_at    TIMESTAMP,
      ends_at      TIMESTAMP,
      sort_order   INTEGER DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ banners');

  await q(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title         VARCHAR(255) NOT NULL,
      slug          VARCHAR(300) UNIQUE NOT NULL,
      excerpt       TEXT,
      content       TEXT,
      image_url     TEXT,
      author        VARCHAR(100) DEFAULT 'TEJORI',
      tags          JSONB DEFAULT '[]',
      is_published  BOOLEAN DEFAULT FALSE,
      published_at  TIMESTAMP,
      seo_title     VARCHAR(200),
      seo_description TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ blog_posts');

  await q(`
    CREATE TABLE IF NOT EXISTS inventory_ledger (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id  UUID NOT NULL REFERENCES products(id),
      type        VARCHAR(20),
      quantity    INTEGER NOT NULL,
      balance     INTEGER NOT NULL,
      reference   VARCHAR(200),
      notes       TEXT,
      created_by  UUID,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ inventory_ledger');

  await q(`
    CREATE TABLE IF NOT EXISTS customers (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name           VARCHAR(200) NOT NULL,
      email          VARCHAR(200) UNIQUE,
      phone          VARCHAR(30),
      country_code   VARCHAR(5) DEFAULT '+971',
      nationality    VARCHAR(100),
      city           VARCHAR(100),
      notes          TEXT,
      total_enquiries INTEGER DEFAULT 0,
      total_spent    DECIMAL(15,2) DEFAULT 0,
      is_vip         BOOLEAN DEFAULT FALSE,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ customers');

  await q(`
    CREATE TABLE IF NOT EXISTS orders (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number  VARCHAR(50) UNIQUE,
      customer_name VARCHAR(200),
      customer_email VARCHAR(200),
      customer_phone VARCHAR(30),
      items         JSONB DEFAULT '[]',
      subtotal      DECIMAL(15,2),
      tax_amount    DECIMAL(15,2) DEFAULT 0,
      total_amount  DECIMAL(15,2),
      currency      VARCHAR(10) DEFAULT 'AED',
      status        VARCHAR(30) DEFAULT 'pending',
      notes         TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    )
  `); console.log('✓ orders');

  // ── INDEXES ───────────────────────────────────────────────────────────────
  await createIdx('idx_products_slug',        'products',    '"slug"');
  await createIdx('idx_products_sku',         'products',    '"sku"');
  await createIdx('idx_products_status',      'products',    '"status"');
  await createIdx('idx_products_category',    'products',    '"category_id"');
  await createIdx('idx_products_featured',    'products',    '"is_featured" WHERE is_featured = TRUE');
  await createIdx('idx_products_new_arrival', 'products',    '"is_new_arrival" WHERE is_new_arrival = TRUE');
  await createIdx('idx_categories_slug',      'categories',  '"slug"');
  await createIdx('idx_categories_parent',    'categories',  '"parent_id"');
  await createIdx('idx_collections_slug',     'collections', '"slug"');
  await createIdx('idx_media_product',        'media',       '"product_id"');
  await createIdx('idx_blog_slug',            'blog_posts',  '"slug"');
  await createIdx('idx_exhibitions_slug',     'exhibitions', '"slug"');
  await createIdx('idx_enquiries_product',    'enquiries',   '"product_id"');
  await createIdx('idx_settings_key',         'settings',    '"key"');
  console.log('✓ indexes');

  // ── SEED: Admin user ──────────────────────────────────────────────────────
  const { rows: existing } = await client.query(
    `SELECT id FROM users WHERE email = 'admin@vantix.io' LIMIT 1`
  );
  if (existing.length === 0) {
    const hash = await bcrypt.hash('Admin@2026', 12);
    await client.query(`
      INSERT INTO users (name, email, password, role, is_active)
      VALUES ('Admin', 'admin@vantix.io', $1, 'super_admin', true)
    `, [hash]);
    console.log('✓ Admin user created: admin@vantix.io / Admin@2026');
  } else {
    const hash = await bcrypt.hash('Admin@2026', 12);
    await client.query(
      `UPDATE users SET password=$1, role='super_admin', is_active=true WHERE email='admin@vantix.io'`,
      [hash]
    );
    console.log('✓ Admin user password reset: admin@vantix.io / Admin@2026');
  }

  // ── SEED: Store settings ──────────────────────────────────────────────────
  await q(`
    INSERT INTO store_settings (store_name, tagline, primary_color, default_currency, whatsapp)
    VALUES ('TEJORI', 'Timeless Craftsmanship', '#b8860b', 'AED', '971500000000')
    ON CONFLICT DO NOTHING
  `).catch(() => {});
  console.log('✓ Store settings seeded');

  // ── SEED: Essential settings ──────────────────────────────────────────────
  const defaults = [
    ['maintenance_enabled',  false,           'system',     false],
    ['storefront_theme',     'cartier-noir',  'storefront', true],
    ['store_name',           'TEJORI',        'brand',      true],
    ['whatsapp_number',      '971500000000',  'brand',      true],
    ['primary_color',        '#b8860b',       'brand',      true],
    ['currency',             'AED',           'storefront', true],
  ];
  for (const [key, value, group, pub] of defaults) {
    await q(`
      INSERT INTO settings (key, value, group_name, type, is_public)
      VALUES ($1, $2::jsonb, $3, 'text', $4)
      ON CONFLICT (key) DO NOTHING
    `, [key, JSON.stringify(value), group, pub]).catch(() => {});
  }
  console.log('✓ Default settings seeded');

  // ── SEED: Tejori store locations ──────────────────────────────────────────
  const locations = [
    ['Dubai Mall', 'Downtown Dubai', 'Lower Ground Floor, Dubai Mall, Downtown Dubai', 'Daily 10am–10pm', 25.1972, 55.2796, true],
    ['Madinat Jumeirah', 'Souk Madinat', 'Souk Madinat Jumeirah, Al Sufouh Road', 'Daily 10am–10pm', 25.1344, 55.1855, false],
    ['Gold Souk', 'Deira', 'Shop 12, Gold Souk, Deira Dubai', 'Sat–Thu 10am–9pm', 25.2631, 55.3050, false],
    ['Zabeel Saray', 'Palm Jumeirah', 'Zabeel Saray Hotel, Palm Jumeirah', 'Daily 10am–10pm', 25.0909, 55.1342, false],
    ['Ibn Battuta Mall', 'Jebel Ali', 'Ibn Battuta Mall, Sheikh Zayed Road', 'Daily 10am–10pm', 25.0438, 55.1224, false],
    ['Dubai Festival City', 'Festival City', 'Festival Waterfront, Dubai Festival City', 'Daily 10am–10pm', 25.2233, 55.3529, false],
  ];
  for (const [name, area, address, hours, lat, lng, primary] of locations) {
    await q(`
      INSERT INTO store_locations (name, area, address, hours, latitude, longitude, is_primary, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,true)
      ON CONFLICT DO NOTHING
    `, [name, area, address, hours, lat, lng, primary]).catch(() => {});
  }
  console.log('✓ 6 Tejori boutique locations seeded');

  // ── SEED: Appointment slots ───────────────────────────────────────────────
  const { rows: locs } = await client.query(`SELECT id FROM store_locations WHERE is_active=true LIMIT 10`);
  const days  = [0,1,2,3,4,6]; // Sun-Thu + Sat
  const times = ['10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];
  let slots = 0;
  for (const loc of locs) {
    for (const day of days) {
      for (const time of times) {
        await q(`
          INSERT INTO appointment_slots (location_id, day_of_week, start_time, max_bookings, is_active)
          VALUES ($1,$2,$3,2,true) ON CONFLICT DO NOTHING
        `, [loc.id, day, time]).catch(() => {});
        slots++;
      }
    }
  }
  console.log(`✓ ${slots} appointment slots seeded`);

  console.log('\n🎉 All migrations complete');
  console.log('   Login: admin@vantix.io / Admin@2026');
}

run()
  .then(() => { client.end(); process.exit(0); })
  .catch(e => { console.error('❌ Migration failed:', e.message); console.error(e.stack); client.end(); process.exit(1); });
