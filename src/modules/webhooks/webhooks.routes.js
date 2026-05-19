const express = require('express');
const { DataTypes } = require('../../database/models');
const sequelize = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const logger = require('../../config/logger');
const crypto = require('crypto');

const Webhook = sequelize.define('Webhook', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  url:            { type: DataTypes.TEXT, allowNull: false },
  events:         { type: DataTypes.JSON, defaultValue: [] },
  secret:         { type: DataTypes.STRING(255) },
  is_active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  last_triggered: { type: DataTypes.DATE },
  last_status:    { type: DataTypes.INTEGER },
  fail_count:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'webhooks', paranoid: false, timestamps: true });

const router = express.Router();

// GET /webhooks
router.get('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const hooks = await Webhook.findAll({ order: [['created_at', 'DESC']] });
    success(res, hooks);
  } catch (e) { error(res, e.message); }
});

// POST /webhooks
router.post('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { url, events } = req.body;
    if (!url || !events?.length) return error(res, 'url and events[] required', 422);
    const secret = crypto.randomBytes(32).toString('hex');
    const hook = await Webhook.create({ url, events, secret });
    created(res, hook, 'Webhook registered');
  } catch (e) { error(res, e.message); }
});

// PUT /webhooks/:id
router.put('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const hook = await Webhook.findByPk(req.params.id);
    if (!hook) return error(res, 'Webhook not found', 404);
    await hook.update(req.body);
    success(res, hook, 'Webhook updated');
  } catch (e) { error(res, e.message); }
});

// DELETE /webhooks/:id
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const hook = await Webhook.findByPk(req.params.id);
    if (!hook) return error(res, 'Webhook not found', 404);
    await hook.destroy();
    success(res, {}, 'Webhook deleted');
  } catch (e) { error(res, e.message); }
});

/**
 * Trigger webhooks for an event — call from anywhere in the codebase
 * Usage: triggerWebhooks('product.updated', { id, name, ... })
 */
const triggerWebhooks = async (event, payload) => {
  try {
    const hooks = await Webhook.findAll({ where: { is_active: true } });
    const matching = hooks.filter(h => h.events.includes(event) || h.events.includes('*'));

    for (const hook of matching) {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = crypto.createHmac('sha256', hook.secret || '').update(body).digest('hex');

      try {
        const response = await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });
        await hook.update({ last_triggered: new Date(), last_status: response.status, fail_count: 0 });
      } catch (e) {
        await hook.update({ last_triggered: new Date(), last_status: 0, fail_count: hook.fail_count + 1 });
        logger.error(`Webhook failed: ${hook.url} — ${e.message}`);
        if (hook.fail_count >= 10) {
          await hook.update({ is_active: false });
          logger.warn(`Webhook disabled after 10 failures: ${hook.url}`);
        }
      }
    }
  } catch (e) {
    logger.error('triggerWebhooks error:', e.message);
  }
};

module.exports = router;
module.exports.triggerWebhooks = triggerWebhooks;

/**
 * Available events:
 * product.created, product.updated, product.deleted
 * collection.created, collection.updated
 * order.created, order.status_changed
 * settings.updated
 * media.uploaded
 * plugin.installed, plugin.uninstalled
 * menu.updated
 * page.updated
 */
