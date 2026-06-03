const express  = require('express');
const router   = express.Router();
const { makeSlug } = require('../../common/slug.util');
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const { upload } = require('../../config/cloudinary');

router.get('/', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('collections:all');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM products p WHERE p.collection_id=c.id AND p.status!='archived') AS product_count
      FROM collections c
      WHERE c.deleted_at IS NULL
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    await cache.set('collections:all', rows, 300);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM collections WHERE id=$1 AND deleted_at IS NULL LIMIT 1`, [req.params.id]);
    if (!rows.length) return error(res, 'Collection not found', 404);
    const { rows: products } = await pool.query(`
      SELECT p.id,p.name,p.sku,p.metal_type,p.final_price,p.status,
        (SELECT file_url FROM media WHERE product_id=p.id AND is_primary=true LIMIT 1) AS primary_image
      FROM products p WHERE p.collection_id=$1 AND p.deleted_at IS NULL
      ORDER BY p.sort_order ASC`, [rows[0].id]
    );
    success(res, { ...rows[0], products });
  } catch (e) { error(res, e.message); }
});

router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, description, is_featured=false, sort_order=0, seo_title, seo_desc } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = makeSlug(name);
    const { rows: [col] } = await pool.query(
      `INSERT INTO collections (name,slug,description,is_featured,sort_order,seo_title,seo_desc)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, slug, description||null, is_featured, sort_order, seo_title||null, seo_desc||null]
    );
    await cache.del('collections:all');
    created(res, col, 'Collection created');
  } catch (e) { error(res, e.message); }
});

router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { rows: [existing] } = await pool.query(`SELECT * FROM collections WHERE id=$1`, [req.params.id]);
    if (!existing) return error(res, 'Collection not found', 404);
    const { name, description, is_featured, sort_order, is_active, seo_title, seo_desc } = req.body;
    const slug = name && name !== existing.name ? makeSlug(name) : existing.slug;
    const { rows: [col] } = await pool.query(
      `UPDATE collections SET
        name=COALESCE($1,name), slug=$2, description=COALESCE($3,description),
        is_featured=COALESCE($4,is_featured), sort_order=COALESCE($5,sort_order),
        is_active=COALESCE($6,is_active), seo_title=COALESCE($7,seo_title),
        seo_desc=COALESCE($8,seo_desc), updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name||null, slug, description||null, is_featured??null, sort_order??null,
       is_active??null, seo_title||null, seo_desc||null, req.params.id]
    );
    await cache.del('collections:all');
    success(res, col, 'Collection updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE collections SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]
    );
    if (!rowCount) return error(res, 'Collection not found', 404);
    await cache.del('collections:all');
    success(res, {}, 'Collection deleted');
  } catch (e) { error(res, e.message); }
});

router.post('/:id/banner', authenticate, authorize(['super_admin','admin','manager']),
  upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 422);
    const { rows } = await pool.query(
      `UPDATE collections SET banner_url=$1, thumbnail_url=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [req.file.path, req.file.path.replace('/upload/','/upload/w_400,q_auto/'), req.params.id]
    );
    if (!rows.length) return error(res, 'Collection not found', 404);
    await cache.del('collections:all');
    success(res, { banner_url: rows[0].banner_url }, 'Banner uploaded');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
