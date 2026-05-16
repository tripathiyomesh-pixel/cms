const slugify = require('slugify');
const { v4: uuid } = require('uuid');
const { Product } = require('../database/models');

/**
 * Auto-generate unique SKU
 * Format: JM-{METAL_CODE}{PURITY_CODE}-{RANDOM}
 * Example: JM-GD18-X4K2
 */
const METAL_CODES = {
  gold: 'GD', silver: 'SV', platinum: 'PT',
  rose_gold: 'RG', white_gold: 'WG', palladium: 'PD',
  generic: 'PR',  // generic product (non-jewellery)
};

const generateSKU = async (metalType, purity) => {
  const metalCode = METAL_CODES[metalType] || 'PR';
  const purCode   = purity && purity !== 'NA' ? purity.replace('K', '').replace('0', '') : '';
  const rand      = uuid().split('-')[0].toUpperCase().slice(0, 4);
  const prefix    = metalType === 'generic' ? 'PRD' : 'JM';
  const sku       = purCode ? `${prefix}-${metalCode}${purCode}-${rand}` : `${prefix}-${metalCode}-${rand}`;

  // Ensure uniqueness
  const exists = await Product.findOne({ where: { sku }, paranoid: false });
  if (exists) return generateSKU(metalType, purity); // retry
  return sku;
};

/**
 * Auto-generate unique slug from product name
 */
const generateSlug = async (name, id = null) => {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  const where = id
    ? { slug: base, id: { [require('sequelize').Op.ne]: id } }
    : { slug: base };

  const exists = await Product.findOne({ where, paranoid: false });
  if (!exists) return base;

  // Append random suffix
  const suffix = uuid().split('-')[0].slice(0, 6);
  return `${base}-${suffix}`;
};

/**
 * Generate order number
 * Format: ORD-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `ORD-${date}-${rand}`;
};

module.exports = { generateSKU, generateSlug, generateOrderNumber };
