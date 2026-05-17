const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const db = require('../../config/db.pool');

// ─── MAIN STATS ───────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const cacheKey = 'dashboard:stats';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [products]     = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='active') as active, COUNT(*) FILTER (WHERE stock_quantity <= low_stock_alert AND stock_quantity > 0) as low_stock, COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock FROM products WHERE deleted_at IS NULL`);
    const [enquiries]    = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='new') as unread, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as today FROM enquiries`);
    const [appointments] = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='pending') as pending, COUNT(*) FILTER (WHERE preferred_date = CURRENT_DATE) as today FROM appointments`);
    const [orders]       = await db.query(`SELECT COUNT(*) as total, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) FILTER (WHERE status='pending') as pending FROM orders`);
    const [users]        = await db.query(`SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`);
    const [customs]      = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='INQUIRY') as new_leads FROM custom_orders`);

    // Inventory by type
    const [byType] = await db.query(`
      SELECT inventory_type, COUNT(*) as count, COUNT(*) FILTER (WHERE status='active') as active
      FROM products WHERE deleted_at IS NULL
      GROUP BY inventory_type ORDER BY count DESC
    `);

    const data = {
      products:     { total: +products[0].total, active: +products[0].active, low_stock: +products[0].low_stock, out_of_stock: +products[0].out_of_stock },
      enquiries:    { total: +enquiries[0].total, unread: +enquiries[0].unread, today: +enquiries[0].today },
      appointments: { total: +appointments[0].total, pending: +appointments[0].pending, today: +appointments[0].today },
      orders:       { total: +orders[0].total, revenue: +orders[0].revenue, pending: +orders[0].pending },
      custom_orders:{ total: +customs[0].total, new_leads: +customs[0].new_leads },
      users:        +users[0].total,
      inventory_by_type: byType,
    };

    await cache.set(cacheKey, data, 60);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── RECENT ACTIVITY ──────────────────────────────────────────
router.get('/recent-activity', authenticate, async (req, res) => {
  try {
    const [enquiries]    = await db.query(`SELECT 'enquiry' as type, customer_name as label, channel as sub, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5`);
    const [appointments] = await db.query(`SELECT 'appointment' as type, customer_name as label, purpose as sub, created_at FROM appointments ORDER BY created_at DESC LIMIT 5`);
    const [orders]       = await db.query(`SELECT 'order' as type, order_number as label, status as sub, created_at FROM orders ORDER BY created_at DESC LIMIT 5`);
    const [customs]      = await db.query(`SELECT 'custom_order' as type, customer_name as label, status as sub, created_at FROM custom_orders ORDER BY created_at DESC LIMIT 5`);
    const [products]     = await db.query(`SELECT 'product' as type, name as label, inventory_type as sub, created_at FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`);

    const all = [...enquiries, ...appointments, ...orders, ...customs, ...products]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15);

    res.json({ success: true, data: all });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── SALES CHART ──────────────────────────────────────────────
router.get('/sales-chart', authenticate, async (req, res) => {
  try {
    const [enquiryRows] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM enquiries WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);
    const [orderRows] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);
    res.json({ success: true, data: { enquiries: enquiryRows, orders: orderRows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── LOW STOCK ─────────────────────────────────────────────────
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, sku, stock_quantity, low_stock_alert, status, inventory_type
      FROM products
      WHERE deleted_at IS NULL AND stock_quantity <= low_stock_alert
      ORDER BY stock_quantity ASC LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── INVENTORY SUMMARY ─────────────────────────────────────────
router.get('/inventory-summary', authenticate, async (req, res) => {
  try {
    const [diamonds] = await db.query(`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE d.is_available = true) as available,
             COUNT(*) FILTER (WHERE p.inventory_type = 'NATURAL_DIAMOND') as natural,
             COUNT(*) FILTER (WHERE p.inventory_type = 'LAB_GROWN_DIAMOND') as lab_grown
      FROM products p LEFT JOIN diamond_details d ON d.product_id = p.id
      WHERE p.inventory_type IN ('NATURAL_DIAMOND','LAB_GROWN_DIAMOND') AND p.deleted_at IS NULL
    `);
    const [gemstones] = await db.query(`SELECT COUNT(*) as total FROM products WHERE inventory_type = 'GEMSTONE' AND deleted_at IS NULL`);
    const [pearls]    = await db.query(`SELECT COUNT(*) as total FROM products WHERE inventory_type = 'PEARL' AND deleted_at IS NULL`);
    const [mountings] = await db.query(`SELECT COUNT(*) as total FROM products WHERE inventory_type = 'MOUNTING' AND deleted_at IS NULL`);
    const [jewellery] = await db.query(`SELECT COUNT(*) as total FROM products WHERE inventory_type = 'JEWELLERY' AND deleted_at IS NULL`);
    const [custom]    = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'INQUIRY') as new_leads FROM custom_orders`);

    res.json({ success: true, data: {
      diamonds:  { total: +diamonds[0].total, available: +diamonds[0].available, natural: +diamonds[0].natural, lab_grown: +diamonds[0].lab_grown },
      gemstones: +gemstones[0].total,
      pearls:    +pearls[0].total,
      mountings: +mountings[0].total,
      jewellery: +jewellery[0].total,
      custom_orders: { total: +custom[0].total, new_leads: +custom[0].new_leads },
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
