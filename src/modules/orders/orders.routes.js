const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { success, error } = require('../../common/response');
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (customer_name ILIKE $${params.length} OR order_number ILIKE $${params.length})`; }
    params.push(parseInt(limit)); params.push(parseInt(offset));
    const [rows] = await db.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    const cParams = params.slice(0, params.length - 2);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM orders ${where}`, cParams);
    return res.json({ success: true, data: rows, total: parseInt(cnt[0]?.total||0), page: parseInt(page) });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('orders:stats');
    if (cached) return res.json({ success: true, data: cached });
    const [byStatus] = await db.query(`SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders GROUP BY status`);
    const [today] = await db.query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE`);
    const data = { by_status: byStatus, today: today[0] };
    await cache.set('orders:stats', data, 60);
    return res.json({ success: true, data });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items, subtotal, tax_amount, total_amount, currency, country_code, notes } = req.body;
    const order_number = 'ORD-' + Date.now().toString(36).toUpperCase();
    const [r] = await db.execute(
      `INSERT INTO orders (order_number,customer_name,customer_email,customer_phone,items,subtotal,tax_amount,total_amount,currency,country_code,notes,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending') RETURNING id`,
      [order_number, customer_name, customer_email||null, customer_phone||null, JSON.stringify(items||[]), subtotal||0, tax_amount||0, total_amount||0, currency||'AED', country_code||'AE', notes||null]
    );
    return res.json({ success: true, data: { id: r[0]?.insertId, order_number }, message: 'Order created' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/status', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['pending','confirmed','processing','shipped','delivered','cancelled','returned'].includes(status))
      return res.status(422).json({ success: false, message: 'Invalid status' });
    await db.query('UPDATE orders SET status=$1, notes=COALESCE($2,notes), updated_at=NOW() WHERE id=$3', [status, notes||null, req.params.id]);
    await cache.del('orders:stats');
    return res.json({ success: true, message: 'Updated' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
