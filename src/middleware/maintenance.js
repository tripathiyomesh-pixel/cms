const db = require('../config/db.pool');
let cache = { enabled: false, message: '', at: 0 };
async function check() {
  if (Date.now() - cache.at < 60000) return cache;
  const [rows] = await db.query(`SELECT key,value FROM settings WHERE key IN ('maintenance_enabled','maintenance_message')`);
  const map = {};
  rows.forEach(r => { map[r.key] = typeof r.value==='string'?r.value.replace(/^"|"$/g,''):String(r.value||''); });
  cache = { enabled: map.maintenance_enabled==='true', message: map.maintenance_message||'We are updating. Back soon.', at: Date.now() };
  return cache;
}
module.exports = async (req, res, next) => {
  const bypass = ['/api/auth','/api/payments/webhook','/api/erp/webhook'];
  if (bypass.some(p => req.path.startsWith(p))) return next();
  try {
    const { enabled, message } = await check();
    if (enabled && req.path.startsWith('/api/storefront')) {
      return res.status(503).json({ success:false, maintenance:true, message });
    }
  } catch {}
  next();
};
