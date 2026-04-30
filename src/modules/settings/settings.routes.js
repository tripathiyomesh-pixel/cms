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
}, { tableName: 'settings' });

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

module.exports = router;
