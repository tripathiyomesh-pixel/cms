const express = require('express');
const { DataTypes, Op } = require('sequelize');
const sequelize = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

const Setting = sequelize.define('Setting', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key:       { type: DataTypes.STRING(200), unique: true, allowNull: false },
  value:     { type: DataTypes.JSON },
  group:     { type: DataTypes.STRING(100), defaultValue: 'general' },
  label:     { type: DataTypes.STRING(200) },
  type:      { type: DataTypes.ENUM('text','number','boolean','select','json','image','color'), defaultValue: 'text' },
  options:   { type: DataTypes.JSON },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'settings', paranoid: false, timestamps: true });

const router = express.Router();

// GET /settings — all settings (admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const { group } = req.query;
    const where = group ? { group } : {};
    const settings = await Setting.findAll({ where, order: [['group', 'ASC'], ['key', 'ASC']] });
    const map = {};
    settings.forEach(s => {
      if (!map[s.group]) map[s.group] = [];
      map[s.group].push(s);
    });
    success(res, map);
  } catch (e) { error(res, e.message); }
});

// GET /settings/public — public settings for frontend (no auth)
router.get('/public', async (req, res) => {
  try {
    const cached = await cache.get('settings:public');
    if (cached) return success(res, cached);
    const settings = await Setting.findAll({ where: { is_public: true } });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    await cache.set('settings:public', map, 300);
    success(res, map);
  } catch (e) { error(res, e.message); }
});

// GET /settings/:key — single setting
router.get('/:key', authenticate, async (req, res) => {
  try {
    const s = await Setting.findOne({ where: { key: req.params.key } });
    if (!s) return error(res, 'Setting not found', 404);
    success(res, s);
  } catch (e) { error(res, e.message); }
});

// PUT /settings/:key — upsert a setting
router.put('/:key', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { value, label, type, group, options, is_public } = req.body;
    const [s] = await Setting.upsert({
      key: req.params.key, value, label, type, group, options, is_public,
    });
    await cache.delPattern('settings:*');
    success(res, s, 'Setting saved');
  } catch (e) { error(res, e.message); }
});

// PUT /settings — bulk upsert
router.put('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) return error(res, 'settings array required', 422);
    for (const s of settings) {
      await Setting.upsert({ key: s.key, value: s.value, group: s.group || 'general', label: s.label, type: s.type, is_public: s.is_public });
    }
    await cache.delPattern('settings:*');
    success(res, {}, `${settings.length} settings saved`);
  } catch (e) { error(res, e.message); }
});

// DELETE /settings/:key
router.delete('/:key', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const s = await Setting.findOne({ where: { key: req.params.key } });
    if (!s) return error(res, 'Setting not found', 404);
    await s.destroy();
    await cache.delPattern('settings:*');
    success(res, {}, 'Setting deleted');
  } catch (e) { error(res, e.message); }
});

router.post('/bulk', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) return res.status(422).json({ success:false, message:'settings must be an array' });
    for (const s of settings) {
      if (!s.key) continue;
      await Setting.upsert({ key: s.key, value: String(s.value ?? ''), is_public: false });
    }
    // Clear storefront cache so template change takes effect immediately
    try { 
      const redis = require('../../config/redis');
      await redis.cache.del('storefront:store');
    } catch(e) { /* redis optional */ }
    return res.json({ success:true, message:settings.length + ' settings saved' });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
// Appearance settings endpoint
router.get('/appearance', authenticate, async (req, res) => {
  try {
    const keys = ['theme', 'sidebar_collapsed', 'primary_color', 'logo_url', 'favicon_url', 'store_name', 'date_format', 'currency_display'];
    const settings = await Setting.findAll({ where: { key: keys } });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success: true, data: map });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PAGE BUILDER — get all customization settings ───────────
router.get('/page-builder', authenticate, async (req, res) => {
  try {
    const keys = [
      // Header
      'header_logo_url','header_logo_text','header_show_topbar','header_topbar_text','header_topbar_bg',
      'header_nav_style','header_show_whatsapp','header_whatsapp_position',
      // Hero
      'hero_layout','hero_overlay_opacity','hero_show_stats','hero_autoplay','hero_autoplay_interval',
      // Product grid
      'grid_columns','grid_card_style','grid_show_price','grid_show_quick_enquire','grid_show_new_badge','grid_sort_default',
      // Filters
      'filter_position','filter_style','filter_show_price','filter_show_carat','filter_show_color','filter_show_clarity','filter_show_cert',
      // Footer
      'footer_columns','footer_show_newsletter','footer_show_social','footer_bg_color',
      // Colors
      'color_accent','color_background','color_text','button_style','font_heading','font_body',
      // Storefront template
      'storefront_template',
    ];
    const [rows] = await db.query(`SELECT key,value FROM settings WHERE key = ANY($1)`, [keys]);
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });
    res.json({ success: true, data: map });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PAGE CONTENT — save/load page builder output ────────────
router.get('/page/:page', async (req, res) => {
  try {
    const key = `page_content_${req.params.page}`;
    const [rows] = await db.query('SELECT value FROM settings WHERE key=$1',[key]);
    const val = rows[0]?.value;
    res.json({ success:true, data: val ? (typeof val==='string'?JSON.parse(val):val) : null });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/page/:page', authenticate, async (req, res) => {
  try {
    const key   = `page_content_${req.params.page}`;
    // Accept both JSON array (new builder) and {html,css} (legacy GrapesJS)
    const value = JSON.stringify(req.body);
    const [ex]  = await db.query('SELECT id FROM settings WHERE key=$1',[key]);
    if (ex.length) {
      await db.query('UPDATE settings SET value=$1::jsonb, updated_at=NOW() WHERE key=$2',[value,key]);
    } else {
      await db.query(
        'INSERT INTO settings (id,key,value,is_public,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2::jsonb,true,NOW(),NOW())',
        [key, value]
      );
    }
    try { const redis=require('../../config/redis'); await redis.cache.del(`page:${req.params.page}`); } catch{}
    res.json({ success:true, message:'Page saved' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});
