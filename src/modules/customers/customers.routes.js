/**
 * Customers — built from enquiry + appointment data
 * GET  /api/customers
 * GET  /api/customers/:id
 * POST /api/customers
 * PUT  /api/customers/:id
 */
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');

// ─── LIST ────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM enquiries e WHERE e.customer_phone = c.phone) as enquiry_count,
        (SELECT COUNT(*) FROM appointments a WHERE a.customer_phone = c.phone) as appointment_count,
        (SELECT MAX(created_at) FROM enquiries e WHERE e.customer_phone = c.phone) as last_enquiry
      FROM customers c
      ${where}
      ORDER BY c.created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);
    const cParams = params.slice(0, params.length - 2);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM customers c ${where}`, cParams);
    res.json({ success: true, data: rows, total: +cnt[0]?.total || 0, page: +page });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── GET SINGLE ──────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    const customer = rows[0];
    // Attach enquiry + appointment history
    const [enquiries] = await db.query(
      'SELECT * FROM enquiries WHERE customer_phone = $1 ORDER BY created_at DESC LIMIT 20',
      [customer.phone]
    );
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE customer_phone = $1 ORDER BY created_at DESC LIMIT 20',
      [customer.phone]
    );
    res.json({ success: true, data: { ...customer, enquiries, appointments } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── CREATE ──────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, phone, country_code, notes, tags } = req.body;
    if (!phone) return res.status(422).json({ success: false, message: 'Phone is required' });
    const [existing] = await db.query('SELECT id FROM customers WHERE phone = $1', [phone]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Customer with this phone already exists' });
    const [r] = await db.execute(
      `INSERT INTO customers (name, email, phone, country_code, notes, tags) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, email||null, phone, country_code||'AE', notes||null, JSON.stringify(tags||[])]
    );
    res.json({ success: true, data: { id: r[0]?.insertId }, message: 'Customer created' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── UPDATE ──────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, email, phone, country_code, notes, tags } = req.body;
    await db.query(
      `UPDATE customers SET name=COALESCE($1,name), email=COALESCE($2,email), phone=COALESCE($3,phone),
       country_code=COALESCE($4,country_code), notes=COALESCE($5,notes), tags=COALESCE($6,tags), updated_at=NOW()
       WHERE id=$7`,
      [name||null, email||null, phone||null, country_code||null, notes||null,
       tags ? JSON.stringify(tags) : null, req.params.id]
    );
    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── DELETE ──────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── IMPORT FROM ENQUIRIES ────────────────────────────────────
router.post('/import-from-enquiries', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const [enquiries] = await db.query(`
      SELECT DISTINCT customer_name, customer_email, customer_phone, country_code
      FROM enquiries
      WHERE customer_phone IS NOT NULL
        AND customer_phone NOT IN (SELECT phone FROM customers WHERE phone IS NOT NULL)
    `);
    let imported = 0;
    for (const e of enquiries) {
      try {
        await db.execute(
          `INSERT INTO customers (name, email, phone, country_code) VALUES ($1,$2,$3,$4) RETURNING id`,
          [e.customer_name||'Unknown', e.customer_email||null, e.customer_phone, e.country_code||'AE']
        );
        imported++;
      } catch {}
    }
    res.json({ success: true, message: `${imported} customers imported from enquiries` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
