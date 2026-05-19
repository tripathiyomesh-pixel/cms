const express = require('express');
const bcrypt  = require('bcryptjs');
const db = require('../../config/db.pool');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const router = express.Router();

// GET /users
router.get('/', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });
    success(res, users);
  } catch (e) { error(res, e.message); }
});

// GET /users/:id
router.get('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return error(res, 'User not found', 404);
    success(res, user);
  } catch (e) { error(res, e.message); }
});

// PUT /users/:id  — update name, role, is_active
router.put('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    const { name, role, is_active } = req.body;
    await user.update({ name, role, is_active });
    success(res, { id: user.id, name: user.name, role: user.role, is_active: user.is_active }, 'User updated');
  } catch (e) { error(res, e.message); }
});

// PUT /users/:id/permissions
router.put('/:id/permissions', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    const { permissions } = req.body;
    if (typeof permissions !== 'object') return error(res, 'permissions must be an object', 422);
    await user.update({ permissions });
    success(res, { id: user.id, permissions: user.permissions }, 'Permissions updated');
  } catch (e) { error(res, e.message); }
});

// DELETE /users/:id
router.delete('/:id', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return error(res, 'Cannot delete yourself', 422);
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    await user.destroy();
    success(res, {}, 'User deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
