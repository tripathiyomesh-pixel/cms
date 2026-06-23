const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

router.get('/', authenticate, async (req, res) => {
  try {
    const { group } = req.query;
    const q = group
      ? `SELECT * FROM settings WHERE group_name=$1 ORDER BY group_name,key`
      : `SELECT * FROM settings ORDER BY group_name,key`;
    const { rows } = await pool.query(q, group ? [group] : []);
    const map = {};
    rows.forEach(s => {
      const g = s.group_name || 'general';
      if (!map[g]) map[g] = [];
      map[g].push(s);
    });
    success(res, map);
  } catch (e) { error(res, e.message); }
});

router.get('/public', async (req, res) => {
  try {
    const cached = await cache.get('settings:public');
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`SELECT key, value FROM settings WHERE is_public=true`);
    const map = {};
    rows.forEach(s => { map[s.key] = s.value; });
    await cache.set('settings:public', map, 300);
    success(res, map);
  } catch (e) { error(res, e.message); }
});

// ── BULK UPSERT (used by ThemeEditor, ERPSettings, etc.) ─────
router.post('/bulk', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { settings: items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return error(res, 'settings array required', 422);
    }

    // SEO and theme keys that should be public so the storefront can read them
    const PUBLIC_KEYS = new Set([
      'store_name','store_description','store_keywords','store_phone','store_whatsapp',
      'store_email','store_address','store_currency','store_timezone','store_country',
      'og_image','favicon_url',
      'theme_id','theme_header_style','theme_footer_style','theme_product_layout',
      'theme_listing_layout','theme_color_primary','theme_color_accent',
      'theme_color_background','theme_color_text','theme_font_heading','theme_font_body',
      'theme_font_size_base','theme_font_heading_weight','theme_border_radius',
      'theme_btn_radius','theme_max_width','theme_hero_height','theme_hero_overlay',
      'theme_hero_text_position','theme_sticky_header','theme_show_gold_ticker',
      'theme_show_currency_switcher','theme_custom_css',
      'erp_sync_enabled','erp_sync_interval',
    ]);

    const results = [];
    for (const item of items) {
      if (!item.key) continue;
      const value    = typeof item.value === 'string' ? item.value : JSON.stringify(item.value ?? '');
      const isPublic = item.is_public !== undefined ? item.is_public : PUBLIC_KEYS.has(item.key);
      const group    = item.group || guessGroup(item.key);

      const { rows: [s] } = await pool.query(
        `INSERT INTO settings (key, value, group_name, label, type, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE
           SET value=$2,
               group_name=COALESCE($3, settings.group_name),
               is_public=COALESCE($6, settings.is_public),
               updated_at=NOW()
         RETURNING key, value, group_name, is_public`,
        [item.key, value, group, item.label || null, item.type || 'text', isPublic]
      );
      results.push(s);
    }

    // Bust the public cache so storefront sees changes immediately
    await cache.del('settings:public');

    success(res, { saved: results.length, settings: results });
  } catch (e) { error(res, e.message); }
});

function guessGroup(key) {
  if (key.startsWith('theme_') || key === 'theme_id') return 'theme';
  if (key.startsWith('smtp_') || key.startsWith('email_')) return 'email';
  if (key.startsWith('erp_')) return 'erp';
  if (key.startsWith('store_') || ['og_image','favicon_url'].includes(key)) return 'general';
  if (key.startsWith('seo_') || key.startsWith('meta_')) return 'seo';
  return 'general';
}

router.get('/page/:pageId', async (req, res) => {
  try {
    const key = `page:${req.params.pageId}`;
    const cached = await cache.get(`storefront:${key}`);
    if (cached) return success(res, cached);
    const { rows } = await pool.query(`SELECT value FROM settings WHERE key=$1 LIMIT 1`, [key]);
    const data = rows[0]?.value || null;
    if (data) await cache.set(`storefront:${key}`, data, 120);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

router.post('/page/:pageId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const key = `page:${req.params.pageId}`;
    const { rows: [s] } = await pool.query(`
      INSERT INTO settings (key, value, group_name, label, type, is_public)
      VALUES ($1,$2,'pages',$3,'json',true)
      ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()
      RETURNING *`,
      [key, JSON.stringify(req.body), req.params.pageId]
    );
    await cache.del(`storefront:${key}`);
    success(res, s);
  } catch (e) { error(res, e.message); }
});

router.get('/:key', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM settings WHERE key=$1 LIMIT 1`, [req.params.key]);
    if (!rows.length) return error(res, 'Setting not found', 404);
    success(res, rows[0]);
  } catch (e) { error(res, e.message); }
});

router.put('/:key', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { value, group, label, type, options, is_public } = req.body;
    const { rows: [s] } = await pool.query(`
      INSERT INTO settings (key, value, group_name, label, type, options, is_public)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (key) DO UPDATE
        SET value=$2, group_name=COALESCE($3,settings.group_name),
            label=COALESCE($4,settings.label), type=COALESCE($5,settings.type),
            options=COALESCE($6,settings.options), is_public=COALESCE($7,settings.is_public),
            updated_at=NOW()
      RETURNING *`,
      [req.params.key, JSON.stringify(value), group||'general', label||null, type||'text', options?JSON.stringify(options):null, is_public??false]
    );
    if (is_public) await cache.del('settings:public');
    success(res, s);
  } catch (e) { error(res, e.message); }
});

router.delete('/:key', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM settings WHERE key=$1`, [req.params.key]);
    if (!rowCount) return error(res, 'Setting not found', 404);
    success(res, { deleted: true });
  } catch (e) { error(res, e.message); }
});

module.exports = router;
