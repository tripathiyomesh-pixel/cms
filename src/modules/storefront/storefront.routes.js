/**
 * Public Storefront API — no auth required
 * Powers the Next.js frontend website
 * All routes are public (no JWT needed)
 */
const express = require('express');
const router  = express.Router();
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');
const { Product, Category, Collection, Media } = require('../../database/models');
const { Op } = require('sequelize');

const TTL = 300; // 5 min cache

// ─── STORE INFO ───────────────────────────────────────────────
router.get('/store', async (req, res) => {
  try {
    const cached = await cache.get('storefront:store');
    if (cached) return res.json({ success: true, data: cached });
    const [settings] = await db.query(`SELECT key, value FROM settings WHERE is_public = true`);
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    const [locations] = await db.query(`SELECT * FROM store_locations WHERE is_active = true ORDER BY is_primary DESC`);
    const [badges] = await db.query(`SELECT * FROM trust_badges WHERE is_active = true ORDER BY sort_order`);
    // Include storefront template setting at top level for easy access
    const data = { settings: map, locations, badges, storefront_template: map.storefront_template || 'luxury-dark' };
    await cache.set('storefront:store', data, TTL);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PRODUCTS (with filters for storefront) ───────────────────
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 24, search, metal_type, purity, category_id,
            collection_id, occasion, gender, min_price, max_price,
            sort = 'created_at', order = 'DESC', is_featured } = req.query;

    const cacheKey = `storefront:products:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const where = { status: 'active' };
    if (search)      where.name = { [Op.iLike]: `%${search}%` };
    if (metal_type)  where.metal_type = metal_type;
    if (purity)      where.purity = purity;
    if (category_id) where.category_id = category_id;
    if (is_featured) where.is_featured = true;
    if (min_price)   where.final_price = { ...(where.final_price||{}), [Op.gte]: parseFloat(min_price) };
    if (max_price)   where.final_price = { ...(where.final_price||{}), [Op.lte]: parseFloat(max_price) };

    const allowedSort = ['name','final_price','created_at','stock_quantity','sort_order'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id','name','slug'] },
        { model: Media, as: 'media', where: { is_primary: true }, required: false, attributes: ['file_url','thumb_url','alt_text'], paranoid: false },
      ],
      order: [[sortCol, order === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    const payload = { data: rows, pagination: { total: count, page: +page, limit: +limit, pages: Math.ceil(count/+limit) } };
    await cache.set(cacheKey, payload, TTL);
    res.json({ success: true, ...payload });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── SINGLE PRODUCT (slug or id) ─────────────────────────────
router.get('/products/:slug', async (req, res) => {
  try {
    const cacheKey = `storefront:product:${req.params.slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const isUUID = /^[0-9a-f-]{36}$/i.test(req.params.slug);
    const where = isUUID ? { id: req.params.slug, status: 'active' } : { slug: req.params.slug, status: 'active' };

    const product = await Product.findOne({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id','name','slug'] },
        { model: Collection, as: 'collections', attributes: ['id','name','slug'], through: { attributes: [] } },
        { model: Media, as: 'media', order: [['sort_order','ASC']], paranoid: false },
      ],
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Fetch jewellery specs
    const [specs] = await db.query(`
      SELECT js.*, 
        json_agg(json_build_object('type',pc.cert_type,'number',pc.cert_number,'lab',pc.cert_lab,'file',pc.cert_file_url,'primary',pc.is_primary)) FILTER (WHERE pc.id IS NOT NULL) as certifications
      FROM product_jewellery_specs js
      LEFT JOIN product_certifications pc ON pc.product_id = js.product_id
      WHERE js.product_id = $1
      GROUP BY js.id
    `, [product.id]);

    // Related products (same category, not same product)
    const related = await Product.findAll({
      where: { category_id: product.category_id, status: 'active', id: { [Op.ne]: product.id } },
      include: [{ model: Media, as: 'media', where: { is_primary: true }, required: false, paranoid: false }],
      limit: 4,
      order: [['sort_order','ASC']],
    });

    const data = { ...product.toJSON(), jewellery_specs: specs[0] || null, related };
    await cache.set(cacheKey, data, TTL);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── CATEGORIES (for filter + nav) ───────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const cached = await cache.get('storefront:categories');
    if (cached) return res.json({ success: true, data: cached });
    const cats = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order','ASC'],['name','ASC']],
    });
    await cache.set('storefront:categories', cats, TTL);
    res.json({ success: true, data: cats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── COLLECTIONS ─────────────────────────────────────────────
router.get('/collections', async (req, res) => {
  try {
    const cached = await cache.get('storefront:collections');
    if (cached) return res.json({ success: true, data: cached });
    const cols = await Collection.findAll({
      where: { is_active: true },
      include: [{ model: Media, as: 'media', required: false, paranoid: false }],
      order: [['sort_order','ASC'],['name','ASC']],
    });
    await cache.set('storefront:collections', cols, TTL);
    res.json({ success: true, data: cols });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── SINGLE COLLECTION + PRODUCTS ────────────────────────────
router.get('/collections/:slug', async (req, res) => {
  try {
    const col = await Collection.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [
        { model: Product, as: 'products', where: { status: 'active' },
          include: [{ model: Media, as: 'media', where: { is_primary: true }, required: false, paranoid: false }],
          required: false,
          through: { attributes: [] },
        },
      ],
    });
    if (!col) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.json({ success: true, data: col });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── BANNERS (for homepage) ───────────────────────────────────
router.get('/banners', async (req, res) => {
  try {
    const { position } = req.query;
    const cached = await cache.get(`storefront:banners:${position||'all'}`);
    if (cached) return res.json({ success: true, data: cached });
    const [rows] = await db.query(`
      SELECT * FROM banners
      WHERE is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
        ${position ? `AND position = $1` : ''}
      ORDER BY sort_order ASC
    `, position ? [position] : []);
    await cache.set(`storefront:banners:${position||'all'}`, rows, TTL);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── MENUS (header, footer) ───────────────────────────────────
router.get('/menus/:location', async (req, res) => {
  try {
    const cached = await cache.get(`storefront:menu:${req.params.location}`);
    if (cached) return res.json({ success: true, data: cached });
    const [rows] = await db.query(`SELECT * FROM menus WHERE location = $1 AND is_active = true LIMIT 1`, [req.params.location]);
    const menu = rows[0] || null;
    await cache.set(`storefront:menu:${req.params.location}`, menu, TTL);
    res.json({ success: true, data: menu });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── CONTENT PAGES (buying guide, FAQ, about) ─────────────────
router.get('/pages', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, cpt.title, cpt.content, cpt.meta_title, cpt.meta_desc
      FROM content_pages cp
      LEFT JOIN content_page_translations cpt ON cpt.page_id = cp.id AND cpt.lang_code = $1
      WHERE cp.status = 'published'
      ORDER BY cp.sort_order ASC
    `, [req.query.lang || 'en']);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/pages/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, cpt.title, cpt.content, cpt.meta_title, cpt.meta_desc
      FROM content_pages cp
      LEFT JOIN content_page_translations cpt ON cpt.page_id = cp.id AND cpt.lang_code = $1
      WHERE cp.slug = $2 AND cp.status = 'published'
    `, [req.query.lang || 'en', req.params.slug]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── METAL RATES (public) ────────────────────────────────────
router.get('/metal-rates', async (req, res) => {
  try {
    const cached = await cache.get('storefront:metal-rates');
    if (cached) return res.json({ success: true, data: cached });
    const [rows] = await db.query(`
      SELECT DISTINCT ON (metal, purity) metal, purity, rate_per_gram, rate_aed, rate_inr, rate_sar, fetched_at
      FROM metal_rates
      ORDER BY metal, purity, fetched_at DESC
    `);
    await cache.set('storefront:metal-rates', rows, 3600);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── WISHLIST (session-based, server-side) ────────────────────
router.post('/wishlist/add', async (req, res) => {
  try {
    const { session_token, product_id, license_id } = req.body;
    if (!session_token || !product_id) return res.status(422).json({ success: false, message: 'session_token and product_id required' });
    const [existing] = await db.query('SELECT id FROM wishlists WHERE session_token=$1 AND product_id=$2', [session_token, product_id]);
    if (existing.length) return res.json({ success: true, message: 'Already in wishlist' });
    await db.execute('INSERT INTO wishlists (session_token, product_id, license_id) VALUES ($1,$2,$3) RETURNING id', [session_token, product_id, license_id||null]);
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/wishlist/:session_token', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.id, w.added_at, p.id as product_id, p.name, p.slug, p.final_price, p.currency, p.metal_type, p.purity, m.thumb_url
      FROM wishlists w
      JOIN products p ON p.id = w.product_id
      LEFT JOIN media m ON m.product_id = p.id AND m.is_primary = true
      WHERE w.session_token = $1
      ORDER BY w.added_at DESC
    `, [req.params.session_token]);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/wishlist/:session_token/:product_id', async (req, res) => {
  try {
    await db.query('DELETE FROM wishlists WHERE session_token=$1 AND product_id=$2', [req.params.session_token, req.params.product_id]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

// ─── DIAMOND DETAIL (public) ─────────────────────────────────
router.get('/diamonds/:id', async (req, res) => {
  try {
    const cacheKey = `storefront:diamond:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const db = require('../../config/db.pool');
    const [rows] = await db.query(`
      SELECT p.*, d.*,
        json_agg(json_build_object('file_url', m.file_url, 'thumb_url', m.thumb_url, 'is_primary', m.is_primary))
          FILTER (WHERE m.id IS NOT NULL) as media
      FROM products p
      LEFT JOIN diamond_details d ON d.product_id = p.id
      LEFT JOIN media m ON m.product_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, d.id
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Diamond not found' });

    // Related diamonds (same shape, similar carat)
    const d = rows[0];
    const [related] = await db.query(`
      SELECT p.id, p.name, p.final_price, p.currency, d2.shape, d2.carat, d2.color, d2.clarity,
             m.file_url as thumb_url
      FROM products p
      LEFT JOIN diamond_details d2 ON d2.product_id = p.id
      LEFT JOIN media m ON m.product_id = p.id AND m.is_primary = true
      WHERE p.inventory_type IN ('NATURAL_DIAMOND','LAB_GROWN_DIAMOND')
        AND p.id != $1 AND p.deleted_at IS NULL
        AND d2.shape = $2
        AND d2.is_available = true
      ORDER BY ABS(d2.carat - $3) ASC
      LIMIT 4
    `, [req.params.id, d.shape, d.carat || 1]);

    const data = { ...d, related };
    await cache.set(cacheKey, data, 120);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── GEMSTONE DETAIL (public) ─────────────────────────────────
router.get('/gemstones/:id', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const [rows] = await db.query(`
      SELECT p.*, g.*,
        json_agg(json_build_object('file_url', m.file_url, 'is_primary', m.is_primary))
          FILTER (WHERE m.id IS NOT NULL) as media
      FROM products p
      LEFT JOIN gemstone_details g ON g.product_id = p.id
      LEFT JOIN media m ON m.product_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, g.id
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PEARL DETAIL (public) ────────────────────────────────────
router.get('/pearls/:id', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const [rows] = await db.query(`
      SELECT p.*, pd.*,
        json_agg(json_build_object('file_url', m.file_url, 'is_primary', m.is_primary))
          FILTER (WHERE m.id IS NOT NULL) as media
      FROM products p
      LEFT JOIN pearl_details pd ON pd.product_id = p.id
      LEFT JOIN media m ON m.product_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, pd.id
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── MOUNTING DETAIL (public) ─────────────────────────────────
router.get('/mountings/:id', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const [rows] = await db.query(`
      SELECT p.*, md.*,
        json_agg(json_build_object('file_url', m.file_url, 'is_primary', m.is_primary))
          FILTER (WHERE m.id IS NOT NULL) as media
      FROM products p
      LEFT JOIN mounting_details md ON md.product_id = p.id
      LEFT JOIN media m ON m.product_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id, md.id
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });

    // Compatible diamonds (by shape + carat range)
    const mt = rows[0];
    const shapes = typeof mt.compatible_shapes === 'string' ? JSON.parse(mt.compatible_shapes) : (mt.compatible_shapes || []);
    let compatible = [];
    if (shapes.length && mt.min_carat && mt.max_carat) {
      const dbPool = require('../../config/db.pool');
      const [comp] = await dbPool.query(`
        SELECT p.id, p.name, p.final_price, p.currency, d.shape, d.carat, d.color, d.clarity,
               m2.file_url as thumb_url
        FROM products p
        LEFT JOIN diamond_details d ON d.product_id = p.id
        LEFT JOIN media m2 ON m2.product_id = p.id AND m2.is_primary = true
        WHERE p.inventory_type IN ('NATURAL_DIAMOND','LAB_GROWN_DIAMOND')
          AND p.deleted_at IS NULL AND d.is_available = true
          AND d.shape = ANY($1) AND d.carat BETWEEN $2 AND $3
        ORDER BY d.carat ASC LIMIT 6
      `, [shapes, parseFloat(mt.min_carat), parseFloat(mt.max_carat)]);
      compatible = comp;
    }
    res.json({ success: true, data: { ...mt, compatible_diamonds: compatible } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── RING BUILDER: combine diamond + mounting ─────────────────
router.post('/ring-builder', async (req, res) => {
  try {
    const { diamond_id, mounting_id, metal } = req.body;
    if (!diamond_id || !mounting_id)
      return res.status(422).json({ success: false, message: 'diamond_id and mounting_id required' });

    const db = require('../../config/db.pool');
    const [diamonds] = await db.query(
      'SELECT p.*, d.* FROM products p LEFT JOIN diamond_details d ON d.product_id = p.id WHERE p.id = $1',
      [diamond_id]
    );
    const [mountings] = await db.query(
      'SELECT p.*, md.* FROM products p LEFT JOIN mounting_details md ON md.product_id = p.id WHERE p.id = $1',
      [mounting_id]
    );
    if (!diamonds.length || !mountings.length)
      return res.status(404).json({ success: false, message: 'Diamond or mounting not found' });

    const diamond  = diamonds[0];
    const mounting = mountings[0];
    const metalOptions = typeof mounting.metal_options === 'string' ? JSON.parse(mounting.metal_options) : (mounting.metal_options || []);
    const selectedMetal = metalOptions.find(m => m.metal === metal) || metalOptions[0] || { price_add: 0 };

    const diamondPrice  = parseFloat(diamond.final_price) || 0;
    const mountingPrice = parseFloat(mounting.final_price) || 0;
    const metalAddon    = parseFloat(selectedMetal.price_add) || 0;
    const totalPrice    = diamondPrice + mountingPrice + metalAddon;

    res.json({ success: true, data: {
      diamond:       { id: diamond.id, name: diamond.name, shape: diamond.shape, carat: diamond.carat, color: diamond.color, clarity: diamond.clarity, price: diamondPrice, currency: diamond.currency, cert_lab: diamond.primary_cert_lab, cert_no: diamond.primary_cert_no },
      mounting:      { id: mounting.id, name: mounting.name, type: mounting.mounting_type, style: mounting.style, metal_options: metalOptions, price: mountingPrice, currency: mounting.currency },
      selected_metal: selectedMetal.metal || 'Standard',
      pricing: { diamond: diamondPrice, mounting: mountingPrice, metal_addon: metalAddon, total: totalPrice, currency: diamond.currency },
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── BLOG (public) ────────────────────────────────────────────
router.get('/blog', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const { page = 1, limit = 12, category } = req.query;
    const offset = (page - 1) * limit;
    const params = ["published"];
    let where = "WHERE status = $1";
    if (category) { params.push(category); where += ` AND category = $${params.length}`; }
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(
      `SELECT id, title, slug, excerpt, cover_image, category, tags, author_name, published_at
       FROM blog_posts ${where} ORDER BY published_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM blog_posts ${where}`, params.slice(0, -2));
    res.json({ success: true, data: { data: rows, total: +cnt[0]?.total || 0 } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const [rows] = await db.query(
      "SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published'",
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ENQUIRY (public) ─────────────────────────────────────────
router.post('/enquiry', async (req, res) => {
  try {
    const db = require('../../config/db.pool');
    const { customer_name, customer_email, customer_phone, message, product_id, product_name, channel = 'website' } = req.body;
    if (!customer_phone && !customer_email)
      return res.status(422).json({ success: false, message: 'Phone or email required' });

    const [r] = await db.execute(
      `INSERT INTO enquiries (customer_name, customer_email, customer_phone, message, product_id, product_name, channel, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'new') RETURNING id`,
      [customer_name || null, customer_email || null, customer_phone || null,
       message || null, product_id || null, product_name || null, channel]
    );
    res.json({ success: true, data: { id: r[0]?.id || r.rows?.[0]?.id }, message: 'Enquiry submitted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
