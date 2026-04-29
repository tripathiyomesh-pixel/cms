const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../../database/models');
const { success, error } = require('../../common/response');
const { loginRules, registerRules, validate } = require('../../common/validators/jewellery.validator');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// POST /auth/register  (super_admin only after first user)
router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { name, email, password, role = 'editor' } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return error(res, 'Email already registered', 409);

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });

    const token = signToken(user);
    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 'Registered successfully', 201);
  } catch (e) {
    return error(res, e.message);
  }
});

// POST /auth/login
router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return error(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return error(res, 'Invalid credentials', 401);

    await user.update({ last_login: new Date() });
    const token = signToken(user);

    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
    }, 'Login successful');
  } catch (e) {
    return error(res, e.message);
  }
});

// GET /auth/me
router.get('/me', authenticate, (req, res) =>
  success(res, { user: req.user }, 'Authenticated')
);

// POST /auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!new_password || new_password.length < 8)
      return error(res, 'New password must be at least 8 characters', 422);

    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return error(res, 'Current password is incorrect', 401);

    await user.update({ password: await bcrypt.hash(new_password, 12) });
    return success(res, {}, 'Password changed successfully');
  } catch (e) {
    return error(res, e.message);
  }
});

module.exports = router;
