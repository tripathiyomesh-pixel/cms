require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');

async function up() {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: +process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await client.connect();
  await client.query(`

    CREATE TABLE IF NOT EXISTS notifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      type        VARCHAR(100) NOT NULL,
      title       VARCHAR(300) NOT NULL,
      body        TEXT,
      icon        VARCHAR(50) DEFAULT 'bell',
      color       VARCHAR(20) DEFAULT 'blue',
      link        VARCHAR(500),
      resource    VARCHAR(100),
      resource_id UUID,
      is_read     BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notif_user_unread
      ON notifications(user_id, is_read, created_at DESC);

    -- Notification preferences per user
    CREATE TABLE IF NOT EXISTS notification_prefs (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      new_enquiry     BOOLEAN DEFAULT true,
      new_appointment BOOLEAN DEFAULT true,
      new_order       BOOLEAN DEFAULT true,
      low_stock       BOOLEAN DEFAULT true,
      gold_rate_change BOOLEAN DEFAULT false,
      system_alerts   BOOLEAN DEFAULT true,
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

  `);
  console.log('✅ Migration 018 — notifications + notification_prefs');
  await client.end();
}
up().catch(e => { console.error('❌', e.message); process.exit(1); });
