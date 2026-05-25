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
  console.log('🔗 Connected — running migration 003...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       VARCHAR(100) NOT NULL,
      slug       VARCHAR(100) NOT NULL UNIQUE,
      location   VARCHAR(30) DEFAULT 'header',
      items      JSONB NOT NULL DEFAULT '[]',
      is_active  BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ menus');

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku         VARCHAR(100) UNIQUE,
      name        VARCHAR(200) NOT NULL,
      attributes  JSONB DEFAULT '{}',
      price_delta DECIMAL(15,2) DEFAULT 0,
      stock       INTEGER DEFAULT 0,
      weight      DECIMAL(10,3),
      image_url   TEXT,
      is_active   BOOLEAN DEFAULT TRUE,
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ product_variants');

  await client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key        VARCHAR(200) NOT NULL UNIQUE,
      value      JSONB,
      group_name VARCHAR(100) DEFAULT 'general',
      label      VARCHAR(200),
      type       VARCHAR(30) DEFAULT 'text',
      options    JSONB,
      is_public  BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ settings');

  await client.query(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url             TEXT NOT NULL,
      events          JSONB NOT NULL DEFAULT '[]',
      secret          VARCHAR(255),
      is_active       BOOLEAN DEFAULT TRUE,
      last_triggered  TIMESTAMP,
      last_status     INTEGER,
      fail_count      INTEGER DEFAULT 0,
      created_at      TIMESTAMP DEFAULT NOW(),
      updated_at      TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ webhooks');

  await client.query(`
    CREATE TABLE IF NOT EXISTS themes (
      id               VARCHAR(50) PRIMARY KEY,
      name             VARCHAR(100) NOT NULL,
      description      TEXT,
      preview_url      TEXT,
      category         VARCHAR(30) DEFAULT 'minimal',
      is_premium       BOOLEAN DEFAULT FALSE,
      price            DECIMAL(10,2) DEFAULT 0,
      version          VARCHAR(20) DEFAULT '1.0.0',
      settings_schema  JSONB DEFAULT '{}',
      default_settings JSONB DEFAULT '{}',
      is_active        BOOLEAN DEFAULT FALSE,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ themes');

  await client.query(`
    CREATE TABLE IF NOT EXISTS plugin_subscriptions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_id UUID,
      plugin_id  VARCHAR(50) REFERENCES plugins(id),
      plan       VARCHAR(20) DEFAULT 'free',
      price      DECIMAL(10,2) DEFAULT 0,
      status     VARCHAR(20) DEFAULT 'active',
      starts_at  DATE,
      expires_at DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ plugin_subscriptions');

  await client.query(`CREATE INDEX IF NOT EXISTS "product_variants_product_id" ON "product_variants" ("product_id")`).catch(()=>{});
  await client.query(`CREATE INDEX IF NOT EXISTS "settings_key" ON "settings" ("key")`).catch(()=>{});
  await client.query(`CREATE INDEX IF NOT EXISTS "settings_group_name" ON "settings" ("group_name")`).catch(()=>{});
  await client.query(`CREATE INDEX IF NOT EXISTS "menus_location" ON "menus" ("location")`).catch(()=>{});

  console.log('\n🎉 Migration 003 complete');
}

up()
  .then(() => client.end())
  .catch(e => { console.error('❌', e.message); client.end(); process.exit(1); });
