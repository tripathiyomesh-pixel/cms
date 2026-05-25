const express = require('express');
const router  = express.Router();
const sequelize = require('../../config/database');
const { Op }    = require('../../database/models');
const { cache } = require('../../config/redis');
const { success, error } = require('../../common/response');

// ── GET /api/storefront/store — full store config ─────────────────────────────
router.get('/store', async (req, res) => {
  try {
    const cached = await cache.get('storefront:store');
    if (cached) return success(res, cached);

    const [[settings], [locations]] = await Promise.all([
      sequelize.query(`
        SELECT key, value FROM settings WHERE is_public = true
      `, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(`
        SELECT id, name, area, address, phone, email, hours,
               latitude, longitude, image_url, is_primary, whatsapp
        FROM store_locations WHERE is_active = true ORDER BY is_primary DESC, name ASC
      `, { type: sequelize.QueryTypes.SELECT }),
    ]).catch(() => [[], []]);

    const settingsArr = await sequelize.query(
      `SELECT key, value FROM settings WHERE is_public = true`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const map = {};
    settingsArr.forEach(s => { map[s.key] = s.value; });

    const data = { settings: map, locations };
    await cache.set('storefront:store', data, 300);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/products — product listing with full filters ──────────
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1, limit = 24,
      category, collection, type,
      metal_type, min_price, max_price,
      is_new, is_featured, is_best_seller, is_lab_grown, on_sale,
      sort = 'recommended', q,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic WHERE
    const conditions = [`p.is_active = true`];
    const params = [];
    let pi = 1;

    if (q) {
      conditions.push(`(p.name ILIKE $${pi} OR p.sku ILIKE $${pi} OR p.description ILIKE $${pi})`);
      params.push(`%${q}%`); pi++;
    }
    if (category) {
      conditions.push(`(c.slug = $${pi} OR c.id::text = $${pi} OR c.name ILIKE $${pi})`);
      params.push(category); pi++;
    }
    if (collection) {
      conditions.push(`(col.slug = $${pi} OR col.name ILIKE $${pi})`);
      params.push(collection); pi++;
    }
    if (metal_type) { conditions.push(`p.metal_type = $${pi}`); params.push(metal_type); pi++; }
    if (type === 'high') { conditions.push(`p.product_type = 'HIGH_JEWELLERY'`); }
    if (is_new  === 'true') { conditions.push(`p.is_new_arrival = true`); }
    if (is_featured === 'true' || sort === 'featured') { conditions.push(`p.is_featured = true`); }
    if (is_best_seller === 'true') { conditions.push(`p.is_best_seller = true`); }
    if (is_lab_grown === 'true') { conditions.push(`p.is_lab_grown = true`); }
    if (on_sale === 'true') { conditions.push(`p.discount_percent > 0`); }
    if (min_price) { conditions.push(`p.base_price >= $${pi}`); params.push(parseFloat(min_price)); pi++; }
    if (max_price) { conditions.push(`p.base_price <= $${pi}`); params.push(parseFloat(max_price)); pi++; }

    const orderMap = {
      recommended: 'p.is_featured DESC, p.created_at DESC',
      newest:      'p.created_at DESC',
      price_asc:   'p.base_price ASC NULLS LAST',
      price_desc:  'p.base_price DESC NULLS LAST',
      name_asc:    'p.name ASC',
    };
    const orderBy = orderMap[sort] || orderMap.recommended;

    const whereClause = conditions.join(' AND ');

    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN collections col ON p.collection_id = col.id
      WHERE ${whereClause}
    `, { bind: params, type: sequelize.QueryTypes.SELECT });

    const products = await sequelize.query(`
      SELECT
        p.id, p.name, p.slug, p.sku, p.description,
        p.base_price, p.discount_percent, p.metal_type, p.purity,
        p.gross_weight, p.is_featured, p.is_new_arrival, p.is_best_seller,
        p.is_lab_grown, p.embossing_available, p.engraving_available,
        p.product_type, p.status, p.created_at,
        c.name  AS category_name,  c.slug  AS category_slug,
        col.name AS collection_name, col.slug AS collection_slug,
        (SELECT file_url FROM media WHERE entity_id = p.id AND entity_type = 'product'
         AND media_type = 'image' ORDER BY sort_order ASC, id ASC LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN categories  c   ON p.category_id   = c.id
      LEFT JOIN collections col ON p.collection_id = col.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${pi} OFFSET $${pi + 1}
    `, { bind: [...params, parseInt(limit), offset], type: sequelize.QueryTypes.SELECT });

    success(res, {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult[0]?.total || 0),
        pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit)),
      },
    });
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/products/:slug — single product ──────────────────────
router.get('/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return success(res, cached);

    const [product] = await sequelize.query(`
      SELECT
        p.*,
        c.name  AS category_name,  c.slug  AS category_slug,
        col.name AS collection_name, col.slug AS collection_slug
      FROM products p
      LEFT JOIN categories  c   ON p.category_id   = c.id
      LEFT JOIN collections col ON p.collection_id = col.id
      WHERE (p.slug = $1 OR p.seo_slug = $1 OR p.id::text = $1) AND p.is_active = true
      LIMIT 1
    `, { bind: [slug], type: sequelize.QueryTypes.SELECT });

    if (!product) return error(res, 'Product not found', 404);

    // Get all images
    const media = await sequelize.query(`
      SELECT id, file_url, media_type, alt_text, sort_order
      FROM media WHERE entity_id = $1 AND entity_type = 'product'
      ORDER BY sort_order ASC, id ASC
    `, { bind: [product.id], type: sequelize.QueryTypes.SELECT });

    // Get jewellery specs
    const [specs] = await sequelize.query(`
      SELECT * FROM product_jewellery_specs WHERE product_id = $1 LIMIT 1
    `, { bind: [product.id], type: sequelize.QueryTypes.SELECT });

    // Get certifications
    const certifications = await sequelize.query(`
      SELECT id, cert_type, cert_number, file_url
      FROM product_certifications WHERE product_id = $1
    `, { bind: [product.id], type: sequelize.QueryTypes.SELECT });

    // Get variants
    const variants = await sequelize.query(`
      SELECT id, variant_type, variant_value, additional_price, stock_status
      FROM product_variants WHERE product_id = $1 AND is_active = true
      ORDER BY variant_type, variant_value
    `, { bind: [product.id], type: sequelize.QueryTypes.SELECT });

    // Get related products
    const related = await sequelize.query(`
      SELECT p.id, p.name, p.slug, p.sku, p.metal_type,
             (SELECT file_url FROM media WHERE entity_id = p.id AND entity_type = 'product'
              ORDER BY sort_order ASC LIMIT 1) AS primary_image
      FROM products p
      WHERE p.category_id = $1 AND p.id != $2 AND p.is_active = true
      ORDER BY RANDOM() LIMIT 4
    `, { bind: [product.category_id, product.id], type: sequelize.QueryTypes.SELECT });

    const data = { ...product, media, specs: specs || null, certifications, variants, related };
    await cache.set(cacheKey, data, 120);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/categories — all active categories ───────────────────
router.get('/categories', async (req, res) => {
  try {
    const cached = await cache.get('storefront:categories');
    if (cached) return success(res, cached);

    const categories = await sequelize.query(`
      SELECT id, name, slug, description, image_url, parent_id, sort_order,
             (SELECT COUNT(*) FROM products WHERE category_id = categories.id AND is_active = true) AS product_count
      FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `, { type: sequelize.QueryTypes.SELECT });

    await cache.set('storefront:categories', categories, 300);
    success(res, categories);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/collections — all active collections ─────────────────
router.get('/collections', async (req, res) => {
  try {
    const cached = await cache.get('storefront:collections');
    if (cached) return success(res, cached);

    const collections = await sequelize.query(`
      SELECT id, name, slug, description, image_url, banner_url, is_featured,
             (SELECT COUNT(*) FROM products WHERE collection_id = collections.id AND is_active = true) AS product_count
      FROM collections
      WHERE is_active = true
      ORDER BY is_featured DESC, name ASC
    `, { type: sequelize.QueryTypes.SELECT });

    await cache.set('storefront:collections', collections, 300);
    success(res, collections);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/collections/:slug ─────────────────────────────────────
router.get('/collections/:slug', async (req, res) => {
  try {
    const [col] = await sequelize.query(`
      SELECT * FROM collections WHERE slug = $1 AND is_active = true LIMIT 1
    `, { bind: [req.params.slug], type: sequelize.QueryTypes.SELECT });

    if (!col) return error(res, 'Collection not found', 404);

    const products = await sequelize.query(`
      SELECT p.id, p.name, p.slug, p.sku, p.metal_type, p.base_price, p.discount_percent,
             p.is_new_arrival, p.is_featured,
             (SELECT file_url FROM media WHERE entity_id = p.id AND entity_type = 'product'
              ORDER BY sort_order ASC LIMIT 1) AS primary_image
      FROM products p WHERE p.collection_id = $1 AND p.is_active = true
      ORDER BY p.is_featured DESC, p.created_at DESC
    `, { bind: [col.id], type: sequelize.QueryTypes.SELECT });

    success(res, { ...col, products });
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/metal-rates ─────────────────────────────────────────
router.get('/metal-rates', async (req, res) => {
  try {
    const cached = await cache.get('storefront:metal-rates');
    if (cached) return success(res, cached);

    const rates = await sequelize.query(`
      SELECT metal_type, purity, rate_per_gram, currency, updated_at
      FROM metal_rates WHERE is_active = true ORDER BY metal_type, purity
    `, { type: sequelize.QueryTypes.SELECT });

    await cache.set('storefront:metal-rates', rates, 60);
    success(res, rates);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/banners ──────────────────────────────────────────────
router.get('/banners', async (req, res) => {
  try {
    const { position } = req.query;
    const where = position ? `WHERE position = $1 AND is_active = true` : `WHERE is_active = true`;
    const bind  = position ? [position] : [];
    const banners = await sequelize.query(`
      SELECT id, title, subtitle, image_url, cta_text, cta_link, position, sort_order
      FROM banners ${where} ORDER BY sort_order ASC
    `, { bind, type: sequelize.QueryTypes.SELECT }).catch(() => []);
    success(res, banners);
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/ring-builder — for ring builder page ─────────────────
router.get('/ring-builder', async (req, res) => {
  try {
    const [diamonds, mountings] = await Promise.all([
      sequelize.query(`SELECT id, name, slug, carat, cut, color, clarity, base_price FROM diamonds WHERE is_active = true LIMIT 50`, { type: sequelize.QueryTypes.SELECT }).catch(() => []),
      sequelize.query(`SELECT id, name, slug, metal_type, base_price FROM mountings WHERE is_active = true LIMIT 50`, { type: sequelize.QueryTypes.SELECT }).catch(() => []),
    ]);
    success(res, { diamonds, mountings });
  } catch (e) { error(res, e.message); }
});

// ── GET /api/storefront/frontend-config ──────────────────────────────────────
// Used by TemplateLayout on every page load — returns all public settings
// including theme, storefront template, analytics, popup, maintenance mode
router.get('/frontend-config', async (req, res) => {
  try {
    const cached = await cache.get('storefront:frontend-config');
    if (cached) return success(res, cached);

    const [settings] = await sequelize.query(
      `SELECT key, value FROM settings WHERE is_public = true`,
      { type: 'SELECT' }
    ).catch(() => [[]]);

    const config = {};
    (settings || []).forEach(s => { config[s.key] = s.value; });

    // Also pull from store_settings table if exists
    const [store] = await sequelize.query(
      `SELECT store_name, tagline, logo_url, favicon_url, primary_color,
              secondary_color, font_display, font_body, whatsapp,
              default_currency, default_country, default_lang
       FROM store_settings LIMIT 1`,
      { type: 'SELECT' }
    ).catch(() => [[]]);

    if (store?.[0]) {
      const s = store[0];
      config.store_name       = config.store_name    || s.store_name;
      config.tagline          = config.tagline        || s.tagline;
      config.logo_url         = config.logo_url       || s.logo_url;
      config.favicon_url      = config.favicon_url    || s.favicon_url;
      config.primary_color    = config.primary_color  || s.primary_color;
      config.whatsapp_number  = config.whatsapp_number|| s.whatsapp;
      config.storefront_theme = config.storefront_theme || 'cartier-noir';
    }

    await cache.set('storefront:frontend-config', config, 120);
    success(res, config);
  } catch (e) { error(res, e.message); }
});

module.exports = router;
