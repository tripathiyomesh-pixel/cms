require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');
async function up() {
  const client = new Client({ host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432, database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS });
  await client.connect();
  await client.query(`

    CREATE TABLE IF NOT EXISTS exhibitions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title             VARCHAR(300) NOT NULL,
      slug              VARCHAR(300) NOT NULL UNIQUE,
      subtitle          VARCHAR(300),
      description       TEXT,
      venue_name        VARCHAR(200),
      venue_address     TEXT,
      venue_city        VARCHAR(100),
      venue_country     VARCHAR(100) DEFAULT 'UAE',
      venue_map_url     VARCHAR(500),
      booth_number      VARCHAR(50),
      start_date        DATE NOT NULL,
      end_date          DATE NOT NULL,
      start_time        TIME DEFAULT '10:00',
      end_time          TIME DEFAULT '20:00',
      hero_image        VARCHAR(500),
      gallery_images    JSONB DEFAULT '[]',
      is_vip            BOOLEAN DEFAULT FALSE,
      is_active         BOOLEAN DEFAULT TRUE,
      is_published      BOOLEAN DEFAULT FALSE,
      registration_open BOOLEAN DEFAULT TRUE,
      reg_open_date     DATE,
      reg_close_date    DATE,
      max_registrations INT,
      seo_title         VARCHAR(200),
      seo_description   TEXT,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exhibition_registrations (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exhibition_id   UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      full_name       VARCHAR(200) NOT NULL,
      email           VARCHAR(200),
      phone           VARCHAR(50) NOT NULL,
      company         VARCHAR(200),
      visit_date      DATE,
      visit_time      VARCHAR(20),
      party_size      INT DEFAULT 1,
      is_vip          BOOLEAN DEFAULT FALSE,
      notes           TEXT,
      status          VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered','confirmed','cancelled','attended')),
      source          VARCHAR(50) DEFAULT 'website',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exhibition_products (
      id              SERIAL PRIMARY KEY,
      exhibition_id   UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      product_id      UUID REFERENCES products(id),
      sort_order      INT DEFAULT 0,
      is_featured     BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_exhibitions_dates    ON exhibitions(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_exhibitions_slug     ON exhibitions(slug);
    CREATE INDEX IF NOT EXISTS idx_exhibitions_active   ON exhibitions(is_active, is_published);
    CREATE INDEX IF NOT EXISTS idx_exh_reg_exhibition   ON exhibition_registrations(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_exh_products_exh     ON exhibition_products(exhibition_id);

    -- Add to feature flags
    INSERT INTO feature_flags (flag_key, label, module, is_enabled)
    VALUES ('module_exhibitions', 'Exhibition Module', 'crm', false)
    ON CONFLICT (flag_key) DO NOTHING;

    -- Add is_new and compare_price to products (Tejori features)
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS is_new          BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS compare_price   NUMERIC(15,2),
      ADD COLUMN IF NOT EXISTS sale_badge_text VARCHAR(50);

  `);
  console.log('✅ Migration 012 — exhibitions + is_new + compare_price');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });
