const router  = require('express').Router();
const db      = require('../../config/db.pool');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

if (!process.env.CUSTOMER_JWT_SECRET && !process.env.JWT_SECRET) {
  console.error('FATAL: CUSTOMER_JWT_SECRET env var not set');
  process.exit(1);
}
const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET;

// ── AUTH MIDDLEWARE (customer, not workforce) ─────────────────
const customerAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ','');
  if (!token) return res.status(401).json({ success:false, message:'Login required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET + '_customer');
    const [[account]] = await db.query('SELECT * FROM customer_accounts WHERE id=$1 AND is_active=true', [decoded.id]);
    if (!account) return res.status(401).json({ success:false, message:'Account not found' });
    req.customer = account;
    next();
  } catch { res.status(401).json({ success:false, message:'Invalid or expired token' }); }
};

// ── REGISTER ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    if (!email || !password) return res.status(422).json({ success:false, message:'Email and password required' });
    if (password.length < 8) return res.status(422).json({ success:false, message:'Password must be at least 8 characters' });

    const [[existing]] = await db.query('SELECT id FROM customer_accounts WHERE email=$1', [email]);
    if (existing) return res.status(409).json({ success:false, message:'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const [[account]] = await db.query(
      `INSERT INTO customer_accounts (email, password_hash, first_name, last_name, phone, verify_token)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, first_name, last_name, is_active`,
      [email, hash, first_name, last_name, phone, verifyToken]
    );

    res.json({ success:true, data:account, message:'Account created. Please verify your email.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [[account]] = await db.query('SELECT * FROM customer_accounts WHERE email=$1', [email]);
    if (!account) return res.status(401).json({ success:false, message:'Invalid email or password' });
    if (!account.is_active) return res.status(401).json({ success:false, message:'Account is inactive' });

    const ok = await bcrypt.compare(password, account.password_hash);
    if (!ok) return res.status(401).json({ success:false, message:'Invalid email or password' });

    await db.query('UPDATE customer_accounts SET last_login=NOW() WHERE id=$1', [account.id]);

    const token = jwt.sign({ id:account.id, email:account.email, type:'customer' }, JWT_SECRET + '_customer', { expiresIn:'7d' });

    res.json({
      success: true,
      data: {
        token,
        account: { id:account.id, email:account.email, first_name:account.first_name, last_name:account.last_name, phone:account.phone },
      },
    });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── GET PROFILE ───────────────────────────────────────────────
router.get('/profile', customerAuth, async (req, res) => {
  const a = req.customer;
  res.json({ success:true, data:{ id:a.id, email:a.email, first_name:a.first_name, last_name:a.last_name, phone:a.phone, country_code:a.country_code, created_at:a.created_at } });
});

// ── UPDATE PROFILE ────────────────────────────────────────────
router.put('/profile', customerAuth, async (req, res) => {
  try {
    const { first_name, last_name, phone, country_code } = req.body;
    await db.query(
      'UPDATE customer_accounts SET first_name=$1, last_name=$2, phone=$3, country_code=$4, updated_at=NOW() WHERE id=$5',
      [first_name, last_name, phone, country_code, req.customer.id]
    );
    res.json({ success:true, message:'Profile updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── WISHLIST ──────────────────────────────────────────────────
router.get('/wishlist', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT w.id, w.product_id, w.diamond_id, w.item_type, w.notes, w.created_at,
              p.name, p.slug, p.final_price, p.currency,
              (SELECT file_url FROM media WHERE product_id=p.id AND is_primary=true LIMIT 1) as thumb_url
       FROM customer_wishlists w
       LEFT JOIN products p ON p.id = w.product_id
       WHERE w.account_id=$1
       ORDER BY w.created_at DESC`,
      [req.customer.id]
    );
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/wishlist', customerAuth, async (req, res) => {
  try {
    const { product_id, diamond_id, item_type='product', notes } = req.body;
    // Check already wishlisted
    const [[existing]] = await db.query(
      'SELECT id FROM customer_wishlists WHERE account_id=$1 AND product_id=$2',
      [req.customer.id, product_id]
    );
    if (existing) return res.json({ success:true, message:'Already in wishlist' });

    await db.query(
      'INSERT INTO customer_wishlists (account_id, product_id, diamond_id, item_type, notes) VALUES ($1,$2,$3,$4,$5)',
      [req.customer.id, product_id||null, diamond_id||null, item_type, notes||null]
    );
    res.json({ success:true, message:'Added to wishlist' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/wishlist/:id', customerAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM customer_wishlists WHERE id=$1 AND account_id=$2', [req.params.id, req.customer.id]);
    res.json({ success:true, message:'Removed from wishlist' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── APPOINTMENTS ──────────────────────────────────────────────
router.get('/appointments', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, preferred_date as appointment_date, preferred_time as appointment_time,
              purpose as type, status, notes, created_at
       FROM appointments WHERE customer_email=$1 ORDER BY preferred_date DESC LIMIT 20`,
      [req.customer.email]
    );
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ENQUIRIES ─────────────────────────────────────────────────
router.get('/enquiries', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.id, e.subject, e.message, e.status, e.created_at,
              p.name as product_name, p.slug as product_slug
       FROM enquiries e
       LEFT JOIN products p ON p.id = e.product_id
       WHERE e.email=$1 ORDER BY e.created_at DESC LIMIT 30`,
      [req.customer.email]
    );
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ORDERS ────────────────────────────────────────────────────
router.get('/orders', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, order_number, status, total_amount, currency, created_at
       FROM orders WHERE customer_email=$1 ORDER BY created_at DESC LIMIT 30`,
      [req.customer.email]
    );
    res.json({ success: true, data: rows });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});
// ── CHANGE PASSWORD ───────────────────────────────────────────
router.put('/change-password', customerAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(422).json({ success:false, message:'Both passwords required' });
    if (new_password.length < 8) return res.status(422).json({ success:false, message:'Password must be at least 8 characters' });

    const ok = await bcrypt.compare(current_password, req.customer.password_hash);
    if (!ok) return res.status(401).json({ success:false, message:'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE customer_accounts SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.customer.id]);
    res.json({ success:true, message:'Password updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;

