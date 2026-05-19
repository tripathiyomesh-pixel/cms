const router = require('express').Router();
const db     = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');

// ── HELPERS (used by other modules to create notifications) ──
async function createNotification({ user_id, type, title, body, icon='bell', color='blue', link, resource, resource_id }) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id,type,title,body,icon,color,link,resource,resource_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [user_id, type, title, body||null, icon, color, link||null, resource||null, resource_id||null]
    );
  } catch(e) { console.warn('Notification creation failed:', e.message); }
}

// Create for all admins/super_admins
async function notifyAdmins({ type, title, body, icon, color, link, resource, resource_id }) {
  try {
    const [admins] = await db.query(
      `SELECT id FROM users WHERE role IN ('super_admin','admin','boutique_manager') AND is_active=true`
    );
    for (const admin of admins) {
      await createNotification({ user_id:admin.id, type, title, body, icon, color, link, resource, resource_id });
    }
  } catch(e) { console.warn('notifyAdmins failed:', e.message); }
}

module.exports.createNotification = createNotification;
module.exports.notifyAdmins       = notifyAdmins;

// ── GET notifications for current user ──────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit) || 20;
    const unread = req.query.unread === 'true';
    let q = `SELECT * FROM notifications WHERE user_id=$1`;
    if (unread) q += ` AND is_read=false`;
    q += ` ORDER BY created_at DESC LIMIT ${limit}`;
    const [rows] = await db.query(q, [req.user.id]);
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false`, [req.user.id]
    );
    res.json({ success:true, data:rows, unread_count:parseInt(count) });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── MARK as read ─────────────────────────────────────────────
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await db.query(`UPDATE notifications SET is_read=true WHERE user_id=$1`, [req.user.id]);
    } else {
      await db.query(`UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    }
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── DELETE notification ──────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(`DELETE FROM notifications WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── GET preferences ──────────────────────────────────────────
router.get('/prefs', authenticate, async (req, res) => {
  try {
    let [[prefs]] = await db.query(`SELECT * FROM notification_prefs WHERE user_id=$1`, [req.user.id]);
    if (!prefs) {
      const [rows] = await db.query(
        `INSERT INTO notification_prefs (user_id) VALUES ($1) RETURNING *`, [req.user.id]
      );
      prefs = rows[0];
    }
    res.json({ success:true, data:prefs });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── UPDATE preferences ───────────────────────────────────────
router.put('/prefs', authenticate, async (req, res) => {
  try {
    const { new_enquiry, new_appointment, new_order, low_stock, gold_rate_change, system_alerts } = req.body;
    await db.query(
      `INSERT INTO notification_prefs (user_id, new_enquiry, new_appointment, new_order, low_stock, gold_rate_change, system_alerts)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET
         new_enquiry=$2, new_appointment=$3, new_order=$4,
         low_stock=$5, gold_rate_change=$6, system_alerts=$7, updated_at=NOW()`,
      [req.user.id, new_enquiry, new_appointment, new_order, low_stock, gold_rate_change, system_alerts]
    );
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports.router = router;
