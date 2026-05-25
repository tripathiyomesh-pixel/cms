const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { pool } = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

router.get('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,name,email,role,permissions,is_active,last_login,created_at FROM users ORDER BY created_at DESC`
    );
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.get('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,name,email,role,permissions,is_active,last_login,created_at FROM users WHERE id=$1 LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'User not found', 404);
    success(res, rows[0]);
  } catch (e) { error(res, e.message); }
});

router.put('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { name, role, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
        name=COALESCE($1,name), role=COALESCE($2,role),
        is_active=COALESCE($3,is_active), updated_at=NOW()
       WHERE id=$4
       RETURNING id,name,email,role,is_active`,
      [name||null, role||null, is_active??null, req.params.id]
    );
    if (!rows.length) return error(res, 'User not found', 404);
    success(res, rows[0], 'User updated');
  } catch (e) { error(res, e.message); }
});

router.put('/:id/permissions', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { permissions } = req.body;
    if (typeof permissions !== 'object') return error(res, 'permissions must be an object', 422);
    const { rows } = await pool.query(
      `UPDATE users SET permissions=$1, updated_at=NOW() WHERE id=$2 RETURNING id,permissions`,
      [JSON.stringify(permissions), req.params.id]
    );
    if (!rows.length) return error(res, 'User not found', 404);
    success(res, rows[0], 'Permissions updated');
  } catch (e) { error(res, e.message); }
});

router.put('/:id/password', authenticate, async (req, res) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== 'super_admin')
      return error(res, 'Cannot change another user\'s password', 403);
    const { current_password, new_password } = req.body;
    if (!new_password || new_password.length < 8) return error(res, 'Password must be at least 8 characters', 422);
    const { rows: [user] } = await pool.query(`SELECT password FROM users WHERE id=$1`, [req.params.id]);
    if (!user) return error(res, 'User not found', 404);
    if (current_password) {
      const valid = await bcrypt.compare(current_password, user.password);
      if (!valid) return error(res, 'Current password is incorrect', 401);
    }
    const hash = await bcrypt.hash(new_password, 12);
    await pool.query(`UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2`, [hash, req.params.id]);
    success(res, {}, 'Password updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:id', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return error(res, 'Cannot delete yourself', 422);
    const { rowCount } = await pool.query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
    if (!rowCount) return error(res, 'User not found', 404);
    success(res, {}, 'User deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
