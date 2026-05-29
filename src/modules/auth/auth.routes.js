const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'JewelCMS_SuperSecret_Key_2026_ChangeThis';

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const ok  = (res, data, msg = 'OK') => res.json({ success: true, data, message: msg });
const fail = (res, msg, code = 400) => res.status(code).json({ success: false, message: msg });

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password required', 422);

    const [[user]] = await db.query(
      `SELECT id, name, email, password, role, is_active, deleted_at
       FROM users
       WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!user)            return fail(res, 'Invalid email or password', 401);
    if (!user.is_active)  return fail(res, 'Account is inactive. Contact support.', 401);
    if (user.deleted_at)  return fail(res, 'Account not found.', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res, 'Invalid email or password', 401);

    // Update last login timestamp
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])
      .catch(() => {}); // non-critical

    const token = signToken(user);

    return ok(res, {
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    }, 'Login successful');

  } catch (e) {
    console.error('Login error:', e.message);
    return fail(res, 'Login failed: ' + e.message, 500);
  }
});

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'editor' } = req.body;
    if (!name || !email || !password) return fail(res, 'Name, email and password required', 422);
    if (password.length < 6) return fail(res, 'Password must be at least 6 characters', 422);

    const [[existing]] = await db.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (existing) return fail(res, 'Email already registered', 409);

    const hash = await bcrypt.hash(password, 12);
    const id   = crypto.randomUUID();

    await db.query(
      `INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
      [id, name, email.toLowerCase().trim(), hash, role]
    );

    return ok(res, { id, name, email, role }, 'User created');
  } catch (e) {
    console.error('Register error:', e.message);
    return fail(res, e.message, 500);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM users WHERE id = $1 LIMIT 1',
      [req.user.id]
    );
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, { user });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/change-password ────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!new_password || new_password.length < 6)
      return fail(res, 'New password must be at least 6 characters', 422);

    const [[user]] = await db.query(
      'SELECT password FROM users WHERE id = $1 LIMIT 1',
      [req.user.id]
    );
    if (!user) return fail(res, 'User not found', 404);

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return fail(res, 'Current password is incorrect', 401);

    const hash = await bcrypt.hash(new_password, 12);
    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hash, req.user.id]
    );
    return ok(res, null, 'Password updated');
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email required', 422);

    const [[user]] = await db.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    // Always return success — don't reveal if email exists
    if (!user) return ok(res, null, 'If that email exists, a reset link has been sent');

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      `INSERT INTO password_resets (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET token = $2, expires_at = $3, created_at = NOW()`,
      [user.id, token, expires]
    );

    return ok(res, null, 'If that email exists, a reset link has been sent');
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  return ok(res, null, 'Logged out');
});

module.exports = router;
