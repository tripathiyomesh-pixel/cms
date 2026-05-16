const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

// ─── THEMES MODEL ──────────────────────────────────────────────
const Theme = sequelize.define('Theme', {
  id:               { type: DataTypes.STRING(50), primaryKey: true },
  name:             { type: DataTypes.STRING(100), allowNull: false },
  description:      DataTypes.TEXT,
  preview_url:      DataTypes.TEXT,
  category:         { type: DataTypes.ENUM('luxury','minimal','bridal','catalogue','ecommerce','custom'), defaultValue: 'minimal' },
  is_premium:       { type: DataTypes.BOOLEAN, defaultValue: false },
  price:            { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  version:          { type: DataTypes.STRING(20), defaultValue: '1.0.0' },
  settings_schema:  { type: DataTypes.JSON, defaultValue: {} },
  default_settings: { type: DataTypes.JSON, defaultValue: {} },
  is_active:        { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'themes', paranoid: false, timestamps: true });

// ─── PAGE SECTIONS MODEL ───────────────────────────────────────
const PageSection = sequelize.define('PageSection', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  page:         { type: DataTypes.STRING(100), defaultValue: 'homepage' },
  section_key:  { type: DataTypes.STRING(100), allowNull: false },
  section_type: { type: DataTypes.STRING(100), allowNull: false },
  content:      { type: DataTypes.JSON, defaultValue: {} },
  is_visible:   { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order:   { type: DataTypes.INTEGER, defaultValue: 0 },
  country_code: { type: DataTypes.STRING(5) },
}, { tableName: 'page_sections', paranoid: false, timestamps: true });

const router = express.Router();

// ─── THEMES ROUTES ─────────────────────────────────────────────
router.get('/themes', authenticate, async (req, res) => {
  try {
    const themes = await Theme.findAll({ order: [['name', 'ASC']] });
    success(res, themes);
  } catch (e) { error(res, e.message); }
});

router.get('/themes/active', async (req, res) => {
  try {
    const cached = await cache.get('theme:active');
    if (cached) return success(res, cached);
    const theme = await Theme.findOne({ where: { is_active: true } });
    if (theme) await cache.set('theme:active', theme, 600);
    success(res, theme);
  } catch (e) { error(res, e.message); }
});

router.put('/themes/:id/activate', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    await Theme.update({ is_active: false }, { where: {} });
    const theme = await Theme.findByPk(req.params.id);
    if (!theme) return error(res, 'Theme not found', 404);
    await theme.update({ is_active: true });
    await cache.delPattern('theme:*');
    success(res, theme, 'Theme activated');
  } catch (e) { error(res, e.message); }
});

// ─── PAGE SECTIONS ROUTES ──────────────────────────────────────
router.get('/page-sections', async (req, res) => {
  try {
    const { page = 'homepage' } = req.query;
    const key = `pages:${page}`;
    const cached = await cache.get(key);
    if (cached) return success(res, cached);
    const sections = await PageSection.findAll({
      where: { page, is_visible: true },
      order: [['sort_order', 'ASC']],
    });
    await cache.set(key, sections, 300);
    success(res, sections);
  } catch (e) { error(res, e.message); }
});

router.get('/page-sections/all', authenticate, async (req, res) => {
  try {
    const { page = 'homepage' } = req.query;
    const sections = await PageSection.findAll({ where: { page }, order: [['sort_order', 'ASC']] });
    success(res, sections);
  } catch (e) { error(res, e.message); }
});

router.post('/page-sections', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const section = await PageSection.create(req.body);
    await cache.delPattern('pages:*');
    created(res, section);
  } catch (e) { error(res, e.message); }
});

router.put('/page-sections/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const section = await PageSection.findByPk(req.params.id);
    if (!section) return error(res, 'Section not found', 404);
    await section.update(req.body);
    await cache.delPattern('pages:*');
    success(res, section, 'Section updated');
  } catch (e) { error(res, e.message); }
});

router.put('/page-sections/reorder', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return error(res, 'sections array required', 422);
    for (const s of sections) {
      await PageSection.update({ sort_order: s.sort_order, is_visible: s.is_visible }, { where: { id: s.id } });
    }
    await cache.delPattern('pages:*');
    success(res, {}, 'Sections reordered');
  } catch (e) { error(res, e.message); }
});

router.delete('/page-sections/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const section = await PageSection.findByPk(req.params.id);
    if (!section) return error(res, 'Section not found', 404);
    await section.destroy();
    await cache.delPattern('pages:*');
    success(res, {}, 'Section deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
