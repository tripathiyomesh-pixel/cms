/**
 * Plugin System Migration — adds plugin tables to the universal CMS
 * Run: node src/database/migrations/002_plugins.js
 */
require('dotenv').config();
const sequelize = require('../../config/database');
const { DataTypes } = require('../../database/models');

async function up() {
  const qi = sequelize.getQueryInterface();

  // ─── AVAILABLE PLUGINS (global registry) ─────────────────────
  await qi.createTable('plugins', {
    id:          { type: DataTypes.STRING(50), primaryKey: true }, // e.g. 'jewellery', 'fashion', 'realestate'
    name:        { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    icon:        { type: DataTypes.STRING(50) },       // lucide icon name
    color:       { type: DataTypes.STRING(20) },       // tailwind color class
    version:     { type: DataTypes.STRING(20), defaultValue: '1.0.0' },
    category:    { type: DataTypes.STRING(50) },       // 'industry', 'feature', 'integration'
    author:      { type: DataTypes.STRING(100), defaultValue: 'KenTech Global' },
    is_premium:  { type: DataTypes.BOOLEAN, defaultValue: false },
    config_schema: { type: DataTypes.JSON, defaultValue: {} },  // JSON schema of plugin settings
    product_fields: { type: DataTypes.JSON, defaultValue: [] }, // extra fields injected into product form
    validators:    { type: DataTypes.JSON, defaultValue: {} },  // validation rules for those fields
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── INSTALLED PLUGINS (per license/client) ──────────────────
  await qi.createTable('installed_plugins', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    license_id:  { type: DataTypes.UUID },
    plugin_id:   { type: DataTypes.STRING(50), allowNull: false, references: { model: 'plugins', key: 'id' } },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    settings:    { type: DataTypes.JSON, defaultValue: {} },  // client-specific plugin config
    installed_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // ─── PRODUCT EXTENSIONS (extra field values per product) ─────
  await qi.createTable('product_extensions', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id:  { type: DataTypes.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
    plugin_id:   { type: DataTypes.STRING(50), allowNull: false, references: { model: 'plugins', key: 'id' } },
    data:        { type: DataTypes.JSON, allowNull: false, defaultValue: {} },  // actual field values
    created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "installed_plugins_plugin_id" ON "installed_plugins" ("plugin_id")'); } catch(e) {}
  try { await sequelize.query('CREATE INDEX IF NOT EXISTS "installed_plugins_license_id" ON "installed_plugins" ("license_id")'); } catch(e) {}
  try { await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "product_extensions_product_id_plugin_id" ON "product_extensions" ("product_id","plugin_id")'); } catch(e) {}

  console.log('✅ Plugin tables created');
}

async function down() {
  const qi = sequelize.getQueryInterface();
  await qi.dropTable('product_extensions').catch(() => {});
  await qi.dropTable('installed_plugins').catch(() => {});
  await qi.dropTable('plugins').catch(() => {});
  console.log('✅ Plugin tables dropped');
}

(async () => {
  const action = process.argv[2] || 'up';
  await sequelize.authenticate();
  if (action === 'down') await down();
  else await up();
  await sequelize.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
