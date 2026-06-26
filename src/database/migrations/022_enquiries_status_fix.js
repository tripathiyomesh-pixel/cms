/**
 * Migration 022 — Fix enquiries status CHECK constraint
 *
 * Problem: migration 021 created the enquiries table with status values
 *   ('new','contacted','quoted','closed','spam')
 * but the admin CRM pipeline uses
 *   ('new','contacted','qualified','won','lost')
 *
 * Fix: drop the old constraint and add the new one.
 * Safe to re-run — uses IF EXISTS / DO NOTHING patterns.
 */
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
  console.log('🔗 Connected — running migration 022 (enquiries status fix)...');

  // 1. Drop the old CHECK constraint (name may vary — drop by finding it)
  await client.query(`
    DO $$
    DECLARE
      con_name TEXT;
    BEGIN
      SELECT conname INTO con_name
      FROM pg_constraint
      WHERE conrelid = 'enquiries'::regclass
        AND contype   = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
      LIMIT 1;

      IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE enquiries DROP CONSTRAINT ' || quote_ident(con_name);
        RAISE NOTICE 'Dropped constraint: %', con_name;
      ELSE
        RAISE NOTICE 'No status CHECK constraint found on enquiries — skipping drop';
      END IF;
    END
    $$;
  `);
  console.log('✅ Old status constraint removed (if existed)');

  // 2. Remap any existing rows that used the old values
  await client.query(`
    UPDATE enquiries SET status = 'won'       WHERE status = 'quoted';
    UPDATE enquiries SET status = 'lost'      WHERE status = 'closed';
    UPDATE enquiries SET status = 'contacted' WHERE status = 'spam';
  `);
  console.log('✅ Existing rows remapped to new status values');

  // 3. Add the new CHECK constraint
  await client.query(`
    ALTER TABLE enquiries
      ADD CONSTRAINT enquiries_status_check
      CHECK (status IN ('new','contacted','qualified','won','lost'));
  `);
  console.log('✅ New status constraint added: new/contacted/qualified/won/lost');

  await client.end();
  console.log('🏁 Migration 022 complete');
}

up().catch(e => {
  console.error('❌ Migration 022 failed:', e.message);
  client.end();
  process.exit(1);
});
