const jwt  = require('jsonwebtoken');
const { pool } = require('../../config/database');

const ROLE_HIERARCHY = { super_admin:100, admin:80, manager:60, editor:40, viewer:20 };

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success:false, message:'No token provided' });

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);

    const { rows } = await pool.query(
      `SELECT id,name,email,role,permissions,is_active FROM users WHERE id=$1 LIMIT 1`,
      [decoded.id]
    );
    const user = rows[0];
    if (!user || !user.is_active)
      return res.status(401).json({ success:false, message:'Account inactive or not found' });

    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ success:false, message:'Token expired' });
    return res.status(401).json({ success:false, message:'Invalid token' });
  }
};

const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success:false, message:'Not authenticated' });
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 999));
  if (userLevel < minRequired)
    return res.status(403).json({ success:false, message:`Access denied. Required: ${allowedRoles.join(' or ')}` });
  next();
};

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'super_admin')
    return res.status(403).json({ success:false, message:'Super admin access required' });
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      const { rows } = await pool.query(
        `SELECT id,name,email,role,is_active FROM users WHERE id=$1 LIMIT 1`, [decoded.id]
      );
      if (rows[0]?.is_active) req.user = rows[0];
    }
  } catch {}
  next();
};

module.exports = { authenticate, authorize, superAdminOnly, optionalAuth, ROLE_HIERARCHY };
