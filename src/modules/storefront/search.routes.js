const express = require('express');
const router  = express.Router();
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');

// ─── SEARCH (unified — searches all active inventory) ──────────
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 20, page = 1 } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(422).json({ success: false, message: 'Query must be at least 2 characters' });

    const offset = (page - 1) * limit;
    const search = `%${q.trim()}%`;
    const params = [search, parseInt(limit), parseInt(offset)];

    let typeFilter = '';
    if (type) typeFilter = `AND p.inventory_type = '${type.toUpperCase()}'`;

    const [rows] = await db.query(`
      SELECT
        p.id, p.name, p.slug, p.sku, p.final_price, p.currency,
        p.inventory_type, p.status,
        m.file_url as thumb_url,
        -- Diamond fields
        d.shape, d.carat, d.color, d.clarity, d.cut, d.primary_cert_lab,
        -- Gemstone fields
        g.gemstone_type, g.country_of_origin,
        -- Pearl fields
        pd.pearl_type,
        -- Mounting fields
        md.mounting_type, md.category
      FROM products p
      LEFT JOIN media m ON m.product_id = p.id AND m.is_primary = true
      LEFT JOIN diamond_details d ON d.product_id = p.id
      LEFT JOIN gemstone_details g ON g.product_id = p.id
      LEFT JOIN pearl_details pd ON pd.product_id = p.id
      LEFT JOIN mounting_details md ON md.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'active'
        ${typeFilter}
        AND (
          p.name ILIKE $1 OR p.sku ILIKE $1 OR p.description ILIKE $1
          OR d.shape ILIKE $1 OR d.primary_cert_no ILIKE $1
          OR g.gemstone_type ILIKE $1 OR g.country_of_origin ILIKE $1
          OR pd.pearl_type ILIKE $1 OR md.mounting_type ILIKE $1
        )
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, params);

    // Count
    const [cnt] = await db.query(`
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN diamond_details d ON d.product_id = p.id
      LEFT JOIN gemstone_details g ON g.product_id = p.id
      LEFT JOIN pearl_details pd ON pd.product_id = p.id
      LEFT JOIN mounting_details md ON md.product_id = p.id
      WHERE p.deleted_at IS NULL AND p.status = 'active'
        ${typeFilter}
        AND (p.name ILIKE $1 OR p.sku ILIKE $1 OR d.primary_cert_no ILIKE $1 OR g.gemstone_type ILIKE $1)
    `, [search]);

    res.json({ success: true, data: { results: rows, total: +cnt[0]?.total || 0, query: q, page: +page } });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── AUTOCOMPLETE (quick suggestions as user types) ────────────
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ success: true, data: [] });

    const cacheKey = `autocomplete:${q.toLowerCase()}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [rows] = await db.query(`
      SELECT p.id, p.name, p.inventory_type, p.final_price, p.currency, m.file_url as thumb_url
      FROM products p
      LEFT JOIN media m ON m.product_id = p.id AND m.is_primary = true
      WHERE p.deleted_at IS NULL AND p.status = 'active'
        AND p.name ILIKE $1
      ORDER BY p.name ASC LIMIT 8
    `, [`%${q.trim()}%`]);

    await cache.set(cacheKey, rows, 300);
    res.json({ success: true, data: rows });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
