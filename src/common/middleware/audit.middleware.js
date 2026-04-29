const { AuditLog } = require('../../database/models');
const logger = require('../../config/logger');

/**
 * Middleware factory — call after action to log it
 * Usage: auditLog('UPDATE', 'product')(req, res, next)
 */
const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async function (body) {
    if (body && body.success) {
      try {
        await AuditLog.create({
          user_id:     req.user?.id,
          user_email:  req.user?.email,
          action,
          resource,
          resource_id: req.params?.id || body?.data?.id,
          old_data:    req._oldData || null,
          new_data:    body?.data || null,
          ip_address:  req.ip,
          user_agent:  req.headers['user-agent'],
        });
      } catch (e) {
        logger.error('Audit log error:', e.message);
      }
    }
    return originalJson(body);
  };
  next();
};

module.exports = { auditLog };
