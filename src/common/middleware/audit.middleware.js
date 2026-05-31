const { pool } = require('../../config/database');
const logger   = require('../../config/logger');

/**
 * Audit log middleware factory.
 * Usage: router.post('/something', authenticate, auditLog('CREATE', 'product'), handler)
 */
const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async function (body) {
    if (body && body.success) {
      try {
        await pool.query(
          `INSERT INTO audit_logs
             (user_id, user_email, action, resource, resource_id,
              new_data, ip_address, user_agent, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
          [
            req.user?.id        || null,
            req.user?.email     || null,
            action,
            resource,
            req.params?.id      || body?.data?.id || null,
            body?.data          ? JSON.stringify(body.data) : null,
            req.ip              || null,
            req.headers['user-agent'] || null,
          ]
        );
      } catch (e) {
        logger.error('Audit log error:', e.message);
      }
    }
    return originalJson(body);
  };
  next();
};

module.exports = { auditLog };
