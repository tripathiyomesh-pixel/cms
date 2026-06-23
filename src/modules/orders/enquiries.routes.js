/**
 * Enquiries Routes
 * Public POST captures product enquiry → syncs CRM lead + logs activity
 * Admin GET/PATCH manages enquiry list
 */
const express   = require('express');
const rateLimit = require('express-rate-limit');

const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  keyGenerator: (req) => req.ip,
  message: { success:false, message:'Too many enquiries from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
const router   = express.Router();
const db       = require('../../config/db.pool');
const { pool } = require('../../config/database');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const ADMIN = ['super_admin','admin','manager','sales_staff'];

// ─── HELPERS ──────────────────────────────────────────────────

async function syncCrmLead({ name, phone, email, source, interest, productId, productName, message }) {
  try {
    // Find or create lead
    const [existing] = await db.query(
      `SELECT id FROM leads WHERE phone=$1 AND deleted_at IS NULL LIMIT 1`, [phone]
    );
    let leadId;
    if (existing.length) {
      leadId = existing[0].id;
      await db.query(
        `UPDATE leads SET stage=CASE WHEN stage='new' THEN 'contacted' ELSE stage END,
         updated_at=NOW() WHERE id=$1`, [leadId]
      );
    } else {
      const [ins] = await db.query(
        `INSERT INTO leads (name,phone,email,source,stage,interest,notes)
         VALUES ($1,$2,$3,$4,'new',$5,$6) RETURNING id`,
        [name, phone, email||null, source||'website', interest||productName||null, message||null]
      );
      leadId = ins[0]?.id;
    }

    // Find or create customer record
    const [custRows] = await db.query(
      `SELECT id FROM customers WHERE phone=$1 LIMIT 1`, [phone]
    );
    let customerId;
    if (!custRows.length) {
      const [ins] = await db.query(
        `INSERT INTO customers (name,phone,email,created_at)
         VALUES ($1,$2,$3,NOW()) ON CONFLICT (phone) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [name, phone, email||null]
      );
      customerId = ins[0]?.id;
    } else {
      customerId = custRows[0].id;
    }

    // Log activity on timeline
    if (customerId) {
      await db.query(
        `INSERT INTO customer_activities (customer_id,type,title,resource_id,resource_type,occurred_at)
         VALUES ($1,'enquiry',$2,$3,'product',NOW())`,
        [customerId, `Enquired about: ${productName||'product'}`, productId||null]
      );
    }

    return { lead_id: leadId, customer_id: customerId };
  } catch(e) {
    console.warn('[enquiry-crm] Non-critical:', e.message);
    return {};
  }
}

function buildWhatsAppUrl({ phone, productName, sku, message }) {
  const wa = phone?.replace(/\D/g,'') || '';
  if (!wa) return null;
  const text = message || `Hi, I'm interested in ${productName||'this item'}${sku?' (SKU: '+sku+')':''}.`;
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

// ─── POST / — Submit enquiry (public) ─────────────────────────
router.post('/', enquiryLimiter, async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email,
      product_id, product_name, product_sku, product_url,
      message, source = 'website',
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(422).json({ success:false, message:'customer_name and customer_phone are required' });
    }

    // Get store WhatsApp number from settings
    const { rows: waRow } = await pool.query(
      `SELECT value FROM settings WHERE key IN ('store_whatsapp','whatsapp_number') LIMIT 1`
    );
    const storeWa = waRow[0]?.value?.replace(/^"|"$/g,'') || '';

    // Insert enquiry record
    const { rows: [enquiry] } = await pool.query(
      `INSERT INTO enquiries
         (customer_name, customer_phone, customer_email,
          product_id, product_name, product_sku, product_url,
          message, source, status, whatsapp_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'new',$10)
       RETURNING *`,
      [customer_name, customer_phone, customer_email||null,
       product_id||null, product_name||null, product_sku||null, product_url||null,
       message||null, source, storeWa||null]
    );

    // Sync to CRM (non-blocking)
    const { lead_id, customer_id } = await syncCrmLead({
      name: customer_name, phone: customer_phone, email: customer_email,
      source, interest: product_name, productId: product_id,
      productName: product_name, message,
    });

    if (lead_id || customer_id) {
      await pool.query(
        `UPDATE enquiries SET lead_id=$1, customer_id=$2 WHERE id=$3`,
        [lead_id||null, customer_id||null, enquiry.id]
      );
    }

    // Build WhatsApp deep-link for the store
    const whatsapp_url = buildWhatsAppUrl({
      phone: storeWa,
      productName: product_name,
      sku: product_sku,
      message: message || `Hi, I'm interested in ${product_name||'your product'}${product_sku?' (SKU: '+product_sku+')':''}.${product_url?' '+product_url:''}`,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry received',
      data: {
        enquiry_id:   enquiry.id,
        whatsapp_url, // storefront redirects here
        reference:    enquiry.id.slice(0,8).toUpperCase(),
      },
    });
  } catch(e) {
    // Graceful degradation — even if DB fails, return WhatsApp URL
    console.error('[enquiry] DB error:', e.message);
    const { rows: waRow } = await pool.query(
      `SELECT value FROM settings WHERE key IN ('store_whatsapp','whatsapp_number') LIMIT 1`
    ).catch(()=>({ rows:[] }));
    const storeWa = waRow[0]?.value?.replace(/^"|"$/g,'') || '';
    const whatsapp_url = storeWa
      ? `https://wa.me/${storeWa.replace(/\D/g,'')}?text=${encodeURIComponent(req.body?.message || 'Hi, I have an enquiry')}`
      : null;
    res.status(200).json({ success:true, message:'Enquiry noted', data:{ whatsapp_url } });
  }
});

// ─── GET / — List enquiries (admin) ───────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=50, status, search, product_id } = req.query;
    const params=[]; let where='WHERE 1=1';
    if (status)     { params.push(status);          where+=` AND e.status=$${params.length}`; }
    if (product_id) { params.push(product_id);      where+=` AND e.product_id=$${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      where+=` AND (e.customer_name ILIKE $${params.length} OR e.customer_phone ILIKE $${params.length} OR e.product_name ILIKE $${params.length} OR e.product_sku ILIKE $${params.length})`;
    }
    const offset = (parseInt(page)-1)*parseInt(limit);
    params.push(parseInt(limit), offset);
    const [rows] = await db.query(
      `SELECT e.*, l.stage AS lead_stage
       FROM enquiries e
       LEFT JOIN leads l ON l.id=e.lead_id
       ${where} ORDER BY e.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    const cntParams = params.slice(0,-2);
    const [[{total}]] = await db.query(
      `SELECT COUNT(*) AS total FROM enquiries e ${where}`, cntParams
    );
    res.json({ success:true, data:rows, total:parseInt(total) });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── GET /stats — dashboard widget ────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER(WHERE status='new')       AS new_count,
        COUNT(*) FILTER(WHERE status='contacted') AS contacted,
        COUNT(*) FILTER(WHERE status='closed')    AS closed,
        COUNT(*) FILTER(WHERE created_at >= NOW()-INTERVAL '24h') AS today
      FROM enquiries
    `);
    res.json({ success:true, data:stats });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── GET /:id — single enquiry ─────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, l.stage AS lead_stage, l.id AS lead_id_check
       FROM enquiries e LEFT JOIN leads l ON l.id=e.lead_id
       WHERE e.id=$1 LIMIT 1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Enquiry not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── PUT /:id — update status / notes ─────────────────────────
router.put('/:id', authenticate, authorize(ADMIN), async (req, res) => {
  try {
    const allowed = ['status','notes','assigned_to'];
    const fields  = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length) return res.json({ success:true, message:'Nothing to update' });
    const vals  = fields.map(f => req.body[f]);
    const sets  = fields.map((f,i) => `${f}=$${i+1}`);
    vals.push(req.params.id);
    const [rows] = await db.query(
      `UPDATE enquiries SET ${sets.join(',')},updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Enquiry not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
