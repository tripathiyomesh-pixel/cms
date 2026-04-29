const jwt = require('jsonwebtoken');
const { User } = require('../../database/models');
const { error } = require('../response');

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user || !user.is_active) return error(res, 'Unauthorized', 401);
    req.user = user;
    next();
  } catch (e) {
    return error(res, 'Invalid or expired token', 401);
  }
};

/**
 * RBAC — accept array of allowed roles
 * Usage: authorize(['admin','manager'])
 */
const authorize = (roles = []) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401);
  if (roles.length && !roles.includes(req.user.role)) {
    return error(res, 'Forbidden — insufficient permissions', 403);
  }
  next();
};

/**
 * Permission-level check (granular)
 * Usage: requirePermission('products.delete')
 */
const requirePermission = (permission) => (req, res, next) => {
  const { role, permissions } = req.user;
  if (role === 'super_admin' || role === 'admin') return next();
  const perms = permissions || {};
  if (!perms[permission]) {
    return error(res, `Permission denied: ${permission}`, 403);
  }
  next();
};

module.exports = { authenticate, authorize, requirePermission };
