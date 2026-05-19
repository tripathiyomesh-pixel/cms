const router  = require('express').Router();
const db      = require('../../config/db.pool');
const { authenticate, authorize } = require('../auth/auth.middleware');
const { buildPermissions } = require('../../engine/permissions');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');

const can = (cap) => async (req, res, next) => {
  try {
    const perms = req.permissions;
    if (!perms || !perms.can(cap)) return res.status(403).json({ success:false, message:`Insufficient permissions: ${cap}` });
    next();
  } catch { res.status(403).json({ success:false, message:'Access denied' }); }
};

// ── BRANCHES ─────────────────────────────────────────────────
router.get('/branches', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM branches ORDER BY is_main DESC, name ASC');
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/branches', authenticate, async (req, res) => {
  try {
    const { name, code, city, country, address, phone, email, is_main } = req.body;
    const [rows] = await db.query(
      `INSERT INTO branches (name,code,city,country,address,phone,email,is_main)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, code, city||'Dubai', country||'UAE', address, phone, email, is_main||false]
    );
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/branches/:id', authenticate, async (req, res) => {
  try {
    const { name, city, country, address, phone, email, is_active } = req.body;
    const [rows] = await db.query(
      `UPDATE branches SET name=$1,city=$2,country=$3,address=$4,phone=$5,email=$6,is_active=$7,updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [name, city, country, address, phone, email, is_active, req.params.id]
    );
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── DEPARTMENTS ───────────────────────────────────────────────
router.get('/departments', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments WHERE is_active=true ORDER BY name ASC');
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/departments', authenticate, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const [rows] = await db.query(
      'INSERT INTO departments (name,code,description) VALUES ($1,$2,$3) RETURNING *',
      [name, code, description]
    );
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── PERMISSION POLICIES ───────────────────────────────────────
router.get('/policies', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM permission_policies WHERE is_active=true ORDER BY name ASC');
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/policies', authenticate, async (req, res) => {
  try {
    const { name, description, capabilities, conditions } = req.body;
    const [rows] = await db.query(
      `INSERT INTO permission_policies (name,description,capabilities,conditions)
       VALUES ($1,$2,$3::jsonb,$4::jsonb) RETURNING *`,
      [name, description, JSON.stringify(capabilities||{}), JSON.stringify(conditions||{})]
    );
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/policies/:id', authenticate, async (req, res) => {
  try {
    const { name, description, capabilities, conditions, is_active } = req.body;
    const [rows] = await db.query(
      `UPDATE permission_policies SET name=$1,description=$2,capabilities=$3::jsonb,conditions=$4::jsonb,is_active=$5,updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, description, JSON.stringify(capabilities||{}), JSON.stringify(conditions||{}), is_active, req.params.id]
    );
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── STAFF (WORKFORCE) ─────────────────────────────────────────

// GET all staff with branch + department + policies
router.get('/staff', authenticate, async (req, res) => {
  try {
    const { branch_id, department_id, role, is_active, page=1, limit=25 } = req.query;
    let q = `
      SELECT
        u.id, u.name, u.email, u.is_active,
        wp.employee_id, wp.job_title, wp.role, wp.employment_type,
        wp.join_date, wp.last_active, wp.is_active as profile_active,
        b.id as branch_id, b.name as branch_name,
        d.id as department_id, d.name as department_name,
        m.name as manager_name,
        wp.policy_ids
      FROM users u
      JOIN workforce_profiles wp ON wp.user_id = u.id
      LEFT JOIN branches b ON b.id = wp.branch_id
      LEFT JOIN departments d ON d.id = wp.department_id
      LEFT JOIN users m ON m.id = wp.manager_id
      WHERE 1=1
    `;
    const vals = [];
    if (branch_id)     { vals.push(branch_id);     q += ` AND wp.branch_id=$${vals.length}`; }
    if (department_id) { vals.push(department_id); q += ` AND wp.department_id=$${vals.length}`; }
    if (role)          { vals.push(role);           q += ` AND wp.role=$${vals.length}`; }
    if (is_active !== undefined) { vals.push(is_active==='true'); q += ` AND u.is_active=$${vals.length}`; }
    q += ` ORDER BY u.name ASC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page)-1)*parseInt(limit)}`;
    const [rows] = await db.query(q, vals);
    const [[{count}]] = await db.query('SELECT COUNT(*) FROM workforce_profiles');
    res.json({ success:true, data:{ data:rows, total:+count, page:+page, limit:+limit } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET single staff with full permissions
router.get('/staff/:id', authenticate, async (req, res) => {
  try {
    const [[user]] = await db.query('SELECT id,name,email,is_active FROM users WHERE id=$1', [req.params.id]);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    const [[profile]] = await db.query('SELECT * FROM workforce_profiles WHERE user_id=$1', [req.params.id]);
    let policies = [];
    if (profile?.policy_ids?.length) {
      [policies] = await db.query('SELECT * FROM permission_policies WHERE id = ANY($1)', [profile.policy_ids]);
    }
    const perms = buildPermissions(user, profile, policies);
    res.json({ success:true, data:{ user, profile, policies, capabilities:perms.capabilities, role:perms.role } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST — create staff member
// Flow: Admin → Create Staff → Assign Branch/Dept → Send Activation
router.post('/staff', authenticate, async (req, res) => {
  try {
    const {
      name, email, role='sales_staff',
      branch_id, department_id, manager_id,
      job_title, employment_type='full_time',
      employee_id, join_date, policy_ids=[],
    } = req.body;

    if (!name || !email) return res.status(422).json({ success:false, message:'Name and email required' });

    // Check email unique
    const [[existing]] = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing) return res.status(409).json({ success:false, message:'Email already exists' });

    // Create user with temp password
    const tempPass = crypto.randomBytes(8).toString('hex');
    const hash     = await bcrypt.hash(tempPass, 12);
    const userId   = crypto.randomUUID();

    await db.query(
      'INSERT INTO users (id,name,email,password,role,is_active) VALUES ($1,$2,$3,$4,$5,false)',
      [userId, name, email, hash, role]
    );

    // Create workforce profile
    const activationToken   = crypto.randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 7*24*60*60*1000); // 7 days

    await db.query(
      `INSERT INTO workforce_profiles
        (user_id,branch_id,department_id,manager_id,job_title,employment_type,
         employee_id,join_date,role,policy_ids,activation_token,activation_expires)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [userId, branch_id||null, department_id||null, manager_id||null,
       job_title, employment_type, employee_id||null,
       join_date||null, role, policy_ids,
       activationToken, activationExpires]
    );

    // TODO: send activation email with link
    // For now return the activation link
    const activationLink = `${process.env.APP_URL||'http://localhost:3010'}/activate?token=${activationToken}`;

    res.json({
      success: true,
      message: 'Staff member created — activation link generated',
      data: { id:userId, name, email, activation_link:activationLink },
    });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// PUT — update staff profile + policies
router.put('/staff/:id', authenticate, async (req, res) => {
  try {
    const {
      name, role, branch_id, department_id, manager_id,
      job_title, employment_type, policy_ids, capability_overrides, is_active,
    } = req.body;

    if (name || is_active !== undefined) {
      await db.query(
        'UPDATE users SET name=COALESCE($1,name), is_active=COALESCE($2,is_active), updated_at=NOW() WHERE id=$3',
        [name, is_active, req.params.id]
      );
    }

    await db.query(
      `UPDATE workforce_profiles SET
        role=COALESCE($1,role),
        branch_id=COALESCE($2,branch_id),
        department_id=COALESCE($3,department_id),
        manager_id=COALESCE($4,manager_id),
        job_title=COALESCE($5,job_title),
        employment_type=COALESCE($6,employment_type),
        policy_ids=COALESCE($7,policy_ids),
        capability_overrides=COALESCE($8::jsonb,capability_overrides),
        updated_at=NOW()
       WHERE user_id=$9`,
      [role, branch_id, department_id, manager_id, job_title, employment_type,
       policy_ids, capability_overrides?JSON.stringify(capability_overrides):null,
       req.params.id]
    );

    res.json({ success:true, message:'Staff updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST — assign policies to staff
router.post('/staff/:id/policies', authenticate, async (req, res) => {
  try {
    const { policy_ids } = req.body;
    await db.query('UPDATE workforce_profiles SET policy_ids=$1, updated_at=NOW() WHERE user_id=$2', [policy_ids, req.params.id]);
    res.json({ success:true, message:'Policies assigned' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST — activate staff account
router.post('/staff/activate', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(422).json({ success:false, message:'Token and password required' });

    const [[profile]] = await db.query(
      'SELECT * FROM workforce_profiles WHERE activation_token=$1 AND activation_expires > NOW()',
      [token]
    );
    if (!profile) return res.status(400).json({ success:false, message:'Invalid or expired activation link' });

    const hash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password=$1, is_active=true, updated_at=NOW() WHERE id=$2', [hash, profile.user_id]);
    await db.query('UPDATE workforce_profiles SET activation_token=NULL, activation_expires=NULL, updated_at=NOW() WHERE user_id=$1', [profile.user_id]);

    res.json({ success:true, message:'Account activated — you can now login' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET — workforce org chart
router.get('/org-chart', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id, u.name, u.email,
        wp.role, wp.job_title,
        wp.manager_id,
        b.name as branch,
        d.name as department
      FROM users u
      JOIN workforce_profiles wp ON wp.user_id = u.id
      LEFT JOIN branches b ON b.id = wp.branch_id
      LEFT JOIN departments d ON d.id = wp.department_id
      WHERE u.is_active = true
      ORDER BY wp.role, u.name
    `);
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
