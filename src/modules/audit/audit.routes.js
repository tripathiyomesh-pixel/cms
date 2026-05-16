/**
 * Audit log viewer
 * GET /api/audit — paginated log with filters
 */
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');

router.get('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, resource, action, from, to } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (user_id)  { params.push(user_id);  where += ` AND user_id = $${params.length}`; }
    if (resource) { params.push(resource); where += ` AND resource = $${params.length}`; }
    if (action)   { params.push(action);   where += ` AND action = $${params.length}`; }
    if (from)     { params.push(from);     where += ` AND created_at >= $${params.length}`; }
    if (to)       { params.push(to);       where += ` AND created_at <= $${params.length}`; }
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(
      `SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON u.id::text = al.user_id::text ${where} ORDER BY al.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    const cParams = params.slice(0, params.length - 2);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM audit_logs ${where}`, cParams);
    res.json({ success: true, data: rows, total: +cnt[0]?.total || 0, page: +page });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
