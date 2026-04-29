const { body, param, query, validationResult } = require('express-validator');
const { error } = require('../response');

const VALID_PURITIES = ['24K', '22K', '18K', '14K', '950', '925', 'other'];
const VALID_METALS   = ['gold', 'silver', 'platinum', 'rose_gold', 'white_gold', 'palladium'];
const VALID_CERTS    = ['GIA', 'IGI', 'SGL', 'HRD', 'AGS', 'other'];
const VALID_CLARITY  = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const VALID_CUT      = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

/** Validate gemstone array structure */
const validateGemstones = (val) => {
  if (!Array.isArray(val)) throw new Error('gemstone_details must be an array');
  for (const g of val) {
    if (!g.type) throw new Error('Each gemstone must have a type');
    if (g.carat !== undefined && (isNaN(g.carat) || g.carat < 0))
      throw new Error('Gemstone carat must be a positive number');
    if (g.clarity && !VALID_CLARITY.includes(g.clarity))
      throw new Error(`Invalid clarity: ${g.clarity}`);
    if (g.cut && !VALID_CUT.includes(g.cut))
      throw new Error(`Invalid cut: ${g.cut}`);
  }
  return true;
};

/** Validate certifications array */
const validateCerts = (val) => {
  if (!Array.isArray(val)) throw new Error('certifications must be an array');
  for (const c of val) {
    if (!c.body || !VALID_CERTS.includes(c.body))
      throw new Error(`Invalid cert body: ${c.body}. Allowed: ${VALID_CERTS.join(', ')}`);
  }
  return true;
};

/** Middleware: run validation and return errors */
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return error(res, 'Validation failed', 422, errs.array());
  }
  next();
};

// ─── PRODUCT RULES ─────────────────────────────────────────────────────────
const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 300 }),
  body('metal_type').isIn(VALID_METALS).withMessage(`metal_type must be one of: ${VALID_METALS.join(', ')}`),
  body('purity').isIn(VALID_PURITIES).withMessage(`purity must be one of: ${VALID_PURITIES.join(', ')}`),
  body('gross_weight').isFloat({ gt: 0 }).withMessage('gross_weight must be a positive number'),
  body('net_weight').optional().isFloat({ gt: 0 }),
  body('base_price').isFloat({ min: 0 }).withMessage('base_price must be >= 0'),
  body('making_charges').optional().isFloat({ min: 0 }),
  body('discount').optional().isFloat({ min: 0 }),
  body('gemstone_details').optional().custom(validateGemstones),
  body('certifications').optional().custom(validateCerts),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active','inactive','draft','archived']),
];

// ─── AUTH RULES ────────────────────────────────────────────────────────────
const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('name').trim().notEmpty().isLength({ max: 150 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['admin','manager','editor','viewer']),
];

// ─── PAGINATION RULES ──────────────────────────────────────────────────────
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  validate,
  productRules,
  loginRules,
  registerRules,
  paginationRules,
  VALID_PURITIES,
  VALID_METALS,
  VALID_CERTS,
};
