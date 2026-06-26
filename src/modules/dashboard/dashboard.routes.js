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


// ── GET / — complete dashboard data ──────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.slice(0, 7) + '-01';

    const [
      todayEnq, todayApt, todayCust, todayRevenue,
      monthEnq, monthApt, monthCust, monthRevenue, monthOrders,
      totProducts, totCollections, totCustomers, totLeads, totExhibitions,
      recentEnq, recentApt, topCollections, revenueChart, enquiryChart, goldRate,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM enquiries WHERE DATE(created_at)=$1`, [today]),
      db.query(`SELECT COUNT(*) FROM appointments WHERE DATE(created_at)=$1`, [today]),
      db.query(`SELECT COUNT(*) FROM customers WHERE DATE(created_at)=$1 AND deleted_at IS NULL`, [today]),
      db.query(`SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE DATE(created_at)=$1 AND status!='cancelled'`, [today]),

      db.query(`SELECT COUNT(*) FROM enquiries WHERE created_at >= $1`, [monthStart]),
      db.query(`SELECT COUNT(*) FROM appointments WHERE created_at >= $1`, [monthStart]),
      db.query(`SELECT COUNT(*) FROM customers WHERE created_at >= $1 AND deleted_at IS NULL`, [monthStart]),
      db.query(`SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE created_at >= $1 AND status!='cancelled'`, [monthStart]),
      db.query(`SELECT COUNT(*) FROM orders WHERE created_at >= $1`, [monthStart]),

      db.query(`SELECT COUNT(*) FROM products WHERE deleted_at IS NULL`),
      db.query(`SELECT COUNT(*) FROM collections WHERE is_active=true`),
      db.query(`SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL`),
      db.query(`SELECT COUNT(*) FROM leads WHERE stage NOT IN ('won','lost') AND deleted_at IS NULL`),
      db.query(`SELECT COUNT(*) FROM exhibitions WHERE is_active=true`),

      db.query(`SELECT e.id, e.customer_name as name, COALESCE(e.product_name, e.name) as product, e.created_at as date, e.status FROM enquiries e ORDER BY e.created_at DESC LIMIT 5`),
      db.query(`SELECT a.id, a.customer_name as name, a.preferred_date as date, a.purpose FROM appointments a WHERE a.preferred_date >= CURRENT_DATE ORDER BY a.preferred_date ASC LIMIT 5`),
      db.query(`SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count FROM collections c LEFT JOIN products p ON p.collection_id=c.id AND p.deleted_at IS NULL GROUP BY c.id, c.name, c.slug ORDER BY product_count DESC LIMIT 5`),
      db.query(`SELECT TO_CHAR(date_trunc('month', created_at), 'Mon YYYY') as month, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '12 months' AND status!='cancelled' GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) ASC`),
      db.query(`SELECT DATE(created_at) as date, COUNT(*) as count FROM enquiries WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC`),
      db.query(`SELECT rate_22k, rate_18k, fetched_at as updated_at FROM gold_rates WHERE is_active=true ORDER BY fetched_at DESC LIMIT 1`),
    ]);

    const val = (r) => Object.values(r[0] || {})[0];
    const row = (r) => r[0] || null;

    res.json({
      success: true,
      data: {
        today: {
          enquiries:     parseInt(val(todayEnq)) || 0,
          appointments:  parseInt(val(todayApt)) || 0,
          new_customers: parseInt(val(todayCust)) || 0,
          revenue:       parseFloat(val(todayRevenue)) || 0,
        },
        this_month: {
          enquiries:     parseInt(val(monthEnq)) || 0,
          appointments:  parseInt(val(monthApt)) || 0,
          new_customers: parseInt(val(monthCust)) || 0,
          revenue:       parseFloat(val(monthRevenue)) || 0,
          orders:        parseInt(val(monthOrders)) || 0,
        },
        totals: {
          products:     parseInt(val(totProducts)) || 0,
          collections:  parseInt(val(totCollections)) || 0,
          customers:    parseInt(val(totCustomers)) || 0,
          active_leads: parseInt(val(totLeads)) || 0,
          exhibitions:  parseInt(val(totExhibitions)) || 0,
        },
        recent_enquiries:    recentEnq,
        recent_appointments: recentApt,
        top_collections:     topCollections,
        revenue_chart:       revenueChart,
        enquiry_chart:       enquiryChart,
        gold_rate:           row(goldRate),
      },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

