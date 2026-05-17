require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432,
    database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS
  });
  await client.connect();

  await client.query(`

    -- metal_rates: add rate_aed + source columns if missing
    ALTER TABLE metal_rates
      ADD COLUMN IF NOT EXISTS rate_aed    NUMERIC(12,4),
      ADD COLUMN IF NOT EXISTS source      VARCHAR(100) DEFAULT 'manual',
      ADD COLUMN IF NOT EXISTS fetched_at  TIMESTAMPTZ;

    -- Unique constraint on metal_rates (metal + purity)
    DO $$ BEGIN
      ALTER TABLE metal_rates ADD CONSTRAINT metal_rates_metal_purity_unique UNIQUE (metal, purity);
    EXCEPTION WHEN duplicate_table THEN null; END $$;

    -- products: add description + is_featured + tags
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tags        JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS occasion    VARCHAR(100),
      ADD COLUMN IF NOT EXISTS gender      VARCHAR(20),
      ADD COLUMN IF NOT EXISTS style       VARCHAR(100),
      ADD COLUMN IF NOT EXISTS collection_ids JSONB DEFAULT '[]';

    -- orders: ensure all needed columns exist
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_name  VARCHAR(200),
      ADD COLUMN IF NOT EXISTS customer_email VARCHAR(200),
      ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS items          JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS subtotal       NUMERIC(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax_amount     NUMERIC(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_amount   NUMERIC(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS currency       VARCHAR(10) DEFAULT 'AED',
      ADD COLUMN IF NOT EXISTS country_code   VARCHAR(5)  DEFAULT 'AE',
      ADD COLUMN IF NOT EXISTS order_number   VARCHAR(50),
      ADD COLUMN IF NOT EXISTS erp_order_id   VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notes          TEXT;

    -- appointments: ensure preferred_date is DATE type
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS purpose    VARCHAR(200),
      ADD COLUMN IF NOT EXISTS party_size INT DEFAULT 1;

    -- enquiries: add product_name + channel columns
    ALTER TABLE enquiries
      ADD COLUMN IF NOT EXISTS product_name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS channel      VARCHAR(50) DEFAULT 'website';

    -- wishlists: make session_token + product_id unique
    DO $$ BEGIN
      ALTER TABLE wishlists ADD CONSTRAINT wishlists_session_product_unique UNIQUE (session_token, product_id);
    EXCEPTION WHEN duplicate_table THEN null; END $$;

    -- blog_posts: ensure all columns exist
    ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS category     VARCHAR(100),
      ADD COLUMN IF NOT EXISTS author_name  VARCHAR(150),
      ADD COLUMN IF NOT EXISTS author_id    UUID;

    -- customers: add country_code
    ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT 'AE';

    -- Search index for better performance
    CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion);
    CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
    CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at);

  `);

  console.log('✅ Migration 011 — Complete backend schema');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });

// Password resets table — run this manually if already applied
// ALTER TABLE: add after existing migration
