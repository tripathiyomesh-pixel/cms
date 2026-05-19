const slugify = require('slugify');
const { v4: uuid } = require('uuid');
const db = require('../config/db.pool');

const METAL_CODES = {
  gold:'GD', silver:'SV', platinum:'PT',
  rose_gold:'RG', white_gold:'WG', palladium:'PD', generic:'PR',
};

const generateSKU = async (metalType, purity) => {
  const metalCode = METAL_CODES[metalType] || 'PR';
  const purCode   = purity && purity !== 'NA' ? purity.replace('K','').replace('0','') : '';
  const rand      = uuid().split('-')[0].toUpperCase().slice(0,4);
  const prefix    = metalType === 'generic' ? 'PRD' : 'JM';
  const sku       = purCode ? `${prefix}-${metalCode}${purCode}-${rand}` : `${prefix}-${metalCode}-${rand}`;
  const [[exists]] = await db.query('SELECT id FROM products WHERE sku=$1', [sku]);
  if (exists) return generateSKU(metalType, purity);
  return sku;
};

const generateSlug = async (name, id = null) => {
  const base = slugify(name, { lower:true, strict:true, trim:true });
  const q    = id
    ? 'SELECT id FROM products WHERE slug=$1 AND id!=$2 LIMIT 1'
    : 'SELECT id FROM products WHERE slug=$1 LIMIT 1';
  const vals = id ? [base, id] : [base];
  const [[exists]] = await db.query(q, vals);
  if (!exists) return base;
  return `${base}-${uuid().split('-')[0].slice(0,6)}`;
};

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.random().toString(36).toUpperCase().slice(2,6);
  return `ORD-${date}-${rand}`;
};

module.exports = { generateSKU, generateSlug, generateOrderNumber };
