const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const slugify = require('slugify');

const Menu = sequelize.define('Menu', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  slug:      { type: DataTypes.STRING(100), unique: true },
  location:  { type: DataTypes.ENUM('header','footer','sidebar','mobile','mega'), defaultValue: 'header' },
  items:     { type: DataTypes.JSON, defaultValue: [] },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'menus', paranoid: false, timestamps: true });

const router = express.Router();

// GET /menus — all menus
router.get('/', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('menus:all');
    if (cached) return success(res, cached);
    const menus = await Menu.findAll({ order: [['location', 'ASC'], ['name', 'ASC']] });
    await cache.set('menus:all', menus, 600);
    success(res, menus);
  } catch (e) { error(res, e.message); }
});

// GET /menus/location/:location — for frontend rendering
router.get('/location/:location', async (req, res) => {
  try {
    const key = `menus:loc:${req.params.location}`;
    const cached = await cache.get(key);
    if (cached) return success(res, cached);
    const menu = await Menu.findOne({ where: { location: req.params.location, is_active: true } });
    if (!menu) return error(res, 'Menu not found', 404);
    await cache.set(key, menu, 600);
    success(res, menu);
  } catch (e) { error(res, e.message); }
});

// POST /menus
router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, location, items = [] } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = slugify(name, { lower: true, strict: true });
    const menu = await Menu.create({ name, slug, location, items });
    await cache.delPattern('menus:*');
    created(res, menu);
  } catch (e) { error(res, e.message); }
});

// PUT /menus/:id
router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return error(res, 'Menu not found', 404);
    await menu.update(req.body);
    await cache.delPattern('menus:*');
    success(res, menu, 'Menu updated');
  } catch (e) { error(res, e.message); }
});

// DELETE /menus/:id
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return error(res, 'Menu not found', 404);
    await menu.destroy();
    await cache.delPattern('menus:*');
    success(res, {}, 'Menu deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
