/**
 * Jewellery CMS — Full MySQL Schema Migration
 * Run: node src/database/migrations/001_schema.js
 */

require('dotenv').config();
const sequelize = require('../../config/database');
const { DataTypes } = require('sequelize');

async function up() {
  const qi = sequelize.getQueryInterface();

  // ─── USERS ───────────────────────────────────────────────────────────────
  await qi.createTable('users', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:        { type: DataTypes.STRING(150), allowNull: false },
    email:       { type: DataTypes.STRING(200), allowNull: false, unique: true },
    password:    { type: DataTypes.STRING(255), allowNull: false },
    role:        { type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'editor', 'viewer'), defaultValue: 'editor' },
    permissions: { type: DataTypes.JSON, defaultValue: {} },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login:  { type: DataTypes.DATE },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at:  { type: DataTypes.DATE },
  });

  // ─── LICENSES ────────────────────────────────────────────────────────────
  await qi.createTable('licenses', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    license_key:    { type: DataTypes.STRING(100), allowNull: false, unique: true },
    domain:         { type: DataTypes.STRING(255), allowNull: false },
    client_name:    { type: DataTypes.STRING(200), allowNull: false },
    plan:           { type: DataTypes.ENUM('standard', 'multi_country', 'enterprise'), defaultValue: 'standard' },
    status:         { type: DataTypes.ENUM('active', 'expired', 'suspended'), defaultValue: 'active' },
    issued_at:      { type: DataTypes.DATEONLY, allowNull: false },
    expires_at:     { type: DataTypes.DATEONLY },
    amc_paid_until: { type: DataTypes.DATEONLY },
    created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── STORE SETTINGS ──────────────────────────────────────────────────────
  await qi.createTable('store_settings', {
    id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    license_id:       { type: DataTypes.UUID, allowNull: false },
    store_name:       { type: DataTypes.STRING(200), allowNull: false },
    tagline:          { type: DataTypes.STRING(500) },
    logo_url:         { type: DataTypes.TEXT },
    favicon_url:      { type: DataTypes.TEXT },
    primary_color:    { type: DataTypes.STRING(10), defaultValue: '#B8973E' },
    secondary_color:  { type: DataTypes.STRING(10), defaultValue: '#0F0F0F' },
    font_display:     { type: DataTypes.STRING(100), defaultValue: 'Cormorant' },
    font_body:        { type: DataTypes.STRING(100), defaultValue: 'DM Sans' },
    default_currency: { type: DataTypes.STRING(10), defaultValue: 'AED' },
    default_country:  { type: DataTypes.STRING(5), defaultValue: 'AE' },
    default_lang:     { type: DataTypes.STRING(5), defaultValue: 'en' },
    whatsapp:         { type: DataTypes.STRING(30) },
    social_links:     { type: DataTypes.JSON, defaultValue: {} },
    seo_title:        { type: DataTypes.STRING(200) },
    seo_description:  { type: DataTypes.TEXT },
    created_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── CATEGORIES ──────────────────────────────────────────────────────────
  await qi.createTable('categories', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:        { type: DataTypes.STRING(150), allowNull: false },
    slug:        { type: DataTypes.STRING(200), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    parent_id:   { type: DataTypes.UUID, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
    image_url:   { type: DataTypes.TEXT },
    sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    seo_title:   { type: DataTypes.STRING(200) },
    seo_desc:    { type: DataTypes.TEXT },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at:  { type: DataTypes.DATE },
  });

  // ─── COLLECTIONS ─────────────────────────────────────────────────────────
  await qi.createTable('collections', {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:          { type: DataTypes.STRING(200), allowNull: false },
    slug:          { type: DataTypes.STRING(250), unique: true, allowNull: false },
    description:   { type: DataTypes.TEXT },
    banner_url:    { type: DataTypes.TEXT },
    thumbnail_url: { type: DataTypes.TEXT },
    is_featured:   { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
    seo_title:     { type: DataTypes.STRING(200) },
    seo_desc:      { type: DataTypes.TEXT },
    created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at:    { type: DataTypes.DATE },
  });

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  await qi.createTable('products', {
    id:                { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:              { type: DataTypes.STRING(300), allowNull: false },
    sku:               { type: DataTypes.STRING(100), unique: true, allowNull: false },
    slug:              { type: DataTypes.STRING(350), unique: true, allowNull: false },
    description:       { type: DataTypes.TEXT },
    short_description: { type: DataTypes.STRING(500) },
    category_id:       { type: DataTypes.UUID, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
    // Metal details
    metal_type:        { type: DataTypes.ENUM('gold', 'silver', 'platinum', 'rose_gold', 'white_gold', 'palladium'), allowNull: false },
    purity:            { type: DataTypes.ENUM('24K', '22K', '18K', '14K', '950', '925', 'other'), allowNull: false },
    // Weights
    gross_weight:      { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    net_weight:        { type: DataTypes.DECIMAL(10, 3) },
    // Gemstone (JSON array for multiple stones)
    gemstone_details:  { type: DataTypes.JSON, defaultValue: [] },
    // Certifications (JSON array)
    certifications:    { type: DataTypes.JSON, defaultValue: [] },
    // Pricing (stored flat for query performance)
    base_price:        { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    making_charges:    { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    making_charge_pct: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    discount:          { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    discount_pct:      { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    final_price:       { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    // Country pricing (JSON: { AED: 2500, USD: 680 })
    country_pricing:   { type: DataTypes.JSON, defaultValue: {} },
    currency:          { type: DataTypes.STRING(10), defaultValue: 'AED' },
    tax_class:         { type: DataTypes.ENUM('standard', 'exempt', 'reduced'), defaultValue: 'standard' },
    // Inventory
    stock_quantity:    { type: DataTypes.INTEGER, defaultValue: 0 },
    low_stock_alert:   { type: DataTypes.INTEGER, defaultValue: 5 },
    is_made_to_order:  { type: DataTypes.BOOLEAN, defaultValue: false },
    // Meta
    tags:              { type: DataTypes.JSON, defaultValue: [] },
    status:            { type: DataTypes.ENUM('active', 'inactive', 'draft', 'archived'), defaultValue: 'draft' },
    is_featured:       { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order:        { type: DataTypes.INTEGER, defaultValue: 0 },
    seo_title:         { type: DataTypes.STRING(200) },
    seo_description:   { type: DataTypes.TEXT },
    created_by:        { type: DataTypes.UUID },
    updated_by:        { type: DataTypes.UUID },
    created_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at:        { type: DataTypes.DATE },
  });

  // ─── PRODUCT COLLECTIONS (pivot) ─────────────────────────────────────────
  await qi.createTable('product_collections', {
    product_id:    { type: DataTypes.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
    collection_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'collections', key: 'id' }, onDelete: 'CASCADE' },
    sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── MEDIA LIBRARY ───────────────────────────────────────────────────────
  await qi.createTable('media', {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id:    { type: DataTypes.UUID, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
    file_url:      { type: DataTypes.TEXT, allowNull: false },
    thumb_url:     { type: DataTypes.TEXT },
    cloudinary_id: { type: DataTypes.STRING(300) },
    file_type:     { type: DataTypes.ENUM('image', 'video', '360_view', 'certificate'), allowNull: false, defaultValue: 'image' },
    file_size:     { type: DataTypes.INTEGER },
    width:         { type: DataTypes.INTEGER },
    height:        { type: DataTypes.INTEGER },
    alt_text:      { type: DataTypes.STRING(300) },
    is_primary:    { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── INVENTORY LEDGER ────────────────────────────────────────────────────
  await qi.createTable('inventory_ledger', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id:  { type: DataTypes.UUID, allowNull: false, references: { model: 'products', key: 'id' } },
    type:        { type: DataTypes.ENUM('in', 'out', 'adjustment', 'return', 'transfer') },
    quantity:    { type: DataTypes.INTEGER, allowNull: false },
    balance:     { type: DataTypes.INTEGER, allowNull: false },
    reference:   { type: DataTypes.STRING(200) },
    notes:       { type: DataTypes.TEXT },
    created_by:  { type: DataTypes.UUID },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── COUNTRIES ───────────────────────────────────────────────────────────
  await qi.createTable('store_countries', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    country_code:    { type: DataTypes.STRING(5), allowNull: false },
    country_name:    { type: DataTypes.STRING(100), allowNull: false },
    currency_code:   { type: DataTypes.STRING(10), allowNull: false },
    currency_symbol: { type: DataTypes.STRING(10) },
    tax_label:       { type: DataTypes.STRING(50), defaultValue: 'VAT' },
    tax_percent:     { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    phone:           { type: DataTypes.STRING(30) },
    whatsapp:        { type: DataTypes.STRING(30) },
    address:         { type: DataTypes.TEXT },
    is_active:       { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order:      { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── ORDERS ──────────────────────────────────────────────────────────────
  await qi.createTable('orders', {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_number:  { type: DataTypes.STRING(50), unique: true },
    customer_name: { type: DataTypes.STRING(200) },
    customer_email:{ type: DataTypes.STRING(200) },
    customer_phone:{ type: DataTypes.STRING(30) },
    items:         { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    subtotal:      { type: DataTypes.DECIMAL(15, 2) },
    tax_amount:    { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    total_amount:  { type: DataTypes.DECIMAL(15, 2) },
    currency:      { type: DataTypes.STRING(10), defaultValue: 'AED' },
    country_code:  { type: DataTypes.STRING(5) },
    status:        { type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), defaultValue: 'pending' },
    notes:         { type: DataTypes.TEXT },
    created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── BANNERS ─────────────────────────────────────────────────────────────
  await qi.createTable('banners', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title:       { type: DataTypes.STRING(200) },
    subtitle:    { type: DataTypes.STRING(300) },
    image_url:   { type: DataTypes.TEXT, allowNull: false },
    mobile_url:  { type: DataTypes.TEXT },
    link_url:    { type: DataTypes.TEXT },
    link_text:   { type: DataTypes.STRING(100) },
    position:    { type: DataTypes.ENUM('hero', 'promo_strip', 'sidebar', 'popup'), defaultValue: 'hero' },
    country_code:{ type: DataTypes.STRING(5) },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    starts_at:   { type: DataTypes.DATE },
    ends_at:     { type: DataTypes.DATE },
    sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── PROMO CODES ─────────────────────────────────────────────────────────
  await qi.createTable('promo_codes', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code:            { type: DataTypes.STRING(50), unique: true, allowNull: false },
    description:     { type: DataTypes.STRING(300) },
    type:            { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
    value:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_order:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    max_discount:    { type: DataTypes.DECIMAL(10, 2) },
    usage_limit:     { type: DataTypes.INTEGER },
    usage_count:     { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active:       { type: DataTypes.BOOLEAN, defaultValue: true },
    starts_at:       { type: DataTypes.DATE },
    expires_at:      { type: DataTypes.DATE },
    created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── AUDIT LOGS ──────────────────────────────────────────────────────────
  await qi.createTable('audit_logs', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id:     { type: DataTypes.UUID },
    user_email:  { type: DataTypes.STRING(200) },
    action:      { type: DataTypes.STRING(100), allowNull: false },
    resource:    { type: DataTypes.STRING(100), allowNull: false },
    resource_id: { type: DataTypes.STRING(100) },
    old_data:    { type: DataTypes.JSON },
    new_data:    { type: DataTypes.JSON },
    ip_address:  { type: DataTypes.STRING(50) },
    user_agent:  { type: DataTypes.TEXT },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── PAGE SECTIONS ───────────────────────────────────────────────────────
  await qi.createTable('page_sections', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    page:         { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'homepage' },
    section_key:  { type: DataTypes.STRING(100), allowNull: false },
    section_type: { type: DataTypes.STRING(100), allowNull: false },
    content:      { type: DataTypes.JSON, defaultValue: {} },
    is_visible:   { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order:   { type: DataTypes.INTEGER, defaultValue: 0 },
    country_code: { type: DataTypes.STRING(5) },
    created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── INDEXES ─────────────────────────────────────────────────────────────
  await qi.addIndex('products', ['sku']);
  await qi.addIndex('products', ['slug']);
  await qi.addIndex('products', ['status']);
  await qi.addIndex('products', ['metal_type']);
  await qi.addIndex('products', ['category_id']);
  await qi.addIndex('products', ['stock_quantity']);
  await qi.addIndex('categories', ['slug']);
  await qi.addIndex('categories', ['parent_id']);
  await qi.addIndex('collections', ['slug']);
  await qi.addIndex('media', ['product_id']);
  await qi.addIndex('audit_logs', ['resource', 'resource_id']);
  await qi.addIndex('audit_logs', ['user_id']);
  await qi.addIndex('inventory_ledger', ['product_id']);

  console.log('✅ Migration complete — all tables created');
}

async function down() {
  const qi = sequelize.getQueryInterface();
  const tables = [
    'audit_logs', 'page_sections', 'promo_codes', 'banners', 'orders',
    'inventory_ledger', 'media', 'product_collections', 'products',
    'store_countries', 'collections', 'categories', 'store_settings',
    'licenses', 'users',
  ];
  for (const t of tables) {
    await qi.dropTable(t, { cascade: true }).catch(() => {});
  }
  console.log('✅ Rollback complete');
}

(async () => {
  const action = process.argv[2] || 'up';
  await sequelize.authenticate();
  if (action === 'down') await down();
  else await up();
  await sequelize.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
