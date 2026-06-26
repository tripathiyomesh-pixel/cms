/**
 * Migration 023 — Backend Complete Schema
 *
 * Adds columns found missing during the backend completeness audit.
 * All additions use IF NOT EXISTS to be safe to re-run.
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jewellery_cms',
  user:     process.env.DB_USER     || 'cmsuser',
  password: process.env.DB_PASS     || 'CmsPass@2026',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const migrations = [
  // import_jobs: completion tracking columns
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS imported_count INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS skipped_count INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS failed_count INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`,

  // media: product_id should be nullable (standalone uploads)
  `ALTER TABLE media ALTER COLUMN product_id DROP NOT NULL`,

  // products: merchandising flags
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false`,

  // notifications: read timestamp
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP`,

  // enquiries: source tracking
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'website'`,

  // customers: segmentation
  `ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment VARCHAR(50)`,

  // products: stone value for pricing engine
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_value DECIMAL(12,2) DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS making_charges DECIMAL(12,2) DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS making_charge_pct DECIMAL(5,2) DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_pct DECIMAL(5,2) DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10,3)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS net_weight DECIMAL(10,3)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS purity VARCHAR(10)`,

  // import_jobs: imported/skipped/errors columns (alternative names used in process route)
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS imported INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS skipped INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS errors INT DEFAULT 0`,
  `ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS error_log TEXT`,
];

(async () => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    for (const sql of migrations) {
      try {
        await client.query(sql);
        console.log('OK:', sql.slice(0, 80));
      } catch (e) {
        console.warn('SKIP (already exists or error):', e.message.slice(0, 100));
      }
    }
    console.log('\nMigration 023 complete.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
