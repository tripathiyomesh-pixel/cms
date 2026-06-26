/**
 * Custom Orders — Lead management only
 * Customer submits request → admin sees lead → contacts via WhatsApp
 * Manufacturing happens in Vantix ERP
 */
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];
const { notifyAdmins } = require('../notifications/notifications.routes');

// ── PUBLIC: submit custom order request ──────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email,
      description, inspiration_urls = [],
      metal_preference, stone_preference,
      budget_min, budget_max, currency = 'AED',
      occasion, ring_size
    } = req.body;

    if (!customer_name || !customer_phone)
      return res.status(422).json({ success: false, message: 'Name and phone required' });

    const order_number = 'CUST-' + Date.now().toString(36).toUpperCase();

    const [r] = await db.execute(
      `INSERT INTO custom_orders
        (order_number, customer_name, customer_phone, customer_email,
         description, inspiration_urls, metal_preference, stone_preference,
         budget_min, budget_max, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'INQUIRY') RETURNING id`,
      [order_number, customer_name, customer_phone, customer_email || null,
       description || null, JSON.stringify(inspiration_urls),
       metal_preference || null, stone_preference || null,
       parseFloat(budget_min) || null, parseFloat(budget_max) || null, currency]
    );

    const id = r[0]?.id || r.rows?.[0]?.id;

    // Push to Vantix ERP if configured
    if (process.env.ERP_API_URL && process.env.ERP_WEBHOOK_SECRET) {
      fetch(`${process.env.ERP_API_URL}/crm/leads`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-webhook-secret': process.env.ERP_WEBHOOK_SECRET },
        body: JSON.stringify({ source:'cms_custom_order', order_number, customer_name, customer_phone, customer_email, description, metal_preference, stone_preference, budget_min, budget_max, currency }),
      }).catch(e => console.log('ERP push skipped:', e.message));
    }

    setImmediate(() => notifyAdmins({
      type: 'new_custom_order', icon: 'gem', color: 'gold',
      title: New bespoke request from ${customer_name},
      body: description ? description.slice(0, 100) : 'Custom jewellery request',
      link: '/custom-orders', resource: 'custom_order', resource_id: id,
    }));
    res.json({ success: true, data: { id, order_number }, message: 'Request received. We will contact you shortly.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── ADMIN: list all custom order leads ───────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = "WHERE 1=1";
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (customer_name ILIKE $${params.length} OR order_number ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`; }
    const qp = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(
      `SELECT * FROM custom_orders ${where} ORDER BY created_at DESC LIMIT $${qp.length - 1} OFFSET $${qp.length}`,
      qp
    );
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM custom_orders ${where}`, params);
    res.json({ success: true, data: { data: rows, total: +cnt[0]?.total || 0, page: +page } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── ADMIN: get single lead ────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM custom_orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── ADMIN: update lead status (simple — just mark contacted/quoted) ──
router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { status, notes, quoted_amount } = req.body;
    const VALID = ['INQUIRY', 'CONTACTED', 'QUOTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !VALID.includes(status))
      return res.status(422).json({ success: false, message: `Status must be one of: ${VALID.join(', ')}` });

    const sets = ['updated_at = NOW()'];
    const vals = [];
    if (status)        { vals.push(status);        sets.push(`status = $${vals.length}`); }
    if (notes)         { vals.push(notes);          sets.push(`notes = $${vals.length}`); }
    if (quoted_amount) { vals.push(quoted_amount);  sets.push(`quoted_amount = $${vals.length}`, `quoted_at = NOW()`); }
    vals.push(req.params.id);
    await db.query(`UPDATE custom_orders SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── ADMIN: stats ──────────────────────────────────────────────
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT status, COUNT(*) as count FROM custom_orders GROUP BY status`
    );
    const [today] = await db.query(
      `SELECT COUNT(*) as count FROM custom_orders WHERE DATE(created_at) = CURRENT_DATE`
    );
    res.json({ success: true, data: { by_status: rows, today: +today[0]?.count || 0 } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── ERP WEBHOOK: receive status update from Vantix ERP ───────
router.post('/erp-sync', async (req, res) => {
  try {
    const { order_number, erp_order_id, erp_status, notes, secret } = req.body;
    if (secret !== process.env.ERP_WEBHOOK_SECRET)
      return res.status(401).json({ success: false, message: 'Invalid secret' });

    await db.query(
      `UPDATE custom_orders SET
         erp_order_id = COALESCE($1, erp_order_id),
         erp_status   = COALESCE($2, erp_status),
         notes        = COALESCE($3, notes),
         updated_at   = NOW()
       WHERE order_number = $4`,
      [erp_order_id || null, erp_status || null, notes || null, order_number]
    );
    res.json({ success: true, message: 'Synced from ERP' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

