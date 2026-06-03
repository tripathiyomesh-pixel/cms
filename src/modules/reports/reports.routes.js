/**
 * VANTIX-CMS — Reports Routes
 *
 * Revenue report, enquiry funnel, appointment stats, CRM pipeline report.
 * All endpoints support CSV export via ?format=csv query param.
 */
const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const MGMT = ['super_admin', 'admin', 'manager'];

// ── CSV helper ────────────────────────────────────────────────────────────────
function toCSV(rows, columns) {
  if (!rows.length) return columns.join(',') + '\n';
  const header = columns.join(',');
  const body   = rows.map(row =>
    columns.map(col => {
      const v = row[col] ?? '';
      const s = String(v).replace(/"/g, '""');
      return /[,"\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  ).join('\n');
  return header + '\n' + body;
}

function sendCSV(res, filename, rows, columns) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(toCSV(rows, columns));
}

// ── GET /api/reports/revenue ──────────────────────────────────────────────────
router.get('/revenue', authenticate, authorize(MGMT), async (req, res) => {
  try {
    const year   = parseInt(req.query.year) || new Date().getFullYear();
    const format = req.query.format;

    const { rows: monthly } = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM')   AS month,
        TO_CHAR(created_at, 'Mon YYYY')  AS month_label,
        COUNT(*)                         AS order_count,
        COALESCE(SUM(subtotal),    0)    AS subtotal,
        COALESCE(SUM(tax_amount),  0)    AS tax,
        COALESCE(SUM(total_amount),0)    AS revenue,
        COUNT(*) FILTER(WHERE status='delivered')  AS delivered,
        COUNT(*) FILTER(WHERE status='cancelled')  AS cancelled
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY month, month_label
      ORDER BY month ASC
    `, [year]);

    const { rows: [totals] } = await pool.query(`
      SELECT
        COUNT(*)                               AS total_orders,
        COALESCE(SUM(total_amount), 0)         AS total_revenue,
        COALESCE(SUM(tax_amount),  0)          AS total_tax,
        COALESCE(AVG(total_amount), 0)         AS avg_order_value,
        COUNT(*) FILTER(WHERE status='delivered') AS delivered
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND status != 'cancelled'
    `, [year]);

    const { rows: years } = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS year FROM orders ORDER BY year DESC`
    );

    if (format === 'csv') {
      return sendCSV(res, `revenue-${year}.csv`, monthly,
        ['month', 'month_label', 'order_count', 'subtotal', 'tax', 'revenue', 'delivered', 'cancelled']
      );
    }

    res.json({ success: true, data: { year, monthly, totals, available_years: years.map(r => r.year) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/reports/enquiries ────────────────────────────────────────────────
router.get('/enquiries', authenticate, authorize(MGMT), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const format = req.query.format;

    const { rows } = await pool.query(`
      SELECT
        DATE(created_at)                                 AS date,
        TO_CHAR(created_at, 'DD Mon')                    AS date_label,
        COUNT(*)                                         AS enquiries,
        COUNT(*) FILTER(WHERE status='replied')          AS replied,
        COUNT(*) FILTER(WHERE status='converted')        AS converted,
        COUNT(*) FILTER(WHERE channel='whatsapp')        AS whatsapp,
        COUNT(*) FILTER(WHERE channel='form')            AS form
      FROM enquiries
      WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY date, date_label
      ORDER BY date ASC
    `, [days]);

    const { rows: [totals] } = await pool.query(`
      SELECT
        COUNT(*)                                         AS total,
        COUNT(*) FILTER(WHERE status='replied')          AS replied,
        COUNT(*) FILTER(WHERE status='converted')        AS converted,
        COUNT(*) FILTER(WHERE channel='whatsapp')        AS whatsapp,
        COUNT(*) FILTER(WHERE channel='form')            AS form
      FROM enquiries
      WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    `, [days]);

    const { rows: topProducts } = await pool.query(`
      SELECT product_name, COUNT(*) AS enquiry_count
      FROM enquiries
      WHERE product_name IS NOT NULL
        AND created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY product_name
      ORDER BY enquiry_count DESC
      LIMIT 10
    `, [days]);

    if (format === 'csv') {
      return sendCSV(res, `enquiries-${days}days.csv`, rows,
        ['date', 'enquiries', 'replied', 'converted', 'whatsapp', 'form']
      );
    }

    res.json({ success: true, data: { days, daily: rows, totals, top_products: topProducts } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/reports/appointments ─────────────────────────────────────────────
router.get('/appointments', authenticate, authorize(MGMT), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const format = req.query.format;

    const { rows } = await pool.query(`
      SELECT
        DATE(preferred_date)                             AS date,
        TO_CHAR(preferred_date, 'DD Mon')                AS date_label,
        COUNT(*)                                         AS total,
        COUNT(*) FILTER(WHERE status='confirmed')        AS confirmed,
        COUNT(*) FILTER(WHERE status='completed')        AS completed,
        COUNT(*) FILTER(WHERE status='cancelled')        AS cancelled,
        COUNT(*) FILTER(WHERE status='no_show')          AS no_show
      FROM appointments
      WHERE preferred_date >= CURRENT_DATE - ($1 || ' days')::INTERVAL
      GROUP BY date, date_label
      ORDER BY date ASC
    `, [days]);

    const { rows: byPurpose } = await pool.query(`
      SELECT
        COALESCE(purpose, 'General') AS purpose,
        COUNT(*)                     AS count,
        COUNT(*) FILTER(WHERE status='confirmed') AS confirmed
      FROM appointments
      WHERE preferred_date >= CURRENT_DATE - ($1 || ' days')::INTERVAL
      GROUP BY purpose
      ORDER BY count DESC
    `, [days]);

    if (format === 'csv') {
      return sendCSV(res, `appointments-${days}days.csv`, rows,
        ['date', 'total', 'confirmed', 'completed', 'cancelled', 'no_show']
      );
    }

    res.json({ success: true, data: { days, daily: rows, by_purpose: byPurpose } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/reports/crm ──────────────────────────────────────────────────────
router.get('/crm', authenticate, authorize(MGMT), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const format = req.query.format;

    const { rows: pipeline } = await pool.query(`
      SELECT
        stage,
        COUNT(*)                              AS count,
        COALESCE(SUM(value), 0)               AS total_value,
        COALESCE(AVG(value), 0)               AS avg_value,
        COUNT(*) FILTER(WHERE priority='high') AS high_priority
      FROM leads
      WHERE deleted_at IS NULL
      GROUP BY stage
      ORDER BY CASE stage
        WHEN 'new' THEN 1 WHEN 'contacted' THEN 2 WHEN 'qualified' THEN 3
        WHEN 'proposal' THEN 4 WHEN 'won' THEN 5 WHEN 'lost' THEN 6
        ELSE 7 END
    `);

    const { rows: bySource } = await pool.query(`
      SELECT source, COUNT(*) AS count, COALESCE(SUM(value),0) AS total_value
      FROM leads
      WHERE deleted_at IS NULL
        AND created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY source ORDER BY count DESC
    `, [days]);

    const { rows: recentWins } = await pool.query(`
      SELECT name, phone, value, currency, converted_at, source
      FROM leads
      WHERE stage='won' AND converted_at IS NOT NULL
      ORDER BY converted_at DESC LIMIT 10
    `);

    if (format === 'csv') {
      return sendCSV(res, 'crm-pipeline.csv', pipeline,
        ['stage', 'count', 'total_value', 'avg_value', 'high_priority']
      );
    }

    res.json({ success: true, data: { pipeline, by_source: bySource, recent_wins: recentWins } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/reports/customers ────────────────────────────────────────────────
router.get('/customers', authenticate, authorize(MGMT), async (req, res) => {
  try {
    const format = req.query.format;

    const { rows: growth } = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM')  AS month,
        TO_CHAR(created_at, 'Mon YYYY') AS month_label,
        COUNT(*)                        AS new_customers
      FROM customers
      WHERE deleted_at IS NULL
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month, month_label
      ORDER BY month ASC
    `);

    const { rows: top } = await pool.query(`
      SELECT c.id, c.name, c.phone, c.email, c.created_at,
        (SELECT COUNT(*) FROM enquiries e WHERE e.customer_phone=c.phone)    AS enquiries,
        (SELECT COUNT(*) FROM appointments a WHERE a.customer_phone=c.phone) AS appointments
      FROM customers c
      WHERE c.deleted_at IS NULL
      ORDER BY enquiries DESC, appointments DESC
      LIMIT 20
    `);

    if (format === 'csv') {
      return sendCSV(res, 'top-customers.csv', top,
        ['name', 'phone', 'email', 'enquiries', 'appointments', 'created_at']
      );
    }

    res.json({ success: true, data: { monthly_growth: growth, top_customers: top } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
