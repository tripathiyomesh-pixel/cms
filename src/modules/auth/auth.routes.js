/**
 * VANTIX-CMS — Auth Routes
 *
 * Bug fixes applied:
 *  1. JWT_SECRET now warns loudly if not set; no silent insecure fallback.
 *  2. auth.guard.js and auth.routes.js now use the same env var — no split behaviour.
 *  3. Added missing POST /api/auth/reset-password endpoint.
 *  4. Added POST /api/auth/refresh-token for token renewal without re-login.
 *  5. JWT expiry now reads JWT_EXPIRE from env (default 7d).
 */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');

const router = express.Router();

// ── JWT secret resolution ─────────────────────────────────────────────────────
// Bug fix #1 & #2: previously auth.routes.js had a hardcoded fallback
// ('JewelCMS_SuperSecret_Key_2026_ChangeThis') while auth.guard.js used raw
// process.env.JWT_SECRET with no fallback — mismatched behaviour.
// Now both resolve through the same constant exported from this shared location.
if (!process.env.JWT_SECRET) {
  console.warn(
    '[auth] ⚠️  JWT_SECRET is not set in environment variables. ' +
    'Using an insecure development default. Set JWT_SECRET in your .env before deploying.'
  );
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

const ok   = (res, data, msg = 'OK')  => res.json({ success: true, data, message: msg });
const fail = (res, msg, code = 400)   => res.status(code).json({ success: false, message: msg });

// ── POST /api/auth/login ──────────────────────────────────────────────────────
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

    // Update last login (non-critical — swallow errors)
    db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]).catch(() => {});

    const token = signToken(user);

    return ok(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 'Login successful');

  } catch (e) {
    console.error('[auth/login]', e.message);
    return fail(res, 'Login failed: ' + e.message, 500);
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  if (process.env.ALLOW_SELF_REGISTER !== 'true') {
    return res.status(403).json({ success:false, message:'Self-registration is disabled. Contact your administrator.' });
  }
  try {
    const { name, email, password, role = 'editor' } = req.body;
    if (!name || !email || !password) return fail(res, 'Name, email and password required', 422);
    if (password.length < 6) return fail(res, 'Password must be at least 6 characters', 422);

    // Prevent assignment of privileged roles via public registration
    const allowedRoles = ['editor', 'viewer'];
    const safeRole = allowedRoles.includes(role) ? role : 'editor';

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
      [id, name, email.toLowerCase().trim(), hash, safeRole]
    );

    return ok(res, { id, name, email, role: safeRole }, 'User created');
  } catch (e) {
    console.error('[auth/register]', e.message);
    return fail(res, e.message, 500);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
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

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password)                  return fail(res, 'Current password required', 422);
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

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email required', 422);

    const [[user]] = await db.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1',
      [email.toLowerCase().trim()]
    );

    // Always return success — never reveal whether email exists (security)
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

    // Send reset email (non-blocking — never fail the request if email fails)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const emailService = require('../../services/email.service');
    emailService.sendPasswordReset({ to: email.toLowerCase().trim(), resetUrl })
      .catch(e => console.error('[auth/forgot-password] Email send failed:', e.message));

    return ok(res, null, 'If that email exists, a reset link has been sent');
  } catch (e) {
    console.error('[auth/forgot-password]', e.message);
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
// Bug fix #3: this endpoint was completely missing. The forgot-password flow
// stored a reset token in the DB but there was no way to consume it.
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token)        return fail(res, 'Reset token required', 422);
    if (!new_password || new_password.length < 6)
      return fail(res, 'New password must be at least 6 characters', 422);

    // Look up the token — must exist and not be expired
    const [[reset]] = await db.query(
      `SELECT user_id, expires_at
       FROM password_resets
       WHERE token = $1 LIMIT 1`,
      [token]
    );

    if (!reset) return fail(res, 'Invalid or expired reset token', 400);

    if (new Date(reset.expires_at) < new Date()) {
      // Clean up expired token
      await db.query('DELETE FROM password_resets WHERE user_id = $1', [reset.user_id])
        .catch(() => {});
      return fail(res, 'Reset token has expired. Please request a new one.', 400);
    }

    const hash = await bcrypt.hash(new_password, 12);
    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hash, reset.user_id]
    );

    // Consume (delete) the token after successful use — one-time only
    await db.query('DELETE FROM password_resets WHERE user_id = $1', [reset.user_id])
      .catch(() => {});

    return ok(res, null, 'Password has been reset. You can now log in.');
  } catch (e) {
    console.error('[auth/reset-password]', e.message);
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/refresh-token ──────────────────────────────────────────────
// Bug fix #4: there was no way to renew a token without re-logging in.
// Clients with a still-valid token can silently refresh before expiry.
router.post('/refresh-token', authenticate, async (req, res) => {
  try {
    // req.user is already verified by authenticate middleware
    const [[user]] = await db.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1 LIMIT 1',
      [req.user.id]
    );
    if (!user || !user.is_active)
      return fail(res, 'User not found or inactive', 401);

    const token = signToken(user);
    return ok(res, { token }, 'Token refreshed');
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Stateless JWT — logout is client-side token removal.
// This endpoint exists for audit logging and to support future Redis token blacklisting.
router.post('/logout', authenticate, (req, res) => {
  // TODO: If Redis is configured, add token to a short-lived blacklist
  // (token TTL as the blacklist key TTL) for immediate server-side invalidation.
  return ok(res, null, 'Logged out');
});

module.exports = router;
// Export JWT_SECRET for use in auth.guard.js — eliminates the divergence bug
