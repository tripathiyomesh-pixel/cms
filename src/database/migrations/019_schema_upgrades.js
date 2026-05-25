require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected — running migration 019...');

  // ── Products: missing SEO + storefront flags ───────────────────────────────
  await client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title       VARCHAR(255);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_slug        VARCHAR(255);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured     BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival  BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller  BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_lab_grown    BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS embossing_available  BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS engraving_available  BOOLEAN DEFAULT FALSE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url       VARCHAR(500);
  `);
  console.log('✅ products: SEO + storefront flag columns added');

  // Unique index on seo_slug
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_seo_slug
    ON products(seo_slug) WHERE seo_slug IS NOT NULL;
  `);

  // ── Categories: hierarchy + image ─────────────────────────────────────────
  await client.query(`
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url  VARCHAR(500);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
  `);
  console.log('✅ categories: parent_id, image_url, sort_order added');

  // ── Product variants ───────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id           SERIAL PRIMARY KEY,
      product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_type VARCHAR(50) NOT NULL,
      variant_value VARCHAR(100) NOT NULL,
      additional_price NUMERIC(10,2) DEFAULT 0,
      stock_status VARCHAR(20) DEFAULT 'available',
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMP DEFAULT NOW(),
      UNIQUE(product_id, variant_type, variant_value)
    );
  `);
  console.log('✅ product_variants table created');

  // ── Testimonials ──────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id                SERIAL PRIMARY KEY,
      customer_name     VARCHAR(100) NOT NULL,
      customer_location VARCHAR(100),
      review            TEXT NOT NULL,
      rating            INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      product_id        INTEGER REFERENCES products(id) ON DELETE SET NULL,
      image_url         VARCHAR(500),
      is_featured       BOOLEAN DEFAULT FALSE,
      is_active         BOOLEAN DEFAULT TRUE,
      created_at        TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ testimonials table created');

  // ── Customisation / bespoke enquiries ─────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS customisation_enquiries (
      id             SERIAL PRIMARY KEY,
      first_name     VARCHAR(100) NOT NULL,
      last_name      VARCHAR(100),
      email          VARCHAR(255),
      phone          VARCHAR(30),
      country_code   VARCHAR(5) DEFAULT '+971',
      description    TEXT,
      budget         VARCHAR(100),
      attachment_url VARCHAR(500),
      status         VARCHAR(30) DEFAULT 'new',
      internal_notes TEXT,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ customisation_enquiries table created');

  // ── Newsletter subscribers ─────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id              SERIAL PRIMARY KEY,
      email           VARCHAR(255) UNIQUE NOT NULL,
      name            VARCHAR(100),
      is_active       BOOLEAN DEFAULT TRUE,
      source          VARCHAR(50) DEFAULT 'website',
      subscribed_at   TIMESTAMP DEFAULT NOW(),
      unsubscribed_at TIMESTAMP
    );
  `);
  console.log('✅ newsletter_subscribers table created');

  // ── Events ────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id           SERIAL PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      description  TEXT,
      image_url    VARCHAR(500),
      event_date   TIMESTAMP NOT NULL,
      end_date     TIMESTAMP,
      location     VARCHAR(255),
      booth_number VARCHAR(50),
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ events table created');

  // ── Performance indexes ───────────────────────────────────────────────────
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_products_is_featured    ON products(is_featured)    WHERE is_featured = TRUE;
    CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = TRUE;
    CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller) WHERE is_best_seller = TRUE;
    CREATE INDEX IF NOT EXISTS idx_products_is_lab_grown   ON products(is_lab_grown)   WHERE is_lab_grown = TRUE;
    CREATE INDEX IF NOT EXISTS idx_categories_parent_id    ON categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
  `);
  console.log('✅ Performance indexes created');

  console.log('\n🎉 Migration 019 complete');
  await client.end();
}

up().catch(e => { console.error('❌ Migration 019 failed:', e.message); process.exit(1); });
