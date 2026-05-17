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

// ─── FORGOT PASSWORD ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(422).json({ success:false, message:'Email required' });

    const [users] = await db.query('SELECT id,name,email FROM users WHERE email=$1 AND deleted_at IS NULL',[email.toLowerCase()]);
    // Always return success — never confirm if email exists (security)
    if (!users.length) return res.json({ success:true, message:'If this email is registered, you will receive a reset link.' });

    const user  = users[0];
    const token = require('crypto').randomBytes(32).toString('hex');
    const exp   = new Date(Date.now() + 60*60*1000); // 1 hour

    await db.execute('INSERT INTO password_resets (user_id,token,expires_at) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO UPDATE SET token=$2,expires_at=$3,created_at=NOW()',
      [user.id, token, exp]);

    // Send email
    const resetUrl = `${process.env.ADMIN_URL||'http://localhost:3000'}/reset-password?token=${token}`;
    try {
      const { sendEmail } = require('../../config/mailer');
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`
      });
    } catch(e) { console.error('Email send failed:', e.message); }

    res.json({ success:true, message:'If this email is registered, you will receive a reset link.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── RESET PASSWORD ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(422).json({ success:false, message:'Token and password required' });
    if (password.length < 8) return res.status(422).json({ success:false, message:'Password must be at least 8 characters' });

    const [rows] = await db.query('SELECT user_id,expires_at FROM password_resets WHERE token=$1',[token]);
    if (!rows.length) return res.status(400).json({ success:false, message:'Invalid or expired reset link' });
    if (new Date() > new Date(rows[0].expires_at)) return res.status(400).json({ success:false, message:'Reset link expired. Please request a new one.' });

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password=$1,updated_at=NOW() WHERE id=$2',[hash, rows[0].user_id]);
    await db.query('DELETE FROM password_resets WHERE user_id=$1',[rows[0].user_id]);

    res.json({ success:true, message:'Password reset successfully. Please log in.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});
