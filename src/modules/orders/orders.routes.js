/**
 * Orders — track purchases
 * Customer order → ERP can sync status back via webhook
 */
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');

// ─── LIST (admin) ─────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (customer_name ILIKE $${params.length} OR order_number ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`; }
    const qp = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${qp.length - 1} OFFSET $${qp.length}`,
      qp
    );
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM orders ${where}`, params);
    res.json({ success: true, data: rows, total: +cnt[0]?.total || 0, page: +page });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── GET SINGLE ────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── CREATE (from storefront checkout or enquiry conversion) ──
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items,
            subtotal, tax_amount, total_amount, currency, country_code, notes } = req.body;
    const order_number = 'ORD-' + Date.now().toString(36).toUpperCase();
    const [r] = await db.execute(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone,
        items, subtotal, tax_amount, total_amount, currency, country_code, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING id`,
      [order_number, customer_name, customer_email || null, customer_phone || null,
       JSON.stringify(items || []), subtotal || 0, tax_amount || 0, total_amount || 0,
       currency || 'AED', country_code || 'AE', notes || null]
    );
    res.json({ success: true, data: { id: r[0]?.id || r.rows?.[0]?.id, order_number }, message: 'Order created' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── UPDATE STATUS (admin) ────────────────────────────────────
router.patch('/:id/status', authenticate, authorize(['super_admin', 'admin', 'manager']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!valid.includes(status)) return res.status(422).json({ success: false, message: 'Invalid status' });
    await db.query(
      'UPDATE orders SET status = $1, notes = COALESCE($2, notes), updated_at = NOW() WHERE id = $3',
      [status, notes || null, req.params.id]
    );
    await cache.del('orders:stats');
    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ERP WEBHOOK: sync order status from Vantix ERP ──────────
router.post('/erp-sync', async (req, res) => {
  try {
    const { order_number, erp_order_id, status, tracking_number, notes, secret } = req.body;
    if (secret !== process.env.ERP_WEBHOOK_SECRET)
      return res.status(401).json({ success: false, message: 'Invalid secret' });

    await db.query(
      `UPDATE orders SET
         status          = COALESCE($1, status),
         notes           = COALESCE($2, notes),
         updated_at      = NOW()
       WHERE order_number = $3`,
      [status || null, notes || null, order_number]
    );

    // Log the sync
    await db.execute(
      `INSERT INTO erp_sync_log (event_type, payload, status) VALUES ('order_status_update', $1, 'received')`,
      [JSON.stringify({ order_number, erp_order_id, status, tracking_number })]
    );

    res.json({ success: true, message: 'Order synced from ERP' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── STATS ────────────────────────────────────────────────────
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('orders:stats');
    if (cached) return res.json({ success: true, data: cached });
    const [byStatus] = await db.query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders GROUP BY status`
    );
    const [today] = await db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE`
    );
    const data = { by_status: byStatus, today: today[0] };
    await cache.set('orders:stats', data, 60);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
