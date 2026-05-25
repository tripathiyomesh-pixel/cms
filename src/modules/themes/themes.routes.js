const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

router.get('/themes', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM themes ORDER BY name ASC`);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/themes/active', async (req, res) => {
  try {
    const cached = await cache.get('theme:active');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`SELECT * FROM themes WHERE is_active=true LIMIT 1`);
    if (rows[0]) await cache.set('theme:active', rows[0], 600);
    success(res, rows[0] || null);
  } catch (e) { error(res, e.message); }
});

router.put('/themes/:id/activate', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    await pool.query(`UPDATE themes SET is_active=false`);
    const { rows } = await pool.query(`UPDATE themes SET is_active=true WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!rows.length) return error(res, 'Theme not found', 404);
    await cache.delPattern('theme:*');
    success(res, rows[0], 'Theme activated');
  } catch (e) { error(res, e.message); }
});

router.get('/page-sections', async (req, res) => {
  try {
    const page = req.query.page || 'homepage';
    const key = `pages:${page}`;
    const cached = await cache.get(key);
    if (cached) return success(res, cached);
    const { rows } = await pool.query(
      `SELECT * FROM page_sections WHERE page=$1 AND is_visible=true ORDER BY sort_order ASC`,
      [page]
    );
    await cache.set(key, rows, 300);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/page-sections/all', authenticate, async (req, res) => {
  try {
    const page = req.query.page || 'homepage';
    const { rows } = await pool.query(
      `SELECT * FROM page_sections WHERE page=$1 ORDER BY sort_order ASC`, [page]
    );
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.post('/page-sections', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { page='homepage', section_key, section_type, content={}, is_visible=true, sort_order=0, country_code } = req.body;
    const { rows: [s] } = await pool.query(
      `INSERT INTO page_sections (page,section_key,section_type,content,is_visible,sort_order,country_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [page, section_key, section_type, JSON.stringify(content), is_visible, sort_order, country_code||null]
    );
    await cache.delPattern('pages:*');
    created(res, s);
  } catch (e) { error(res, e.message); }
});

router.put('/page-sections/reorder', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return error(res, 'sections array required', 422);
    for (const s of sections) {
      await pool.query(
        `UPDATE page_sections SET sort_order=$1, is_visible=$2 WHERE id=$3`,
        [s.sort_order, s.is_visible, s.id]
      );
    }
    await cache.delPattern('pages:*');
    success(res, {}, 'Sections reordered');
  } catch (e) { error(res, e.message); }
});

router.put('/page-sections/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { content, is_visible, sort_order, section_type } = req.body;
    const { rows } = await pool.query(
      `UPDATE page_sections SET
        content      = COALESCE($1, content),
        is_visible   = COALESCE($2, is_visible),
        sort_order   = COALESCE($3, sort_order),
        section_type = COALESCE($4, section_type),
        updated_at   = NOW()
       WHERE id=$5 RETURNING *`,
      [content?JSON.stringify(content):null, is_visible??null, sort_order??null, section_type||null, req.params.id]
    );
    if (!rows.length) return error(res, 'Section not found', 404);
    await cache.delPattern('pages:*');
    success(res, rows[0], 'Section updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/page-sections/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM page_sections WHERE id=$1`, [req.params.id]);
    if (!rowCount) return error(res, 'Section not found', 404);
    await cache.delPattern('pages:*');
    success(res, {}, 'Section deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
