const { buildPermissions } = require('../../engine/permissions');
const jwt = require('jsonwebtoken');
const { User } = require('../../database/models');

// ─── ROLE HIERARCHY ──────────────────────────────────────────
const ROLE_HIERARCHY = {
  super_admin: 100,
  admin:        80,
  manager:      60,
  editor:       40,
  viewer:       20,
};

// ─── PERMISSION MATRIX ────────────────────────────────────────
// Maps resource:action → minimum role level required
const PERMISSIONS = {
  // Products
  'products:read':          20,  // viewer+
  'products:create':        40,  // editor+
  'products:update':        40,
  'products:delete':        80,  // admin+
  'products:bulk':          60,  // manager+
  // Orders
  'orders:read':            40,
  'orders:update_status':   60,
  'orders:delete':          80,
  // Customers
  'customers:read':         40,
  'customers:write':        60,
  'customers:delete':       80,
  // Enquiries
  'enquiries:read':         40,
  'enquiries:update':       40,
  'enquiries:delete':       80,
  // Appointments
  'appointments:read':      40,
  'appointments:update':    40,
  'appointments:delete':    80,
  // Users
  'users:read':             80,
  'users:write':            80,
  'users:delete':           100,
  // Settings
  'settings:read':          40,
  'settings:write':         80,
  // Plugins
  'plugins:read':           40,
  'plugins:install':        80,
  // Audit
  'audit:read':             80,
  // Marketing
  'marketing:read':         40,
  'marketing:write':        60,
  'marketing:delete':       80,
};

// ─── AUTHENTICATE MIDDLEWARE ──────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id','name','email','role','permissions','is_active'],
    });

    if (!user || !user.is_active)
      return res.status(401).json({ success: false, message: 'Account inactive or not found' });

    req.user = user;

    // Load workforce profile + ABAC policies
    try {
      const db = require('../../config/db.pool');
      const [[profile]] = await db.query(
        'SELECT * FROM workforce_profiles WHERE user_id=$1', [user.id]
      );
      let policies = [];
      if (profile?.policy_ids?.length) {
        [policies] = await db.query(
          'SELECT * FROM permission_policies WHERE id = ANY($1) AND is_active=true',
          [profile.policy_ids]
        );
      }
      req.profile     = profile || null;
      req.permissions = buildPermissions(user, profile, policies);
    } catch {
      req.profile     = null;
      req.permissions = buildPermissions(user, null, []);
    }

    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired' });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ─── AUTHORIZE BY ROLE ────────────────────────────────────────
const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 999));
  if (userLevel < minRequired)
    return res.status(403).json({ success: false, message: `Access denied. Required: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` });
  next();
};

// ─── AUTHORIZE BY PERMISSION ──────────────────────────────────
const can = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const required  = PERMISSIONS[permission] || 100;
  // Check custom permissions array on user
  if (req.user.permissions && Array.isArray(req.user.permissions)) {
    if (req.user.permissions.includes(permission) || req.user.permissions.includes('*')) return next();
  }
  if (userLevel >= required) return next();
  return res.status(403).json({ success: false, message: `Permission denied: ${permission}` });
};

// ─── SUPER ADMIN ONLY ─────────────────────────────────────────
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'super_admin')
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  next();
};

// ─── OPTIONAL AUTH (storefront — works with or without token) ─
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, { attributes: ['id','name','email','role','is_active'] });
      if (user && user.is_active) req.user = user;
    }
  } catch {}
  next();
};

module.exports = { authenticate, authorize, can, superAdminOnly, optionalAuth, ROLE_HIERARCHY, PERMISSIONS };
