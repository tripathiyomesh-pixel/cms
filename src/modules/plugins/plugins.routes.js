const express = require('express');
const { DataTypes } = require('../../database/models');
const sequelize = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

const router = express.Router();

// Define models inline (they're lightweight lookup tables)
const Plugin = sequelize.define('Plugin', {
  id:             { type: DataTypes.STRING(50), primaryKey: true },
  name:           DataTypes.STRING(100),
  description:    DataTypes.TEXT,
  icon:           DataTypes.STRING(50),
  color:          DataTypes.STRING(20),
  version:        DataTypes.STRING(20),
  category:       DataTypes.STRING(50),
  author:         DataTypes.STRING(100),
  is_premium:     DataTypes.BOOLEAN,
  config_schema:  DataTypes.JSON,
  product_fields: DataTypes.JSON,
  validators:     DataTypes.JSON,
}, { tableName: 'plugins', timestamps: true, updatedAt: false, paranoid: false });

const InstalledPlugin = sequelize.define('InstalledPlugin', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  license_id:   DataTypes.UUID,
  plugin_id:    DataTypes.STRING(50),
  is_active:    { type: DataTypes.BOOLEAN, defaultValue: true },
  settings:     { type: DataTypes.JSON, defaultValue: {} },
  installed_at: DataTypes.DATE,
}, { tableName: 'installed_plugins', createdAt: 'installed_at', paranoid: false });

const ProductExtension = sequelize.define('ProductExtension', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: DataTypes.UUID,
  plugin_id:  DataTypes.STRING(50),
  data:       { type: DataTypes.JSON, defaultValue: {} },
}, { tableName: 'product_extensions', paranoid: false });

// ─── GET /plugins/marketplace — list all available plugins ──────
router.get('/marketplace', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:marketplace');
    if (cached) return success(res, cached);

    const allPlugins = await Plugin.findAll({ order: [['name', 'ASC']] });
    const installed  = await InstalledPlugin.findAll();
    const installedMap = {};
    installed.forEach(ip => { installedMap[ip.plugin_id] = ip; });

    const data = allPlugins.map(p => ({
      ...p.toJSON(),
      installed:  !!installedMap[p.id],
      is_active:  installedMap[p.id]?.is_active || false,
      install_id: installedMap[p.id]?.id || null,
      settings:   installedMap[p.id]?.settings || {},
    }));

    await cache.set('plugins:marketplace', data, 600);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// ─── GET /plugins/active — only active plugins (for frontend) ──
router.get('/active', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:active');
    if (cached) return success(res, cached);

    const active = await InstalledPlugin.findAll({ where: { is_active: true } });
    const pluginIds = active.map(a => a.plugin_id);
    const plugins = await Plugin.findAll({ where: { id: pluginIds } });

    const data = plugins.map(p => {
      const inst = active.find(a => a.plugin_id === p.id);
      return { ...p.toJSON(), settings: inst?.settings || {} };
    });

    await cache.set('plugins:active', data, 300);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// ─── POST /plugins/install/:pluginId — install a plugin ─────────
router.post('/install/:pluginId', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const plugin = await Plugin.findByPk(req.params.pluginId);
    if (!plugin) return error(res, 'Plugin not found', 404);

    const exists = await InstalledPlugin.findOne({ where: { plugin_id: plugin.id } });
    if (exists) return error(res, 'Plugin already installed', 409);

    // Build default settings from config_schema
    const defaults = {};
    if (plugin.config_schema) {
      Object.entries(plugin.config_schema).forEach(([key, cfg]) => {
        defaults[key] = cfg.default !== undefined ? cfg.default : null;
      });
    }

    const inst = await InstalledPlugin.create({
      plugin_id: plugin.id,
      is_active: true,
      settings: defaults,
      license_id: null, // TODO: get from license middleware
    });

    await cache.delPattern('plugins:*');
    created(res, { ...plugin.toJSON(), install_id: inst.id, is_active: true, settings: inst.settings }, 'Plugin installed');
  } catch (e) { error(res, e.message); }
});

// ─── POST /plugins/uninstall/:pluginId ──────────────────────────
router.post('/uninstall/:pluginId', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const inst = await InstalledPlugin.findOne({ where: { plugin_id: req.params.pluginId } });
    if (!inst) return error(res, 'Plugin not installed', 404);
    await inst.destroy();
    await cache.delPattern('plugins:*');
    success(res, {}, 'Plugin uninstalled');
  } catch (e) { error(res, e.message); }
});

// ─── PUT /plugins/toggle/:pluginId — activate/deactivate ────────
router.put('/toggle/:pluginId', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const inst = await InstalledPlugin.findOne({ where: { plugin_id: req.params.pluginId } });
    if (!inst) return error(res, 'Plugin not installed', 404);
    await inst.update({ is_active: !inst.is_active });
    await cache.delPattern('plugins:*');
    success(res, { plugin_id: inst.plugin_id, is_active: inst.is_active }, `Plugin ${inst.is_active ? 'activated' : 'deactivated'}`);
  } catch (e) { error(res, e.message); }
});

// ─── PUT /plugins/settings/:pluginId — update plugin config ─────
router.put('/settings/:pluginId', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const inst = await InstalledPlugin.findOne({ where: { plugin_id: req.params.pluginId } });
    if (!inst) return error(res, 'Plugin not installed', 404);
    await inst.update({ settings: { ...inst.settings, ...req.body } });
    await cache.delPattern('plugins:*');
    success(res, inst, 'Settings updated');
  } catch (e) { error(res, e.message); }
});

// ─── GET /plugins/product-fields — merged fields for product form ─
router.get('/product-fields', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('plugins:product-fields');
    if (cached) return success(res, cached);

    const active = await InstalledPlugin.findAll({ where: { is_active: true } });
    const pluginIds = active.map(a => a.plugin_id);
    const plugins = await Plugin.findAll({ where: { id: pluginIds } });

    const fields = [];
    plugins.forEach(p => {
      if (p.product_fields?.length) {
        fields.push({
          plugin_id: p.id,
          plugin_name: p.name,
          icon: p.icon,
          color: p.color,
          fields: p.product_fields,
        });
      }
    });

    await cache.set('plugins:product-fields', fields, 300);
    success(res, fields);
  } catch (e) { error(res, e.message); }
});

// ─── POST /plugins/product/:productId/extension — save ext data ─
router.post('/product/:productId/extension', authenticate, async (req, res) => {
  try {
    const { plugin_id, data } = req.body;
    if (!plugin_id || !data) return error(res, 'plugin_id and data required', 422);

    const [ext, isNew] = await ProductExtension.upsert({
      product_id: req.params.productId,
      plugin_id,
      data,
    });

    success(res, ext, isNew ? 'Extension created' : 'Extension updated');
  } catch (e) { error(res, e.message); }
});

// ─── GET /plugins/product/:productId/extensions — get ext data ──
router.get('/product/:productId/extensions', authenticate, async (req, res) => {
  try {
    const exts = await ProductExtension.findAll({ where: { product_id: req.params.productId } });
    const result = {};
    exts.forEach(e => { result[e.plugin_id] = e.data; });
    success(res, result);
  } catch (e) { error(res, e.message); }
});

module.exports = router;
