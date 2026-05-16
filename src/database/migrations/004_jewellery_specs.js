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

  console.log('🔗 Connected to MySQL...');

  const sql = `

-- ============================================================
-- JEWELLERY SPECS (extends products table 1-to-1)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_jewellery_specs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL UNIQUE,
  -- Metal
  metal_type      ENUM('gold','silver','platinum','rose_gold','white_gold','yellow_gold','two_tone') NOT NULL DEFAULT 'gold',
  purity          ENUM('24K','22K','21K','18K','14K','10K','925','950','999') NOT NULL DEFAULT '18K',
  gross_weight    DECIMAL(8,3) DEFAULT NULL COMMENT 'grams',
  net_weight      DECIMAL(8,3) DEFAULT NULL COMMENT 'grams after stone deduction',
  -- Diamond / Stone
  has_diamond     BOOLEAN DEFAULT FALSE,
  diamond_carat   DECIMAL(6,3) DEFAULT NULL,
  diamond_cut     ENUM('Excellent','Very Good','Good','Fair','Poor') DEFAULT NULL,
  diamond_color   ENUM('D','E','F','G','H','I','J','K','L','M') DEFAULT NULL,
  diamond_clarity ENUM('FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3') DEFAULT NULL,
  diamond_shape   ENUM('Round','Princess','Oval','Marquise','Pear','Cushion','Emerald','Asscher','Radiant','Heart') DEFAULT NULL,
  -- Gemstone
  has_gemstone    BOOLEAN DEFAULT FALSE,
  gemstone_type   VARCHAR(100) DEFAULT NULL COMMENT 'Ruby, Emerald, Sapphire, etc.',
  gemstone_carat  DECIMAL(6,3) DEFAULT NULL,
  gemstone_color  VARCHAR(50) DEFAULT NULL,
  -- Pricing
  making_charges  DECIMAL(8,2) DEFAULT 0.00 COMMENT 'flat AED amount',
  making_pct      DECIMAL(5,2) DEFAULT 0.00 COMMENT 'percent of metal value',
  use_live_rate   BOOLEAN DEFAULT FALSE COMMENT 'calculate price from live gold rate',
  -- Product details
  ring_size_min   DECIMAL(4,1) DEFAULT NULL,
  ring_size_max   DECIMAL(4,1) DEFAULT NULL,
  ring_sizes      JSON DEFAULT NULL COMMENT 'available sizes array e.g. [5,6,7,8]',
  occasion        SET('bridal','daily','gifting','festive','office','luxury') DEFAULT NULL,
  gender          ENUM('women','men','unisex','kids') DEFAULT 'women',
  -- Care
  care_instructions TEXT DEFAULT NULL,
  -- Audit
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_metal_type (metal_type),
  INDEX idx_purity (purity),
  INDEX idx_has_diamond (has_diamond)
);

-- ============================================================
-- CERTIFICATIONS (many per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_certifications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL,
  cert_type       ENUM('IGI','GIA','SGL','HRD','AGS','BIS_Hallmark','Other') NOT NULL,
  cert_number     VARCHAR(100) NOT NULL,
  cert_lab        VARCHAR(100) DEFAULT NULL,
  cert_date       DATE DEFAULT NULL,
  cert_file_url   VARCHAR(500) DEFAULT NULL COMMENT 'Cloudinary PDF URL',
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_cert (product_id),
  INDEX idx_cert_type (cert_type)
);

-- ============================================================
-- LIVE METAL RATES (hourly cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS metal_rates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  metal           ENUM('gold','silver','platinum') NOT NULL,
  purity          ENUM('24K','22K','21K','18K','14K','10K','950','925') NOT NULL,
  rate_per_gram   DECIMAL(10,4) NOT NULL COMMENT 'in USD',
  rate_aed        DECIMAL(10,4) DEFAULT NULL,
  rate_inr        DECIMAL(10,4) DEFAULT NULL,
  rate_sar        DECIMAL(10,4) DEFAULT NULL,
  source          VARCHAR(50) DEFAULT 'manual',
  fetched_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metal_purity (metal, purity),
  INDEX idx_fetched (fetched_at)
);

-- ============================================================
-- ENQUIRIES (WhatsApp + web form leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  product_id      INT DEFAULT NULL,
  enquiry_type    ENUM('product','general','appointment','bulk') DEFAULT 'product',
  channel         ENUM('whatsapp','form','email','phone','chat') DEFAULT 'form',
  customer_name   VARCHAR(150) DEFAULT NULL,
  customer_phone  VARCHAR(30) DEFAULT NULL,
  customer_email  VARCHAR(150) DEFAULT NULL,
  country_code    VARCHAR(10) DEFAULT 'AE',
  message         TEXT DEFAULT NULL,
  product_sku     VARCHAR(100) DEFAULT NULL,
  product_name    VARCHAR(255) DEFAULT NULL,
  product_price   DECIMAL(12,4) DEFAULT NULL,
  status          ENUM('new','contacted','converted','closed') DEFAULT 'new',
  notes           TEXT DEFAULT NULL COMMENT 'internal notes',
  assigned_to     INT DEFAULT NULL COMMENT 'users.id',
  followed_up_at  TIMESTAMP DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id),
  INDEX idx_status (status),
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
);

-- ============================================================
-- WISHLISTS (anonymous + logged in)
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  session_token   VARCHAR(64) DEFAULT NULL COMMENT 'anonymous visitors',
  customer_email  VARCHAR(150) DEFAULT NULL,
  product_id      INT NOT NULL,
  added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_session (session_token),
  INDEX idx_product_wish (product_id)
);

-- ============================================================
-- TRUST BADGES (admin configures per store)
-- ============================================================
CREATE TABLE IF NOT EXISTS trust_badges (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  label           VARCHAR(100) NOT NULL COMMENT 'e.g. IGI Certified',
  icon            VARCHAR(100) DEFAULT NULL COMMENT 'icon name or emoji',
  icon_url        VARCHAR(500) DEFAULT NULL,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);

-- ============================================================
-- CONTENT PAGES (education hub: buying guide, 4Cs, etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_pages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  slug            VARCHAR(150) NOT NULL,
  page_type       ENUM('guide','about','policy','faq','custom') DEFAULT 'guide',
  status          ENUM('draft','published') DEFAULT 'draft',
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id),
  UNIQUE KEY uq_slug_license (slug, license_id)
);

CREATE TABLE IF NOT EXISTS content_page_translations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  page_id         INT NOT NULL,
  lang_code       VARCHAR(10) NOT NULL DEFAULT 'en',
  title           VARCHAR(255) NOT NULL,
  content         LONGTEXT DEFAULT NULL COMMENT 'HTML/rich text',
  meta_title      VARCHAR(255) DEFAULT NULL,
  meta_desc       TEXT DEFAULT NULL,
  FOREIGN KEY (page_id) REFERENCES content_pages(id) ON DELETE CASCADE,
  UNIQUE KEY uq_page_lang (page_id, lang_code)
);

-- ============================================================
-- APPOINTMENTS (optional booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  customer_name   VARCHAR(150) NOT NULL,
  customer_phone  VARCHAR(30) NOT NULL,
  customer_email  VARCHAR(150) DEFAULT NULL,
  preferred_date  DATE NOT NULL,
  preferred_time  VARCHAR(20) DEFAULT NULL,
  location        VARCHAR(255) DEFAULT NULL COMMENT 'branch / showroom',
  purpose         VARCHAR(255) DEFAULT NULL COMMENT 'e.g. engagement ring consultation',
  status          ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  notes           TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id),
  INDEX idx_date (preferred_date),
  INDEX idx_status_appt (status)
);

-- ============================================================
-- PRODUCT IMAGES (replace simple image_url in products)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL,
  url             VARCHAR(500) NOT NULL,
  alt_text        VARCHAR(255) DEFAULT NULL,
  is_primary      BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0,
  image_type      ENUM('photo','360','video_thumb','lifestyle') DEFAULT 'photo',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_img (product_id)
);

-- ============================================================
-- STORE LOCATIONS (multi-showroom)
-- ============================================================
CREATE TABLE IF NOT EXISTS store_locations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  license_id      INT NOT NULL,
  name            VARCHAR(150) NOT NULL,
  address         TEXT NOT NULL,
  city            VARCHAR(100) DEFAULT NULL,
  country_code    VARCHAR(10) DEFAULT 'AE',
  phone           VARCHAR(30) DEFAULT NULL,
  whatsapp        VARCHAR(30) DEFAULT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  google_maps_url VARCHAR(500) DEFAULT NULL,
  working_hours   VARCHAR(255) DEFAULT NULL COMMENT 'e.g. Mon–Sat 10am–8pm',
  is_active       BOOLEAN DEFAULT TRUE,
  is_primary      BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);

`;

  await db.execute(sql);
  console.log('✅ Migration 004 complete — jewellery tables created');
  await db.end();
}

migrate().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); });
