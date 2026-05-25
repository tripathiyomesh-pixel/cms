const express   = require('express');
const router    = express.Router();
const sequelize = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

// ── POST /api/marketing/newsletter — public subscribe ────────────────────────
router.post('/newsletter', async (req, res) => {
  try {
    const { email, name, source = 'website' } = req.body;
    if (!email || !email.includes('@')) return error(res, 'Valid email required', 400);

    await sequelize.query(`
      INSERT INTO newsletter_subscribers (email, name, source, subscribed_at, is_active)
      VALUES ($1, $2, $3, NOW(), true)
      ON CONFLICT (email) DO UPDATE
        SET is_active = true,
            name = COALESCE(EXCLUDED.name, newsletter_subscribers.name)
    `, { bind: [email.toLowerCase().trim(), name || null, source], type: sequelize.QueryTypes.INSERT });

    success(res, { subscribed: true });
  } catch (e) { error(res, e.message); }
});

// ── POST /api/marketing/newsletter/unsubscribe ────────────────────────────────
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email required', 400);
    await sequelize.query(`
      UPDATE newsletter_subscribers
      SET is_active = false, unsubscribed_at = NOW()
      WHERE email = $1
    `, { bind: [email.toLowerCase().trim()], type: sequelize.QueryTypes.UPDATE });
    success(res, { unsubscribed: true });
  } catch (e) { error(res, e.message); }
});

// ── GET /api/marketing/newsletter — admin: list subscribers ──────────────────
router.get('/newsletter', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { page = 1, limit = 100, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = active === 'true' ? 'WHERE is_active = true' : active === 'false' ? 'WHERE is_active = false' : '';

    const [rows, countRows] = await Promise.all([
      sequelize.query(`
        SELECT id, email, name, source, is_active, subscribed_at, unsubscribed_at
        FROM newsletter_subscribers ${where}
        ORDER BY subscribed_at DESC LIMIT $1 OFFSET $2
      `, { bind: [parseInt(limit), offset], type: sequelize.QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`, { type: sequelize.QueryTypes.SELECT }),
    ]);

    success(res, { subscribers: rows, total: parseInt(countRows[0]?.total || 0), page: parseInt(page) });
  } catch (e) { error(res, e.message); }
});

module.exports = router;
