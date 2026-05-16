const mysql = require('mysql2/promise');
require('dotenv').config({ path: '/var/www/cms/.env' });

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'cmsuser',
    password: process.env.DB_PASS || 'CmsPass@2026',
    database: process.env.DB_NAME || 'jewellery_cms',
    multipleStatements: true
  });

  console.log('🔗 Connected...');

  await db.execute(`
    -- Add new columns to appointments table
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS location_id    INT DEFAULT NULL AFTER license_id,
      ADD COLUMN IF NOT EXISTS product_ref    VARCHAR(100) DEFAULT NULL AFTER purpose,
      ADD COLUMN IF NOT EXISTS product_name   VARCHAR(255) DEFAULT NULL AFTER product_ref,
      ADD COLUMN IF NOT EXISTS product_url    VARCHAR(500) DEFAULT NULL AFTER product_name,
      ADD COLUMN IF NOT EXISTS party_size     INT DEFAULT 1 AFTER product_url,
      ADD COLUMN IF NOT EXISTS special_requests TEXT DEFAULT NULL AFTER party_size,
      ADD COLUMN IF NOT EXISTS booking_ref    VARCHAR(50) UNIQUE DEFAULT NULL AFTER special_requests,
      ADD COLUMN IF NOT EXISTS confirmed_time VARCHAR(20) DEFAULT NULL AFTER booking_ref,
      ADD COLUMN IF NOT EXISTS lang           VARCHAR(10) DEFAULT 'en' AFTER confirmed_time,
      ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

    -- Flexible store settings table (key-value)
    CREATE TABLE IF NOT EXISTS settings (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      license_id    INT NOT NULL,
      setting_key   VARCHAR(100) NOT NULL,
      setting_value LONGTEXT DEFAULT NULL,
      setting_type  ENUM('string','json','boolean','number') DEFAULT 'string',
      UNIQUE KEY uq_license_key (license_id, setting_key),
      FOREIGN KEY (license_id) REFERENCES licenses(id)
    );

    -- Appointment purposes / visit types (admin configures)
    CREATE TABLE IF NOT EXISTS appointment_purposes (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      license_id  INT NOT NULL,
      label       VARCHAR(100) NOT NULL,
      label_ar    VARCHAR(100) DEFAULT NULL,
      icon        VARCHAR(50) DEFAULT NULL,
      duration_mins INT DEFAULT 30,
      is_active   BOOLEAN DEFAULT TRUE,
      sort_order  INT DEFAULT 0,
      FOREIGN KEY (license_id) REFERENCES licenses(id)
    );

    -- Default appointment purposes seed (will be skipped if already exist)
    -- These get inserted per-license on first use via API
  `);

  console.log('✅ Migration 005 complete — appointments upgraded');
  await db.end();
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
