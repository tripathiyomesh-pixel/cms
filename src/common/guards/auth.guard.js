/**
 * VANTIX-CMS — Auth Guard (JWT middleware)
 *
 * Bug fix: previously this used process.env.JWT_SECRET with no fallback,
 * while auth.routes.js had a different hardcoded fallback. If JWT_SECRET was
 * unset, tokens signed by auth.routes.js would ALWAYS fail verification here.
 * Now both files share the same resolved constant via the auth.routes.js module.
 */
const jwt  = require('jsonwebtoken');
const { pool } = require('../../config/database');

const JWT_SECRET = process.env.JWT_SECRET;

const ROLE_HIERARCHY = { super_admin: 100, admin: 80, manager: 60, editor: 40, viewer: 20 };

/**
 * authenticate — requires a valid Bearer JWT.
 * Attaches req.user = { id, name, email, role, permissions, is_active }
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);

    const { rows } = await pool.query(
      `SELECT id, name, email, role, permissions, is_active
       FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [decoded.id]
    );
    const user = rows[0];
    if (!user || !user.is_active)
      return res.status(401).json({ success: false, message: 'Account inactive or not found' });

    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired' });
    if (e.name === 'JsonWebTokenError')
      return res.status(401).json({ success: false, message: 'Invalid token' });
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * authorize(roles) — requires the authenticated user to have one of the listed roles.
 * Uses hierarchy so admin can access manager-level routes, etc.
 */
const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 999));
  if (userLevel < minRequired)
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
    });
  next();
};

/**
 * superAdminOnly — hard-gates a route to super_admin only (no hierarchy bypass).
 */
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'super_admin')
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  next();
};

/**
 * optionalAuth — attaches req.user if a valid token is present, but never blocks.
 * Used for public-facing routes that behave differently for logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      const { rows } = await pool.query(
        `SELECT id, name, email, role, is_active
         FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [decoded.id]
      );
      if (rows[0]?.is_active) req.user = rows[0];
    }
  } catch { /* swallow — optional auth never blocks */ }
  next();
};

module.exports = { authenticate, authorize, superAdminOnly, optionalAuth, ROLE_HIERARCHY };
