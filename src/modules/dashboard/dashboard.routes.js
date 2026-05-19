const router = require('express').Router();
const db     = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');

router.get('/stats', authenticate, async (req, res) => {
  try {
    const [
      [products],
      [enquiries],
      [appointments],
      [customers],
      [diamonds],
      [orders],
      [inventory],
      [daily_enq],
      [daily_orders],
      [recent_enq],
      [recent_apt],
      [gold],
    ] = await Promise.all([
      // Products
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE status='active') as active,
        COUNT(*) FILTER(WHERE status='draft') as draft,
        COUNT(*) FILTER(WHERE is_featured=true) as featured
        FROM products WHERE deleted_at IS NULL`),
      // Enquiries
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE status='new') as new,
        COUNT(*) FILTER(WHERE created_at > NOW()-INTERVAL '7 days') as this_week,
        COUNT(*) FILTER(WHERE created_at > NOW()-INTERVAL '14 days' AND created_at <= NOW()-INTERVAL '7 days') as prev_week
        FROM enquiries`),
      // Appointments
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE status='pending') as pending,
        COUNT(*) FILTER(WHERE status='confirmed') as confirmed,
        COUNT(*) FILTER(WHERE appointment_date >= CURRENT_DATE) as upcoming
        FROM appointments`),
      // Customers
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE created_at > NOW()-INTERVAL '30 days') as new_this_month
        FROM customers WHERE deleted_at IS NULL`),
      // Diamonds
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE status='available') as available,
        COUNT(*) FILTER(WHERE inventory_type='lab_grown') as lab_grown
        FROM products WHERE inventory_type IN ('diamond','lab_grown') AND deleted_at IS NULL`),
      // Orders
      db.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER(WHERE status='pending') as pending,
        COUNT(*) FILTER(WHERE status='confirmed') as confirmed,
        COALESCE(SUM(total_amount) FILTER(WHERE status!='cancelled'), 0) as revenue
        FROM orders`),
      // Inventory breakdown
      db.query(`SELECT inventory_type, COUNT(*) as count, COUNT(*) FILTER(WHERE status='active') as active
        FROM products WHERE deleted_at IS NULL GROUP BY inventory_type ORDER BY count DESC LIMIT 6`),
      // Daily enquiries last 7 days
      db.query(`SELECT DATE(created_at) as date, COUNT(*) as count
        FROM enquiries WHERE created_at > NOW()-INTERVAL '7 days'
        GROUP BY DATE(created_at) ORDER BY date ASC`),
      // Daily orders last 7 days
      db.query(`SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue
        FROM orders WHERE created_at > NOW()-INTERVAL '7 days'
        GROUP BY DATE(created_at) ORDER BY date ASC`),
      // Recent enquiries
      db.query(`SELECT id, customer_name, name, email, status, created_at
        FROM enquiries ORDER BY created_at DESC LIMIT 5`),
      // Recent appointments
      db.query(`SELECT id, customer_name, name, email, status, appointment_date, created_at
        FROM appointments ORDER BY created_at DESC LIMIT 5`),
      // Gold rate
      db.query(`SELECT rate_24k, rate_22k, source, fetched_at FROM gold_rates WHERE is_active=true ORDER BY fetched_at DESC LIMIT 1`),
    ]);

    res.json({
      success: true,
      data: {
        products:            products[0],
        enquiries:           { ...enquiries[0], this_week: enquiries[0].this_week },
        appointments:        appointments[0],
        customers:           customers[0],
        diamonds:            diamonds[0],
        orders:              orders[0],
        inventory_breakdown: inventory,
        daily_enquiries:     daily_enq,
        daily_orders:        daily_orders,
        recent_enquiries:    recent_enq,
        recent_appointments: recent_apt,
        gold_rate:           gold[0] || null,
      },
    });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
