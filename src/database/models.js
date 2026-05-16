const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ─── USER ──────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  email:       { type: DataTypes.STRING(200), allowNull: false, unique: true,
                 validate: { isEmail: true } },
  password:    { type: DataTypes.STRING(255), allowNull: false },
  role:        { type: DataTypes.ENUM('super_admin','admin','manager','editor','viewer'), defaultValue: 'editor' },
  permissions: { type: DataTypes.JSON, defaultValue: {} },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login:  { type: DataTypes.DATE },
}, { tableName: 'users', paranoid: true, timestamps: true });

// ─── CATEGORY ──────────────────────────────────────────────────────────────
const Category = sequelize.define('Category', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  slug:        { type: DataTypes.STRING(200), unique: true, allowNull: false },
  description: { type: DataTypes.TEXT },
  parent_id:   { type: DataTypes.UUID },
  image_url:   { type: DataTypes.TEXT },
  sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
  seo_title:   { type: DataTypes.STRING(200) },
  seo_desc:    { type: DataTypes.TEXT },
}, { tableName: 'categories', paranoid: true, timestamps: true });
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

// ─── COLLECTION ────────────────────────────────────────────────────────────
const Collection = sequelize.define('Collection', {
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
}, { tableName: 'collections', paranoid: true, timestamps: true });

// ─── PRODUCT ───────────────────────────────────────────────────────────────
const Product = sequelize.define('Product', {
  id:                { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:              { type: DataTypes.STRING(300), allowNull: false },
  sku:               { type: DataTypes.STRING(100), unique: true, allowNull: false },
  slug:              { type: DataTypes.STRING(350), unique: true, allowNull: false },
  description:       { type: DataTypes.TEXT },
  short_description: { type: DataTypes.STRING(500) },
  category_id:       { type: DataTypes.UUID },
  metal_type:        { type: DataTypes.ENUM('gold','silver','platinum','rose_gold','white_gold','palladium'), allowNull: false },
  purity:            { type: DataTypes.ENUM('24K','22K','18K','14K','950','925','other'), allowNull: false },
  gross_weight:      { type: DataTypes.DECIMAL(10,3), allowNull: false },
  net_weight:        { type: DataTypes.DECIMAL(10,3) },
  gemstone_details:  { type: DataTypes.JSON, defaultValue: [] },
  certifications:    { type: DataTypes.JSON, defaultValue: [] },
  base_price:        { type: DataTypes.DECIMAL(15,2), allowNull: false, defaultValue: 0 },
  making_charges:    { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  making_charge_pct: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  discount:          { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  discount_pct:      { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  final_price:       { type: DataTypes.DECIMAL(15,2), allowNull: false },
  country_pricing:   { type: DataTypes.JSON, defaultValue: {} },
  currency:          { type: DataTypes.STRING(10), defaultValue: 'AED' },
  tax_class:         { type: DataTypes.ENUM('standard','exempt','reduced'), defaultValue: 'standard' },
  stock_quantity:    { type: DataTypes.INTEGER, defaultValue: 0 },
  low_stock_alert:   { type: DataTypes.INTEGER, defaultValue: 5 },
  is_made_to_order:  { type: DataTypes.BOOLEAN, defaultValue: false },
  tags:              { type: DataTypes.JSON, defaultValue: [] },
  status:            { type: DataTypes.ENUM('active','inactive','draft','archived'), defaultValue: 'draft' },
  is_featured:       { type: DataTypes.BOOLEAN, defaultValue: false },
  sort_order:        { type: DataTypes.INTEGER, defaultValue: 0 },
  seo_title:         { type: DataTypes.STRING(200) },
  seo_description:   { type: DataTypes.TEXT },
  created_by:        { type: DataTypes.UUID },
  updated_by:        { type: DataTypes.UUID },
}, { tableName: 'products', paranoid: true, timestamps: true });

// ─── MEDIA ────────────────────────────────────────────────────────────────
const Media = sequelize.define('Media', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id:    { type: DataTypes.UUID },
  file_url:      { type: DataTypes.TEXT, allowNull: false },
  thumb_url:     { type: DataTypes.TEXT },
  cloudinary_id: { type: DataTypes.STRING(300) },
  file_type:     { type: DataTypes.ENUM('image','video','360_view','certificate'), defaultValue: 'image' },
  file_size:     { type: DataTypes.INTEGER },
  width:         { type: DataTypes.INTEGER },
  height:        { type: DataTypes.INTEGER },
  alt_text:      { type: DataTypes.STRING(300) },
  is_primary:    { type: DataTypes.BOOLEAN, defaultValue: false },
  sort_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'media', updatedAt: false, paranoid: false });

// ─── INVENTORY LEDGER ─────────────────────────────────────────────────────
const InventoryLedger = sequelize.define('InventoryLedger', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: { type: DataTypes.UUID, allowNull: false },
  type:       { type: DataTypes.ENUM('in','out','adjustment','return','transfer') },
  quantity:   { type: DataTypes.INTEGER, allowNull: false },
  balance:    { type: DataTypes.INTEGER, allowNull: false },
  reference:  { type: DataTypes.STRING(200) },
  notes:      { type: DataTypes.TEXT },
  created_by: { type: DataTypes.UUID },
}, { tableName: 'inventory_ledger', updatedAt: false });

// ─── ORDER ────────────────────────────────────────────────────────────────
const Order = sequelize.define('Order', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_number:   { type: DataTypes.STRING(50), unique: true },
  customer_name:  { type: DataTypes.STRING(200) },
  customer_email: { type: DataTypes.STRING(200) },
  customer_phone: { type: DataTypes.STRING(30) },
  items:          { type: DataTypes.JSON, defaultValue: [] },
  subtotal:       { type: DataTypes.DECIMAL(15,2) },
  tax_amount:     { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  total_amount:   { type: DataTypes.DECIMAL(15,2) },
  currency:       { type: DataTypes.STRING(10), defaultValue: 'AED' },
  country_code:   { type: DataTypes.STRING(5) },
  status:         { type: DataTypes.ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned'), defaultValue: 'pending' },
  notes:          { type: DataTypes.TEXT },
}, { tableName: 'orders' });

// ─── BANNER ───────────────────────────────────────────────────────────────
const Banner = sequelize.define('Banner', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:        { type: DataTypes.STRING(200) },
  subtitle:     { type: DataTypes.STRING(300) },
  image_url:    { type: DataTypes.TEXT, allowNull: false },
  mobile_url:   { type: DataTypes.TEXT },
  link_url:     { type: DataTypes.TEXT },
  link_text:    { type: DataTypes.STRING(100) },
  position:     { type: DataTypes.ENUM('hero','promo_strip','sidebar','popup'), defaultValue: 'hero' },
  country_code: { type: DataTypes.STRING(5) },
  is_active:    { type: DataTypes.BOOLEAN, defaultValue: true },
  starts_at:    { type: DataTypes.DATE },
  ends_at:      { type: DataTypes.DATE },
  sort_order:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'banners' });

// ─── PROMO CODE ───────────────────────────────────────────────────────────
const PromoCode = sequelize.define('PromoCode', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code:         { type: DataTypes.STRING(50), unique: true, allowNull: false },
  description:  { type: DataTypes.STRING(300) },
  type:         { type: DataTypes.ENUM('percent','fixed'), allowNull: false },
  value:        { type: DataTypes.DECIMAL(10,2), allowNull: false },
  min_order:    { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  max_discount: { type: DataTypes.DECIMAL(10,2) },
  usage_limit:  { type: DataTypes.INTEGER },
  usage_count:  { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active:    { type: DataTypes.BOOLEAN, defaultValue: true },
  starts_at:    { type: DataTypes.DATE },
  expires_at:   { type: DataTypes.DATE },
}, { tableName: 'promo_codes' });

// ─── AUDIT LOG ────────────────────────────────────────────────────────────
const AuditLog = sequelize.define('AuditLog', {
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
}, { tableName: 'audit_logs', updatedAt: false });

// ─── ASSOCIATIONS ─────────────────────────────────────────────────────────
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Product.belongsToMany(Collection, { through: 'product_collections', foreignKey: 'product_id', as: 'collections' });
Collection.belongsToMany(Product, { through: 'product_collections', foreignKey: 'collection_id', as: 'products' });

Product.hasMany(Media, { foreignKey: 'product_id', as: 'media' });
Media.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(InventoryLedger, { foreignKey: 'product_id', as: 'ledger' });

module.exports = { sequelize, User, Category, Collection, Product, Media, InventoryLedger, Order, Banner, PromoCode, AuditLog };
