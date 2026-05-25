const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const logger = require('../../config/logger');
const crypto = require('crypto');

router.get('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM webhooks ORDER BY created_at DESC`);
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.post('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { url, events } = req.body;
    if (!url || !events?.length) return error(res, 'url and events[] required', 422);
    const secret = crypto.randomBytes(32).toString('hex');
    const { rows: [hook] } = await pool.query(
      `INSERT INTO webhooks (url, events, secret) VALUES ($1,$2,$3) RETURNING *`,
      [url, JSON.stringify(events), secret]
    );
    created(res, hook, 'Webhook registered');
  } catch (e) { error(res, e.message); }
});

router.put('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { url, events, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE webhooks SET
        url       = COALESCE($1, url),
        events    = COALESCE($2, events),
        is_active = COALESCE($3, is_active),
        updated_at = NOW()
       WHERE id=$4 RETURNING *`,
      [url||null, events?JSON.stringify(events):null, is_active??null, req.params.id]
    );
    if (!rows.length) return error(res, 'Webhook not found', 404);
    success(res, rows[0], 'Webhook updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM webhooks WHERE id=$1`, [req.params.id]);
    if (!rowCount) return error(res, 'Webhook not found', 404);
    success(res, {}, 'Webhook deleted');
  } catch (e) { error(res, e.message); }
});

const triggerWebhooks = async (event, payload) => {
  try {
    const { rows: hooks } = await pool.query(
      `SELECT * FROM webhooks WHERE is_active=true AND (events @> $1 OR events @> '["*"]')`,
      [JSON.stringify([event])]
    );
    for (const hook of hooks) {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = crypto.createHmac('sha256', hook.secret||'').update(body).digest('hex');
      try {
        const response = await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'X-Webhook-Signature':signature, 'X-Webhook-Event':event },
          body,
          signal: AbortSignal.timeout(10000),
        });
        await pool.query(
          `UPDATE webhooks SET last_triggered=NOW(), last_status=$1, fail_count=0 WHERE id=$2`,
          [response.status, hook.id]
        );
      } catch (e) {
        const newCount = (hook.fail_count||0) + 1;
        await pool.query(
          `UPDATE webhooks SET last_triggered=NOW(), last_status=0, fail_count=$1, is_active=$2 WHERE id=$3`,
          [newCount, newCount < 10, hook.id]
        );
        logger.error(`Webhook failed: ${hook.url} — ${e.message}`);
      }
    }
  } catch (e) {
    logger.error('triggerWebhooks error:', e.message);
  }
};

module.exports = router;
module.exports.triggerWebhooks = triggerWebhooks;
