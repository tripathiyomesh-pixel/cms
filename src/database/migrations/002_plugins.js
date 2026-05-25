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
  console.log('🔗 Connected — running migration 002...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS plugins (
      id             VARCHAR(50) PRIMARY KEY,
      name           VARCHAR(100) NOT NULL,
      description    TEXT,
      icon           VARCHAR(50),
      color          VARCHAR(20),
      version        VARCHAR(20) DEFAULT '1.0.0',
      category       VARCHAR(50),
      author         VARCHAR(100) DEFAULT 'KenTech Global',
      is_premium     BOOLEAN DEFAULT FALSE,
      config_schema  JSONB DEFAULT '{}',
      product_fields JSONB DEFAULT '[]',
      validators     JSONB DEFAULT '{}',
      created_at     TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ plugins');

  await client.query(`
    CREATE TABLE IF NOT EXISTS installed_plugins (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_id   UUID,
      plugin_id    VARCHAR(50) NOT NULL REFERENCES plugins(id),
      is_active    BOOLEAN DEFAULT TRUE,
      settings     JSONB DEFAULT '{}',
      installed_at TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ installed_plugins');

  await client.query(`
    CREATE TABLE IF NOT EXISTS product_extensions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      plugin_id  VARCHAR(50) NOT NULL REFERENCES plugins(id),
      data       JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(product_id, plugin_id)
    );
  `);
  console.log('✅ product_extensions');

  await client.query(`CREATE INDEX IF NOT EXISTS "installed_plugins_plugin_id" ON "installed_plugins" ("plugin_id")`).catch(()=>{});
  await client.query(`CREATE INDEX IF NOT EXISTS "installed_plugins_license_id" ON "installed_plugins" ("license_id")`).catch(()=>{});

  console.log('\n🎉 Migration 002 complete');
}

up()
  .then(() => client.end())
  .catch(e => { console.error('❌', e.message); client.end(); process.exit(1); });
