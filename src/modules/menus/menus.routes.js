const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const slugify  = require('slugify');

router.get('/', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('menus:all');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`SELECT * FROM menus ORDER BY location ASC, name ASC`);
    await cache.set('menus:all', rows, 600);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/location/:location', async (req, res) => {
  try {
    const key = `menus:loc:${req.params.location}`;
    const cached = await cache.get(key);
    if (cached) return success(res, cached);
    const { rows } = await pool.query(
      `SELECT * FROM menus WHERE location=$1 AND is_active=true LIMIT 1`,
      [req.params.location]
    );
    if (!rows.length) return error(res, 'Menu not found', 404);
    await cache.set(key, rows[0], 600);
    success(res, rows[0]);
  } catch (e) { error(res, e.message); }
});

router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, location = 'header', items = [] } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = slugify(name, { lower: true, strict: true });
    const { rows } = await pool.query(
      `INSERT INTO menus (name, slug, location, items) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, slug, location, JSON.stringify(items)]
    );
    await cache.delPattern('menus:*');
    created(res, rows[0]);
  } catch (e) { error(res, e.message); }
});

router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, location, items, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE menus SET
        name      = COALESCE($1, name),
        location  = COALESCE($2, location),
        items     = COALESCE($3, items),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
       WHERE id=$5 RETURNING *`,
      [name||null, location||null, items ? JSON.stringify(items) : null, is_active??null, req.params.id]
    );
    if (!rows.length) return error(res, 'Menu not found', 404);
    await cache.delPattern('menus:*');
    success(res, rows[0], 'Menu updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM menus WHERE id=$1`, [req.params.id]);
    if (!rowCount) return error(res, 'Menu not found', 404);
    await cache.delPattern('menus:*');
    success(res, {}, 'Menu deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
