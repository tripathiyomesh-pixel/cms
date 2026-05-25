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
  console.log('🔗 Connected — running migration 001...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(150) NOT NULL,
      email       VARCHAR(200) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(30) NOT NULL DEFAULT 'editor',
      permissions JSONB DEFAULT '{}',
      is_active   BOOLEAN DEFAULT TRUE,
      last_login  TIMESTAMP,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW(),
      deleted_at  TIMESTAMP
    );
  `);
  console.log('✅ users');

  await client.query(`
    CREATE TABLE IF NOT EXISTS licenses (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_key     VARCHAR(100) NOT NULL UNIQUE,
      domain          VARCHAR(255) NOT NULL,
      client_name     VARCHAR(200) NOT NULL,
      plan            VARCHAR(30) DEFAULT 'standard',
      status          VARCHAR(20) DEFAULT 'active',
      issued_at       DATE NOT NULL DEFAULT CURRENT_DATE,
      expires_at      DATE,
      amc_paid_until  DATE,
      created_at      TIMESTAMP DEFAULT NOW(),
      updated_at      TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ licenses');

  await client.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_id       UUID,
      store_name       VARCHAR(200) NOT NULL DEFAULT 'My Store',
      tagline          VARCHAR(500),
      logo_url         TEXT,
      favicon_url      TEXT,
      primary_color    VARCHAR(10) DEFAULT '#B8973E',
      secondary_color  VARCHAR(10) DEFAULT '#0F0F0F',
      font_display     VARCHAR(100) DEFAULT 'Cormorant',
      font_body        VARCHAR(100) DEFAULT 'DM Sans',
      default_currency VARCHAR(10) DEFAULT 'AED',
      default_country  VARCHAR(5)  DEFAULT 'AE',
      default_lang     VARCHAR(5)  DEFAULT 'en',
      whatsapp         VARCHAR(30),
      social_links     JSONB DEFAULT '{}',
      seo_title        VARCHAR(200),
      seo_description  TEXT,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ store_settings');

  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(150) NOT NULL,
      slug        VARCHAR(200) NOT NULL UNIQUE,
      description TEXT,
      parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
      image_url   TEXT,
      sort_order  INTEGER DEFAULT 0,
      is_active   BOOLEAN DEFAULT TRUE,
      seo_title   VARCHAR(200),
      seo_desc    TEXT,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW(),
      deleted_at  TIMESTAMP
    );
  `);
  console.log('✅ categories');

  await client.query(`
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
    );
  `);
  console.log('✅ collections');

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name               VARCHAR(300) NOT NULL,
      sku                VARCHAR(100) NOT NULL UNIQUE,
      slug               VARCHAR(350) NOT NULL UNIQUE,
      description        TEXT,
      short_description  VARCHAR(500),
      category_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
      collection_id      UUID REFERENCES collections(id) ON DELETE SET NULL,
      metal_type         VARCHAR(30),
      purity             VARCHAR(20),
      gross_weight       DECIMAL(10,3),
      net_weight         DECIMAL(10,3),
      gemstone_details   JSONB DEFAULT '[]',
      certifications     JSONB DEFAULT '[]',
      base_price         DECIMAL(15,2) DEFAULT 0,
      making_charges     DECIMAL(15,2) DEFAULT 0,
      making_charge_pct  DECIMAL(5,2)  DEFAULT 0,
      discount           DECIMAL(15,2) DEFAULT 0,
      discount_pct       DECIMAL(5,2)  DEFAULT 0,
      discount_percent   DECIMAL(5,2)  DEFAULT 0,
      final_price        DECIMAL(15,2) DEFAULT 0,
      country_pricing    JSONB DEFAULT '{}',
      currency           VARCHAR(10) DEFAULT 'AED',
      tax_class          VARCHAR(20) DEFAULT 'standard',
      stock_quantity     INTEGER DEFAULT 0,
      low_stock_alert    INTEGER DEFAULT 5,
      is_made_to_order   BOOLEAN DEFAULT FALSE,
      tags               JSONB DEFAULT '[]',
      status             VARCHAR(20) DEFAULT 'draft',
      is_featured        BOOLEAN DEFAULT FALSE,
      is_new_arrival     BOOLEAN DEFAULT FALSE,
      is_best_seller     BOOLEAN DEFAULT FALSE,
      is_lab_grown       BOOLEAN DEFAULT FALSE,
      embossing_available BOOLEAN DEFAULT FALSE,
      engraving_available BOOLEAN DEFAULT FALSE,
      video_url          TEXT,
      seo_title          VARCHAR(200),
      seo_description    TEXT,
      seo_slug           VARCHAR(255),
      sort_order         INTEGER DEFAULT 0,
      product_type       VARCHAR(50),
      created_by         UUID,
      updated_by         UUID,
      created_at         TIMESTAMP DEFAULT NOW(),
      updated_at         TIMESTAMP DEFAULT NOW(),
      deleted_at         TIMESTAMP
    );
  `);
  console.log('✅ products');

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_collections (
      product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      sort_order    INTEGER DEFAULT 0,
      created_at    TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (product_id, collection_id)
    );
  `);
  console.log('✅ product_collections');

  await client.query(`
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
    );
  `);
  console.log('✅ media');

  await client.query(`
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
    );
  `);
  console.log('✅ inventory_ledger');

  await client.query(`
    CREATE TABLE IF NOT EXISTS store_countries (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      country_code    VARCHAR(5) NOT NULL,
      country_name    VARCHAR(100) NOT NULL,
      currency_code   VARCHAR(10) NOT NULL,
      currency_symbol VARCHAR(10),
      tax_label       VARCHAR(50) DEFAULT 'VAT',
      tax_percent     DECIMAL(5,2) DEFAULT 0,
      phone           VARCHAR(30),
      whatsapp        VARCHAR(30),
      address         TEXT,
      is_active       BOOLEAN DEFAULT TRUE,
      sort_order      INTEGER DEFAULT 0,
      created_at      TIMESTAMP DEFAULT NOW(),
      updated_at      TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ store_countries');

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number   VARCHAR(50) UNIQUE,
      customer_name  VARCHAR(200),
      customer_email VARCHAR(200),
      customer_phone VARCHAR(30),
      items          JSONB DEFAULT '[]',
      subtotal       DECIMAL(15,2),
      tax_amount     DECIMAL(15,2) DEFAULT 0,
      total_amount   DECIMAL(15,2),
      currency       VARCHAR(10) DEFAULT 'AED',
      country_code   VARCHAR(5),
      status         VARCHAR(30) DEFAULT 'pending',
      notes          TEXT,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ orders');

  await client.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title        VARCHAR(200),
      subtitle     VARCHAR(300),
      image_url    TEXT NOT NULL,
      mobile_url   TEXT,
      link_url     TEXT,
      link_text    VARCHAR(100),
      position     VARCHAR(30) DEFAULT 'hero',
      country_code VARCHAR(5),
      is_active    BOOLEAN DEFAULT TRUE,
      starts_at    TIMESTAMP,
      ends_at      TIMESTAMP,
      sort_order   INTEGER DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ banners');

  await client.query(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code         VARCHAR(50) NOT NULL UNIQUE,
      description  VARCHAR(300),
      type         VARCHAR(20) NOT NULL,
      value        DECIMAL(10,2) NOT NULL,
      min_order    DECIMAL(10,2) DEFAULT 0,
      max_discount DECIMAL(10,2),
      usage_limit  INTEGER,
      usage_count  INTEGER DEFAULT 0,
      is_active    BOOLEAN DEFAULT TRUE,
      starts_at    TIMESTAMP,
      expires_at   TIMESTAMP,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ promo_codes');

  await client.query(`
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
    );
  `);
  console.log('✅ audit_logs');

  await client.query(`
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
    );
  `);
  console.log('✅ page_sections');

  // Indexes
  const idx = (name, table, col) =>
    client.query(`CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${col})`).catch(() => {});
  await idx('products_sku',          'products',   '"sku"');
  await idx('products_slug',         'products',   '"slug"');
  await idx('products_status',       'products',   '"status"');
  await idx('products_category_id',  'products',   '"category_id"');
  await idx('products_is_featured',  'products',   '"is_featured"');
  await idx('categories_slug',       'categories', '"slug"');
  await idx('categories_parent_id',  'categories', '"parent_id"');
  await idx('collections_slug',      'collections','"slug"');
  await idx('media_product_id',      'media',      '"product_id"');
  await idx('audit_logs_resource',   'audit_logs', '"resource","resource_id"');
  console.log('✅ indexes');

  console.log('\n🎉 Migration 001 complete');
}

up()
  .then(() => client.end())
  .catch(e => { console.error('❌', e.message); client.end(); process.exit(1); });
