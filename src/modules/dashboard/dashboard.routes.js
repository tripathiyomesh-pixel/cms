/**
 * Dashboard — real-time stats aggregation
 * GET /api/dashboard/stats
 * GET /api/dashboard/recent-activity
 * GET /api/dashboard/sales-chart
 */
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');

// ─── MAIN STATS ──────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const cacheKey = 'dashboard:stats';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [products]     = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='active') as active, COUNT(*) FILTER (WHERE stock_quantity <= low_stock_alert AND stock_quantity > 0) as low_stock, COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock FROM products WHERE deleted_at IS NULL`);
    const [enquiries]    = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='new') as unread, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as today FROM enquiries`);
    const [appointments] = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='pending') as pending, COUNT(*) FILTER (WHERE preferred_date = CURRENT_DATE) as today FROM appointments`);
    const [orders]       = await db.query(`SELECT COUNT(*) as total, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) FILTER (WHERE status='pending') as pending FROM orders`);
    const [categories]   = await db.query(`SELECT COUNT(*) as total FROM categories WHERE deleted_at IS NULL`);
    const [collections]  = await db.query(`SELECT COUNT(*) as total FROM collections WHERE deleted_at IS NULL`);
    const [users]        = await db.query(`SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`);

    const data = {
      products:     { total: +products[0].total, active: +products[0].active, low_stock: +products[0].low_stock, out_of_stock: +products[0].out_of_stock },
      enquiries:    { total: +enquiries[0].total, unread: +enquiries[0].unread, today: +enquiries[0].today },
      appointments: { total: +appointments[0].total, pending: +appointments[0].pending, today: +appointments[0].today },
      orders:       { total: +orders[0].total, revenue: +orders[0].revenue, pending: +orders[0].pending },
      categories:   +categories[0].total,
      collections:  +collections[0].total,
      users:        +users[0].total,
    };

    await cache.set(cacheKey, data, 60);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── RECENT ACTIVITY ─────────────────────────────────────────
router.get('/recent-activity', authenticate, async (req, res) => {
  try {
    const [recentEnquiries]    = await db.query(`SELECT 'enquiry' as type, customer_name as label, channel as sub, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5`);
    const [recentAppointments] = await db.query(`SELECT 'appointment' as type, customer_name as label, purpose as sub, created_at FROM appointments ORDER BY created_at DESC LIMIT 5`);
    const [recentOrders]       = await db.query(`SELECT 'order' as type, order_number as label, status as sub, created_at FROM orders ORDER BY created_at DESC LIMIT 5`);
    const [recentProducts]     = await db.query(`SELECT 'product' as type, name as label, status as sub, created_at FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`);

    const all = [...recentEnquiries, ...recentAppointments, ...recentOrders, ...recentProducts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15);

    res.json({ success: true, data: all });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── SALES CHART (last 30 days) ───────────────────────────────
router.get('/sales-chart', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as enquiries
      FROM enquiries
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const [apptRows] = await db.query(`
      SELECT preferred_date as date, COUNT(*) as appointments
      FROM appointments
      WHERE preferred_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY preferred_date ORDER BY preferred_date ASC
    `);
    res.json({ success: true, data: { enquiries: rows, appointments: apptRows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── LOW STOCK ALERTS ─────────────────────────────────────────
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, sku, stock_quantity, low_stock_alert, status
      FROM products
      WHERE deleted_at IS NULL
        AND stock_quantity <= low_stock_alert
      ORDER BY stock_quantity ASC
      LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
