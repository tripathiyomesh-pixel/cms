const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'JewelCMS_SuperSecret_Key_2026_ChangeThis';

const signToken = (user) => jwt.sign(
  { id:user.id, email:user.email, role:user.role },
  JWT_SECRET,
  { expiresIn:'7d' }
);

const ok  = (res, data, msg='OK')  => res.json({ success:true,  data, message:msg });
const err = (res, msg, code=400)   => res.status(code).json({ success:false, message:msg });

// ── POST /auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return err(res, 'Email and password required', 422);

    const [[user]] = await db.query(
      'SELECT * FROM users WHERE email=$1 AND is_active=true AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );
    if (!user) return err(res, 'Invalid email or password', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return err(res, 'Invalid email or password', 401);

    // Update last login
    await db.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]);

    const token = signToken(user);

    // Build capabilities dynamically from DB
    const { buildPermissions, loadRoleCapabilities } = require('../../engine/permissions');
    let profile=null, policies=[];
    try {
      const [[p]] = await db.query('SELECT * FROM workforce_profiles WHERE user_id=$1',[user.id]);
      profile = p||null;
      if (profile?.policy_ids?.length) {
        [policies] = await db.query(
          'SELECT * FROM permission_policies WHERE id=ANY($1) AND is_active=true',
          [profile.policy_ids]
        );
      }
    } catch {}
    const roleCaps = await loadRoleCapabilities();
    const perms    = buildPermissions(user, profile, policies||[], roleCaps);

    return ok(res, {
      token,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        capabilities: perms.capabilities,
      },
    }, 'Login successful');
  } catch(e) { return err(res, e.message, 500); }
});

// ── POST /auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role='editor' } = req.body;
    if (!name||!email||!password) return err(res,'Name, email and password required',422);
    const [[existing]] = await db.query('SELECT id FROM users WHERE email=$1',[email]);
    if (existing) return err(res,'Email already registered',409);
    const hash = await bcrypt.hash(password,12);
    const id   = crypto.randomUUID();
    await db.query(
      'INSERT INTO users(id,name,email,password,role,is_active,created_at,updated_at) VALUES($1,$2,$3,$4,$5,true,NOW(),NOW())',
      [id,name,email.toLowerCase().trim(),hash,role]
    );
    return ok(res,{ id,name,email,role },'User created');
  } catch(e) { return err(res,e.message,500); }
});

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id,name,email,role,is_active,last_login,created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    return ok(res,{ user, capabilities: req.permissions?.capabilities||{} });
  } catch(e) { return err(res,e.message,500); }
});

// ── POST /auth/change-password ────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!new_password||new_password.length<8) return err(res,'New password must be at least 8 characters',422);
    const [[user]] = await db.query('SELECT password FROM users WHERE id=$1',[req.user.id]);
    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return err(res,'Current password is incorrect',401);
    const hash = await bcrypt.hash(new_password,12);
    await db.query('UPDATE users SET password=$1,updated_at=NOW() WHERE id=$2',[hash,req.user.id]);
    return ok(res,null,'Password updated');
  } catch(e) { return err(res,e.message,500); }
});

// ── POST /auth/forgot-password ────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [[user]] = await db.query('SELECT id,name,email FROM users WHERE email=$1',[email]);
    // Always return success (don't reveal if email exists)
    if (!user) return ok(res,null,'If that email exists, a reset link has been sent');
    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now()+3600000); // 1 hour
    await db.query(
      `INSERT INTO password_resets(user_id,token,expires_at,created_at)
       VALUES($1,$2,$3,NOW())
       ON CONFLICT(user_id) DO UPDATE SET token=$2,expires_at=$3,created_at=NOW()`,
      [user.id,token,expires]
    );
    return ok(res,null,'If that email exists, a reset link has been sent');
  } catch(e) { return err(res,e.message,500); }
});

// ── POST /auth/logout ─────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  return ok(res, null, 'Logged out');
});

module.exports = router;
