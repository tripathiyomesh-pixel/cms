/**
 * VANTIX-CMS — CRM Routes
 *
 * Phase 2 addition: Activity timeline, notes, and lead pipeline
 * for the Customers module.
 *
 * Tables auto-created on startup:
 *   customer_notes       — freeform notes per customer
 *   customer_activities  — timeline events (enquiry, appointment, order, note, call, email)
 *   leads                — lead pipeline (new → contacted → qualified → proposal → won/lost)
 */
const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const MGMT = ['super_admin', 'admin', 'manager'];

// ── Ensure CRM tables ─────────────────────────────────────────────────────────
async function ensureCrmTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_notes (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID        NOT NULL,
      user_id     UUID        NOT NULL,
      user_name   VARCHAR(150),
      content     TEXT        NOT NULL,
      is_pinned   BOOLEAN     DEFAULT FALSE,
      created_at  TIMESTAMP   DEFAULT NOW(),
      updated_at  TIMESTAMP   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_cnotes_customer ON customer_notes(customer_id);

    CREATE TABLE IF NOT EXISTS customer_activities (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id   UUID        NOT NULL,
      type          VARCHAR(30) NOT NULL,  -- enquiry|appointment|order|note|call|email|whatsapp|visit
      title         VARCHAR(300) NOT NULL,
      description   TEXT,
      resource_id   UUID,                  -- linked enquiry/order/appointment id
      resource_type VARCHAR(50),
      user_id       UUID,
      user_name     VARCHAR(150),
      occurred_at   TIMESTAMP   DEFAULT NOW(),
      created_at    TIMESTAMP   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_cactivity_customer ON customer_activities(customer_id);
    CREATE INDEX IF NOT EXISTS idx_cactivity_occurred ON customer_activities(occurred_at DESC);

    CREATE TABLE IF NOT EXISTS leads (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id     UUID,
      name            VARCHAR(200) NOT NULL,
      email           VARCHAR(200),
      phone           VARCHAR(50),
      source          VARCHAR(50) DEFAULT 'website',   -- website|whatsapp|walk-in|exhibition|referral|rapnet
      stage           VARCHAR(30) DEFAULT 'new',        -- new|contacted|qualified|proposal|won|lost
      interest        TEXT,                             -- what they're looking for
      budget_min      NUMERIC(15,2),
      budget_max      NUMERIC(15,2),
      currency        VARCHAR(10) DEFAULT 'AED',
      assigned_to     UUID,
      assigned_name   VARCHAR(150),
      priority        VARCHAR(10) DEFAULT 'normal',     -- low|normal|high
      lost_reason     TEXT,
      expected_close  DATE,
      notes           TEXT,
      value           NUMERIC(15,2),                   -- expected deal value
      created_at      TIMESTAMP   DEFAULT NOW(),
      updated_at      TIMESTAMP   DEFAULT NOW(),
      converted_at    TIMESTAMP,
      deleted_at      TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_leads_stage    ON leads(stage) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
    CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
  `);
  console.log('[crm] Tables ready');
}
ensureCrmTables().catch(e => console.error('[crm] Table init error:', e.message));

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER ACTIVITY TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/crm/customers/:id/timeline
router.get('/customers/:id/timeline', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { rows } = await pool.query(
      `SELECT id, type, title, description, resource_id, resource_type,
              user_name, occurred_at
       FROM customer_activities
       WHERE customer_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2`,
      [req.params.id, limit]
    );
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/crm/customers/:id/activities — log a manual activity
router.post('/customers/:id/activities', authenticate, async (req, res) => {
  try {
    const { type, title, description, occurred_at } = req.body;
    if (!type || !title) return res.status(422).json({ success: false, message: 'type and title required' });

    const { rows } = await pool.query(
      `INSERT INTO customer_activities
         (customer_id, type, title, description, user_id, user_name, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.id, type, title, description || null,
       req.user.id, req.user.name,
       occurred_at ? new Date(occurred_at) : new Date()]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER NOTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/crm/customers/:id/notes
router.get('/customers/:id/notes', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM customer_notes WHERE customer_id=$1 ORDER BY is_pinned DESC, created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/crm/customers/:id/notes
router.post('/customers/:id/notes', authenticate, async (req, res) => {
  try {
    const { content, is_pinned = false } = req.body;
    if (!content?.trim()) return res.status(422).json({ success: false, message: 'content required' });

    const { rows } = await pool.query(
      `INSERT INTO customer_notes (customer_id, user_id, user_name, content, is_pinned)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, req.user.id, req.user.name, content.trim(), is_pinned]
    );

    // Log to activity timeline
    await pool.query(
      `INSERT INTO customer_activities
         (customer_id, type, title, user_id, user_name, resource_id, resource_type)
       VALUES ($1, 'note', 'Note added', $2, $3, $4, 'customer_note')`,
      [req.params.id, req.user.id, req.user.name, rows[0].id]
    ).catch(() => {});

    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PATCH /api/crm/customers/:customerId/notes/:noteId
router.patch('/customers/:customerId/notes/:noteId', authenticate, async (req, res) => {
  try {
    const { content, is_pinned } = req.body;
    const updates = [];
    const vals    = [];
    if (content !== undefined)    { vals.push(content);    updates.push(`content=$${vals.length}`);    }
    if (is_pinned !== undefined)  { vals.push(is_pinned);  updates.push(`is_pinned=$${vals.length}`);  }
    if (!updates.length) return res.json({ success: true, message: 'Nothing to update' });
    vals.push(req.params.noteId);
    const { rows } = await pool.query(
      `UPDATE customer_notes SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${vals.length} AND customer_id=$${vals.length+1} RETURNING *`,
      [...vals, req.params.customerId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/crm/customers/:customerId/notes/:noteId
router.delete('/customers/:customerId/notes/:noteId', authenticate, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM customer_notes WHERE id=$1 AND customer_id=$2`,
      [req.params.noteId, req.params.customerId]
    );
    res.json({ success: true, message: 'Note deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEADS PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

// GET /api/crm/leads — list with optional stage filter
router.get('/leads', authenticate, async (req, res) => {
  try {
    const { stage, search, assigned_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE deleted_at IS NULL';

    if (stage)       { params.push(stage);            where += ` AND stage=$${params.length}`; }
    if (assigned_to) { params.push(assigned_to);      where += ` AND assigned_to=$${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(
      `SELECT * FROM leads ${where} ORDER BY priority DESC, created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );

    // Stage counts for Kanban header
    const { rows: counts } = await pool.query(
      `SELECT stage, COUNT(*) as count FROM leads WHERE deleted_at IS NULL GROUP BY stage`
    );
    const stageCounts = Object.fromEntries(counts.map(r => [r.stage, parseInt(r.count)]));

    res.json({ success: true, data: rows, stageCounts });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/crm/leads/board — grouped by stage for Kanban
router.get('/leads/board', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM leads WHERE deleted_at IS NULL ORDER BY priority DESC, created_at DESC LIMIT 500`
    );
    const board = Object.fromEntries(STAGES.map(s => [s, []]));
    for (const lead of rows) {
      if (board[lead.stage]) board[lead.stage].push(lead);
    }
    res.json({ success: true, data: board });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/crm/leads/:id
router.get('/leads/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM leads WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/crm/leads
router.post('/leads', authenticate, async (req, res) => {
  try {
    const {
      name, email, phone, source = 'website', stage = 'new', interest,
      budget_min, budget_max, currency = 'AED', assigned_to, assigned_name,
      priority = 'normal', notes, value, expected_close, customer_id,
    } = req.body;
    if (!name) return res.status(422).json({ success: false, message: 'name required' });

    const { rows } = await pool.query(
      `INSERT INTO leads
         (name, email, phone, source, stage, interest, budget_min, budget_max,
          currency, assigned_to, assigned_name, priority, notes, value,
          expected_close, customer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [name, email||null, phone||null, source, stage, interest||null,
       budget_min||null, budget_max||null, currency,
       assigned_to||null, assigned_name||null, priority, notes||null,
       value||null, expected_close||null, customer_id||null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PATCH /api/crm/leads/:id — update stage, notes, any field
router.patch('/leads/:id', authenticate, async (req, res) => {
  try {
    const allowed = ['name','email','phone','source','stage','interest','budget_min','budget_max',
                     'currency','assigned_to','assigned_name','priority','notes','value',
                     'expected_close','lost_reason'];
    const fields = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length) return res.json({ success: true, message: 'Nothing to update' });

    const vals = fields.map(f => req.body[f]);
    const sets = fields.map((f, i) => `${f}=$${i+1}`);

    // Mark converted if moving to 'won'
    if (req.body.stage === 'won') { sets.push(`converted_at=NOW()`); }
    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE leads SET ${sets.join(', ')}, updated_at=NOW() WHERE id=$${vals.length} AND deleted_at IS NULL RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/crm/leads/:id (soft)
router.delete('/leads/:id', authenticate, authorize(MGMT), async (req, res) => {
  try {
    await pool.query(`UPDATE leads SET deleted_at=NOW() WHERE id=$1`, [req.params.id]);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// CRM STATS — for dashboard widget
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [
      { rows: leadStats },
      { rows: [{ total_customers }] },
      { rows: recentActivities },
    ] = await Promise.all([
      pool.query(`SELECT stage, COUNT(*) as count, SUM(value) as value FROM leads WHERE deleted_at IS NULL GROUP BY stage`),
      pool.query(`SELECT COUNT(*) as total_customers FROM customers`),
      pool.query(`SELECT ca.*, c.name as customer_name FROM customer_activities ca LEFT JOIN customers c ON c.id=ca.customer_id ORDER BY occurred_at DESC LIMIT 5`),
    ]);

    const pipeline = Object.fromEntries(STAGES.map(s => {
      const row = leadStats.find(r => r.stage === s);
      return [s, { count: parseInt(row?.count || 0), value: parseFloat(row?.value || 0) }];
    }));

    res.json({
      success: true,
      data: {
        total_customers: parseInt(total_customers),
        pipeline,
        total_leads: leadStats.reduce((s, r) => s + parseInt(r.count), 0),
        open_leads: leadStats.filter(r => !['won','lost'].includes(r.stage)).reduce((s, r) => s + parseInt(r.count), 0),
        recent_activities: recentActivities,
      },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
