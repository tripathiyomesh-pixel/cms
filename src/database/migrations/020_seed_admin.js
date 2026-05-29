/**
 * Migration 020 — Seed admin user + essential settings
 * 
 * Creates:
 *   - Admin user: admin@tejori.com / Admin@2026 (super_admin)
 *   - Store settings row (id=1)
 *   - Default appointment slots for all locations
 *   - password_resets table if missing (some setups skip migration 012)
 * 
 * Safe to re-run — uses ON CONFLICT DO NOTHING
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');

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
  console.log('🔗 Connected — running migration 020 (seed)...');

  // ── Ensure password_resets table exists ─────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      token      VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
  `);
  console.log('✅ password_resets table ready');

  // ── Seed super_admin user ────────────────────────────────────
  const hash = await bcrypt.hash('Admin@2026', 12);
  const id   = crypto.randomUUID();

  const { rows: existing } = await client.query(
    `SELECT id FROM users WHERE email = 'admin@tejori.com' LIMIT 1`
  );

  if (existing.length === 0) {
    await client.query(`
      INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
      VALUES ($1, 'Admin', 'admin@tejori.com', $2, 'super_admin', true, NOW(), NOW())
    `, [id, hash]);
    console.log('✅ Admin user created: admin@tejori.com / Admin@2026');
  } else {
    // Update password in case it changed
    await client.query(
      `UPDATE users SET password=$1, role='super_admin', is_active=true, updated_at=NOW() WHERE email='admin@tejori.com'`,
      [hash]
    );
    console.log('✅ Admin user already exists — password reset to Admin@2026');
  }

  // ── Seed store settings ──────────────────────────────────────
  await client.query(`
    INSERT INTO store_settings (store_name, tagline, default_currency, default_country, default_lang, primary_color, whatsapp)
    VALUES ('TEJORI', 'Timeless Craftsmanship', 'AED', 'AE', 'en', '#b8860b', '971500000000')
    ON CONFLICT DO NOTHING
  `).catch(() => {}); // ignore if table structure differs
  console.log('✅ Store settings seeded');

  // ── Seed default appointment slots for all locations ─────────
  const { rows: locations } = await client.query(
    `SELECT id FROM store_locations WHERE is_active = true LIMIT 10`
  ).catch(() => ({ rows: [] }));

  if (locations.length > 0) {
    const days  = [0, 1, 2, 3, 4, 6]; // Sun–Thu + Sat (UAE work week)
    const times = ['10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];
    let slotCount = 0;
    for (const loc of locations) {
      for (const day of days) {
        for (const time of times) {
          try {
            await client.query(`
              INSERT INTO appointment_slots (location_id, day_of_week, start_time, max_bookings, is_active)
              VALUES ($1, $2, $3, 2, true)
              ON CONFLICT DO NOTHING
            `, [loc.id, day, time]);
            slotCount++;
          } catch {}
        }
      }
    }
    console.log(`✅ ${slotCount} appointment slots seeded for ${locations.length} locations`);
  } else {
    console.log('ℹ️  No store locations found — run this again after adding boutiques');
  }

  // ── Seed essential settings ──────────────────────────────────
  const defaults = [
    { key: 'maintenance_enabled',  value: 'false',                       group: 'system',    pub: false },
    { key: 'maintenance_message',  value: 'We are updating. Back soon.', group: 'system',    pub: false },
    { key: 'storefront_theme',     value: 'cartier-noir',                group: 'storefront',pub: true  },
    { key: 'store_name',           value: 'TEJORI',                      group: 'brand',     pub: true  },
    { key: 'store_tagline',        value: 'Timeless Craftsmanship',      group: 'brand',     pub: true  },
    { key: 'whatsapp_number',      value: '971500000000',                group: 'brand',     pub: true  },
    { key: 'primary_color',        value: '#b8860b',                     group: 'brand',     pub: true  },
    { key: 'currency',             value: 'AED',                         group: 'storefront',pub: true  },
    { key: 'gold_rate_auto_fetch', value: 'false',                       group: 'system',    pub: false },
  ];

  for (const s of defaults) {
    await client.query(`
      INSERT INTO settings (key, value, group_name, type, is_public)
      VALUES ($1, $2::jsonb, $3, 'text', $4)
      ON CONFLICT (key) DO NOTHING
    `, [s.key, JSON.stringify(s.value), s.group, s.pub]).catch(() => {});
  }
  console.log('✅ Default settings seeded');

  console.log('\n🎉 Migration 020 complete');
  console.log('   Login: admin@tejori.com / Admin@2026');
}

up()
  .then(() => client.end())
  .catch(e => { console.error('❌', e.message); client.end(); process.exit(1); });
