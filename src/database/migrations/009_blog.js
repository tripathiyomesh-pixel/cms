require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');
async function up() {
  const client = new Client({ host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432, database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title         VARCHAR(300) NOT NULL,
      slug          VARCHAR(300) NOT NULL UNIQUE,
      content       TEXT,
      excerpt       TEXT,
      cover_image   VARCHAR(500),
      status        VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
      category      VARCHAR(100),
      tags          JSONB DEFAULT '[]',
      author_name   VARCHAR(150),
      author_id     UUID,
      seo_title     VARCHAR(200),
      seo_description TEXT,
      published_at  TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
    CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
  `);
  console.log('✅ Migration 009 — blog_posts table');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });
