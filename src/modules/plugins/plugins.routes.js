const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

router.get('/marketplace', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:marketplace');
    if (cached) return success(res, cached);
    const { rows: plugins } = await pool.query(`SELECT * FROM plugins ORDER BY name ASC`);
    const { rows: installed } = await pool.query(`SELECT * FROM installed_plugins`);
    const installedMap = {};
    installed.forEach(ip => { installedMap[ip.plugin_id] = ip; });
    const data = plugins.map(p => ({
      ...p,
      installed:  !!installedMap[p.id],
      is_active:  installedMap[p.id]?.is_active || false,
      install_id: installedMap[p.id]?.id || null,
      settings:   installedMap[p.id]?.settings || {},
    }));
    await cache.set('plugins:marketplace', data, 600);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

router.get('/active', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:active');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`
      SELECT p.*, ip.settings, ip.id as install_id
      FROM plugins p
      JOIN installed_plugins ip ON ip.plugin_id = p.id
      WHERE ip.is_active = true`);
    await cache.set('plugins:active', rows, 300);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.post('/install/:pluginId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows: [plugin] } = await pool.query(`SELECT * FROM plugins WHERE id=$1`, [req.params.pluginId]);
    if (!plugin) return error(res, 'Plugin not found', 404);
    const { rows: exists } = await pool.query(`SELECT id FROM installed_plugins WHERE plugin_id=$1`, [plugin.id]);
    if (exists.length) return error(res, 'Plugin already installed', 409);
    const defaults = {};
    if (plugin.config_schema) {
      Object.entries(plugin.config_schema).forEach(([k,v]) => { defaults[k] = v.default ?? null; });
    }
    const { rows: [inst] } = await pool.query(
      `INSERT INTO installed_plugins (plugin_id, is_active, settings) VALUES ($1,true,$2) RETURNING *`,
      [plugin.id, JSON.stringify(defaults)]
    );
    await cache.delPattern('plugins:*');
    created(res, { ...plugin, install_id: inst.id, is_active: true, settings: inst.settings }, 'Plugin installed');
  } catch (e) { error(res, e.message); }
});

router.post('/uninstall/:pluginId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM installed_plugins WHERE plugin_id=$1`, [req.params.pluginId]);
    if (!rowCount) return error(res, 'Plugin not installed', 404);
    await cache.delPattern('plugins:*');
    success(res, {}, 'Plugin uninstalled');
  } catch (e) { error(res, e.message); }
});

router.put('/toggle/:pluginId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows: [inst] } = await pool.query(`SELECT * FROM installed_plugins WHERE plugin_id=$1`, [req.params.pluginId]);
    if (!inst) return error(res, 'Plugin not installed', 404);
    const { rows: [updated] } = await pool.query(
      `UPDATE installed_plugins SET is_active=$1 WHERE plugin_id=$2 RETURNING *`,
      [!inst.is_active, req.params.pluginId]
    );
    await cache.delPattern('plugins:*');
    success(res, { plugin_id: updated.plugin_id, is_active: updated.is_active });
  } catch (e) { error(res, e.message); }
});

router.put('/settings/:pluginId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows: [inst] } = await pool.query(`SELECT * FROM installed_plugins WHERE plugin_id=$1`, [req.params.pluginId]);
    if (!inst) return error(res, 'Plugin not installed', 404);
    const merged = { ...(inst.settings||{}), ...req.body };
    const { rows: [updated] } = await pool.query(
      `UPDATE installed_plugins SET settings=$1 WHERE plugin_id=$2 RETURNING *`,
      [JSON.stringify(merged), req.params.pluginId]
    );
    await cache.delPattern('plugins:*');
    success(res, updated, 'Settings updated');
  } catch (e) { error(res, e.message); }
});

router.get('/product-fields', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:product-fields');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.icon, p.color, p.product_fields
      FROM plugins p JOIN installed_plugins ip ON ip.plugin_id=p.id
      WHERE ip.is_active=true AND jsonb_array_length(COALESCE(p.product_fields,'[]'::jsonb)) > 0`);
    const fields = rows.map(p => ({ plugin_id:p.id, plugin_name:p.name, icon:p.icon, color:p.color, fields:p.product_fields }));
    await cache.set('plugins:product-fields', fields, 300);
    success(res, fields);
  } catch (e) { error(res, e.message); }
});

router.post('/product/:productId/extension', authenticate, async (req, res) => {
  try {
    const { plugin_id, data } = req.body;
    if (!plugin_id || !data) return error(res, 'plugin_id and data required', 422);
    const { rows: [ext] } = await pool.query(`
      INSERT INTO product_extensions (product_id, plugin_id, data)
      VALUES ($1,$2,$3)
      ON CONFLICT (product_id, plugin_id) DO UPDATE SET data=$3, updated_at=NOW()
      RETURNING *`,
      [req.params.productId, plugin_id, JSON.stringify(data)]
    );
    success(res, ext);
  } catch (e) { error(res, e.message); }
});

router.get('/product/:productId/extensions', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM product_extensions WHERE product_id=$1`, [req.params.productId]);
    const result = {};
    rows.forEach(e => { result[e.plugin_id] = e.data; });
    success(res, result);
  } catch (e) { error(res, e.message); }
});

module.exports = router;
