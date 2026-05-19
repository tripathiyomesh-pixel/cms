const db = require('../../config/db.pool');
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
        try { await db.query(`INSERT INTO audit_logs(id,user_id,user_email,action,resource,resource_id,old_data,new_data,ip_address,user_agent,created_at) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`, [req.user?.id||null, req.user?.email||null, action, resource, resourceId, JSON.stringify(oldData)||null, JSON.stringify(newData)||null, req.ip||null, req.headers['user-agent']||null]); } catch(e){} //
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
