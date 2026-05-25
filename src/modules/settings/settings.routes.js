const express   = require('express');
const router    = express.Router();
const sequelize = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

// ── Setting model ─────────────────────────────────────────────────────────────
const { DataTypes } = require('../../database/models');
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

// ── GET /settings — all settings (admin) ─────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { group } = req.query;
    const where = group ? { group } : {};
    const settings = await Setting.findAll({ where, order: [['group','ASC'],['key','ASC']] });
    const map = {};
    settings.forEach(s => {
      if (!map[s.group]) map[s.group] = [];
      map[s.group].push(s);
    });
    success(res, map);
  } catch (e) { error(res, e.message); }
});

// ── GET /settings/public — public settings for storefront (no auth) ───────────
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

// ── GET /settings/page/:pageId — get page builder data (used by storefront) ───
router.get('/page/:pageId', async (req, res) => {
  try {
    const key = `page:${req.params.pageId}`;
    const cached = await cache.get(`storefront:${key}`);
    if (cached) return success(res, cached);

    const s = await Setting.findOne({ where: { key } });
    const data = s ? s.value : null;
    if (data) await cache.set(`storefront:${key}`, data, 120);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// ── POST /settings/page/:pageId — save page builder data ─────────────────────
router.post('/page/:pageId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const key   = `page:${req.params.pageId}`;
    const value = req.body; // JSON array of sections from page builder
    const [s] = await Setting.upsert({
      key, value, group: 'pages', label: req.params.pageId, type: 'json', is_public: true,
    }, { returning: true });
    // Bust storefront cache
    await cache.del(`storefront:${key}`);
    success(res, s);
  } catch (e) { error(res, e.message); }
});

// ── GET /settings/:key — single setting ─────────────────────────────────────
router.get('/:key', authenticate, async (req, res) => {
  try {
    const s = await Setting.findOne({ where: { key: req.params.key } });
    if (!s) return error(res, 'Setting not found', 404);
    success(res, s);
  } catch (e) { error(res, e.message); }
});

// ── PUT /settings/:key — upsert a setting ────────────────────────────────────
router.put('/:key', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { value, group, label, type, options, is_public } = req.body;
    const [s] = await Setting.upsert({
      key: req.params.key, value, group, label, type, options, is_public,
    }, { returning: true });
    // Bust public cache if is_public
    if (is_public) await cache.del('settings:public');
    success(res, s);
  } catch (e) { error(res, e.message); }
});

// ── DELETE /settings/:key ─────────────────────────────────────────────────────
router.delete('/:key', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const s = await Setting.findOne({ where: { key: req.params.key } });
    if (!s) return error(res, 'Setting not found', 404);
    await s.destroy();
    success(res, { deleted: true });
  } catch (e) { error(res, e.message); }
});

module.exports = router;
