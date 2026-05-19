/**
 * Migration 003 — Menus, Product Variants, Settings Store, Webhooks, Themes
 * Run: node src/database/migrations/003_universal.js
 */
require('dotenv').config();
const sequelize = require('../../config/database');
const { DataTypes } = require('../../database/models');

async function up() {
  const qi = sequelize.getQueryInterface();

  // ─── MENUS ───────────────────────────────────────────────────
  await qi.createTable('menus', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    slug:        { type: DataTypes.STRING(100), unique: true, allowNull: false },
    location:    { type: DataTypes.ENUM('header', 'footer', 'sidebar', 'mobile', 'mega'), defaultValue: 'header' },
    items:       { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── PRODUCT VARIANTS ────────────────────────────────────────
  await qi.createTable('product_variants', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id:  { type: DataTypes.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
    sku:         { type: DataTypes.STRING(100), unique: true },
    name:        { type: DataTypes.STRING(200), allowNull: false },
    attributes:  { type: DataTypes.JSON, defaultValue: {} },
    price_delta: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    stock:       { type: DataTypes.INTEGER, defaultValue: 0 },
    weight:      { type: DataTypes.DECIMAL(10, 3) },
    image_url:   { type: DataTypes.TEXT },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── SETTINGS (flexible key-value store) ─────────────────────
  await qi.createTable('settings', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    key:         { type: DataTypes.STRING(200), unique: true, allowNull: false },
    value:       { type: DataTypes.JSON },
    group:       { type: DataTypes.STRING(100), defaultValue: 'general' },
    label:       { type: DataTypes.STRING(200) },
    type:        { type: DataTypes.ENUM('text', 'number', 'boolean', 'select', 'json', 'image', 'color'), defaultValue: 'text' },
    options:     { type: DataTypes.JSON },
    is_public:   { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── WEBHOOKS ────────────────────────────────────────────────
  await qi.createTable('webhooks', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    url:         { type: DataTypes.TEXT, allowNull: false },
    events:      { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    secret:      { type: DataTypes.STRING(255) },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    last_triggered: { type: DataTypes.DATE },
    last_status: { type: DataTypes.INTEGER },
    fail_count:  { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── THEMES ──────────────────────────────────────────────────
  await qi.createTable('themes', {
    id:          { type: DataTypes.STRING(50), primaryKey: true },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    preview_url: { type: DataTypes.TEXT },
    category:    { type: DataTypes.ENUM('luxury', 'minimal', 'bridal', 'catalogue', 'ecommerce', 'custom'), defaultValue: 'minimal' },
    is_premium:  { type: DataTypes.BOOLEAN, defaultValue: false },
    price:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    version:     { type: DataTypes.STRING(20), defaultValue: '1.0.0' },
    settings_schema: { type: DataTypes.JSON, defaultValue: {} },
    default_settings: { type: DataTypes.JSON, defaultValue: {} },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── PLUGIN SUBSCRIPTIONS (billing) ──────────────────────────
  await qi.createTable('plugin_subscriptions', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    license_id:  { type: DataTypes.UUID },
    plugin_id:   { type: DataTypes.STRING(50), references: { model: 'plugins', key: 'id' } },
    plan:        { type: DataTypes.ENUM('free', 'monthly', 'yearly', 'lifetime'), defaultValue: 'free' },
    price:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status:      { type: DataTypes.ENUM('active', 'expired', 'cancelled'), defaultValue: 'active' },
    starts_at:   { type: DataTypes.DATE },
    expires_at:  { type: DataTypes.DATE },
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "product_variants_product_id" ON "product_variants" ("product_id")'); } catch(e) {}
  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "product_variants_sku" ON "product_variants" ("sku")'); } catch(e) {}
  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "settings_key" ON "settings" ("key")'); } catch(e) {}
  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "settings_group" ON "settings" ("group")'); } catch(e) {}
  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "menus_location" ON "menus" ("location")'); } catch(e) {}

  console.log('✅ Migration 003 complete — menus, variants, settings, webhooks, themes, plugin billing');
}

async function down() {
  const qi = sequelize.getQueryInterface();
  for (const t of ['plugin_subscriptions', 'themes', 'webhooks', 'settings', 'product_variants', 'menus']) {
    await qi.dropTable(t).catch(() => {});
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
})().catch(e => { console.error(e); process.exit(1); });
