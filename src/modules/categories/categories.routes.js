const express  = require('express');
const router   = express.Router();
const slugify  = require('slugify');
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

const buildTree = (cats, parentId = null) =>
  cats.filter(c => (c.parent_id || null) == parentId)
      .map(c => ({ ...c, children: buildTree(cats, c.id) }));

router.get('/tree', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('categories:tree');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(
      `SELECT * FROM categories WHERE is_active=true ORDER BY sort_order ASC, name ASC`
    );
    const tree = buildTree(rows);
    await cache.set('categories:tree', tree, 600);
    success(res, tree);
  } catch (e) { error(res, e.message); }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM categories ORDER BY sort_order ASC, name ASC`
    );
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM categories WHERE id=$1 LIMIT 1`, [req.params.id]);
    if (!rows.length) return error(res, 'Category not found', 404);
    const { rows: children } = await pool.query(
      `SELECT * FROM categories WHERE parent_id=$1 ORDER BY sort_order ASC`, [req.params.id]
    );
    success(res, { ...rows[0], children });
  } catch (e) { error(res, e.message); }
});

router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, parent_id, description, sort_order=0, image_url, seo_title, seo_desc } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = slugify(name, { lower:true, strict:true });
    const { rows: [cat] } = await pool.query(
      `INSERT INTO categories (name,slug,parent_id,description,sort_order,image_url,seo_title,seo_desc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, slug, parent_id||null, description||null, sort_order, image_url||null, seo_title||null, seo_desc||null]
    );
    await cache.del('categories:tree');
    created(res, cat, 'Category created');
  } catch (e) { error(res, e.message); }
});

router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { rows: [existing] } = await pool.query(`SELECT * FROM categories WHERE id=$1`, [req.params.id]);
    if (!existing) return error(res, 'Category not found', 404);
    const { name, parent_id, description, sort_order, image_url, is_active, seo_title, seo_desc } = req.body;
    const slug = name && name !== existing.name ? slugify(name, { lower:true, strict:true }) : existing.slug;
    const { rows: [cat] } = await pool.query(
      `UPDATE categories SET
        name=COALESCE($1,name), slug=$2, parent_id=COALESCE($3,parent_id),
        description=COALESCE($4,description), sort_order=COALESCE($5,sort_order),
        image_url=COALESCE($6,image_url), is_active=COALESCE($7,is_active),
        seo_title=COALESCE($8,seo_title), seo_desc=COALESCE($9,seo_desc), updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name||null, slug, parent_id??existing.parent_id, description||null, sort_order??null,
       image_url||null, is_active??null, seo_title||null, seo_desc||null, req.params.id]
    );
    await cache.del('categories:tree');
    success(res, cat, 'Category updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows: [cat] } = await pool.query(`SELECT * FROM categories WHERE id=$1`, [req.params.id]);
    if (!cat) return error(res, 'Category not found', 404);
    await pool.query(`UPDATE categories SET parent_id=$1 WHERE parent_id=$2`, [cat.parent_id, cat.id]);
    await pool.query(`DELETE FROM categories WHERE id=$1`, [req.params.id]);
    await cache.del('categories:tree');
    success(res, {}, 'Category deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
