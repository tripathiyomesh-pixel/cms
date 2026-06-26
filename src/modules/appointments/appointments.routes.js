/**
 * VANTIX-CMS — Appointments Routes
 *
 * Bug fix: notifyAdmins was called inside GET / (on every list load).
 * It is now only called inside POST / (on new booking).
 *
 * Phase 4 addition: New appointment auto-creates a CRM lead + activity.
 */
const { notifyAdmins }    = require('../notifications/notifications.routes');
const { triggerWebhooks } = require('../webhooks/webhooks.routes');
const express             = require('express');
const router              = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { pool }            = require('../../config/database');
const db                  = require('../../config/db.pool');

// ── Helper: auto-upsert into CRM when a customer action occurs ───────────────
async function syncToCrm({ customerName, customerPhone, customerEmail, source, interest, activityType, activityTitle, resourceId }) {
  try {
    // 1. Find or create a CRM lead for this person
    let leadId;
    const existing = await pool.query(
      `SELECT id FROM leads WHERE phone = $1 AND deleted_at IS NULL LIMIT 1`,
      [customerPhone]
    ).catch(() => ({ rows: [] }));

    if (existing.rows.length) {
      leadId = existing.rows[0].id;
      // Move to 'contacted' if still 'new'
      await pool.query(
        `UPDATE leads SET stage = CASE WHEN stage='new' THEN 'contacted' ELSE stage END,
         updated_at=NOW() WHERE id=$1`,
        [leadId]
      ).catch(() => {});
    } else {
      const ins = await pool.query(
        `INSERT INTO leads (name, phone, email, source, stage, interest)
         VALUES ($1, $2, $3, $4, 'new', $5) RETURNING id`,
        [customerName, customerPhone, customerEmail || null, source, interest || null]
      ).catch(() => ({ rows: [] }));
      leadId = ins.rows[0]?.id;
    }

    // 2. Find or create a customers record
    let customerId;
    const cust = await pool.query(
      `SELECT id FROM customers WHERE phone = $1 LIMIT 1`,
      [customerPhone]
    ).catch(() => ({ rows: [] }));

    if (!cust.rows.length) {
      const ins = await pool.query(
        `INSERT INTO customers (name, phone, email, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (phone) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [customerName, customerPhone, customerEmail || null]
      ).catch(() => ({ rows: [] }));
      customerId = ins.rows[0]?.id;
    } else {
      customerId = cust.rows[0].id;
    }

    // 3. Log activity on the customer timeline
    if (customerId) {
      await pool.query(
        `INSERT INTO customer_activities
           (customer_id, type, title, resource_id, resource_type, occurred_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [customerId, activityType, activityTitle, resourceId || null, activityType]
      ).catch(() => {});
    }
  } catch (e) {
    console.warn('[crm-sync] Non-critical error:', e.message);
  }
}

// ── GET /appointments/slots ──────────────────────────────────────────────────
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(422).json({ success: false, message: 'date required' });
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) return res.json({ success: true, data: { available_slots: [], message: 'Closed Sundays' } });
    const allSlots = ['10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
    const [booked] = await db.query(
      `SELECT preferred_time FROM appointments WHERE preferred_date=$1 AND status IN ('pending','confirmed')`, [date]
    );
    const bookedTimes = booked.map(b => b.preferred_time);
    res.json({ success: true, data: {
      date,
      available_slots: allSlots.filter(t => !bookedTimes.includes(t)),
      booked_count: bookedTimes.length,
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /appointments — Book new appointment ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email,
            preferred_date, preferred_time, purpose,
            party_size = 1, notes, location } = req.body;

    if (!customer_name || !customer_phone || !preferred_date || !preferred_time)
      return res.status(422).json({ success: false, message: 'Name, phone, date and time required' });

    // Check slot availability
    const [booked] = await db.query(
      `SELECT id FROM appointments WHERE preferred_date=$1 AND preferred_time=$2 AND status IN ('pending','confirmed')`,
      [preferred_date, preferred_time]
    );
    if (booked.length >= 2)
      return res.status(409).json({ success: false, message: 'Slot fully booked. Please choose another time.' });

    // Create appointment
    const [r] = await db.execute(
      `INSERT INTO appointments
         (customer_name, customer_phone, customer_email, preferred_date, preferred_time,
          purpose, party_size, notes, location, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING id`,
      [customer_name, customer_phone, customer_email || null,
       preferred_date, preferred_time, purpose || null,
       parseInt(party_size) || 1, notes || null, location || null]
    );
    const appointmentId = r[0]?.id || r.rows?.[0]?.id;

    // Notify admins (fire-and-forget)
    notifyAdmins({
      type: 'new_appointment',
      title: 'New appointment request',
      body: `${customer_name} — ${purpose || 'Consultation'} on ${preferred_date} at ${preferred_time}`,
      icon: 'calendar', color: 'purple', link: '/appointments',
    }).catch(() => {});

    // Auto-sync to CRM (fire-and-forget — never fail the booking)
    syncToCrm({
      customerName:  customer_name,
      customerPhone: customer_phone,
      customerEmail: customer_email,
      source:       'website',
      interest:     purpose,
      activityType: 'appointment',
      activityTitle: `Appointment booked — ${purpose || 'Consultation'} on ${preferred_date} at ${preferred_time}`,
      resourceId:   appointmentId,
    }).catch(() => {});

    res.json({
      success: true,
      data: { id: appointmentId },
      message: 'Appointment booked. We will confirm via WhatsApp.',
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /appointments ────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status);         where += ` AND status=$${params.length}`; }
    if (date)   { params.push(date);            where += ` AND preferred_date=$${params.length}`; }
    if (search) { params.push(`%${search}%`);   where += ` AND (customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`; }
    const qp = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(
      `SELECT * FROM appointments ${where} ORDER BY preferred_date DESC, preferred_time ASC LIMIT $${qp.length - 1} OFFSET $${qp.length}`,
      qp
    );
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM appointments ${where}`, params);
    res.json({ success: true, data: { data: rows, total: +cnt[0]?.total || 0, page: +page } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /appointments/today ──────────────────────────────────────────────────
router.get('/today', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM appointments WHERE preferred_date=CURRENT_DATE ORDER BY preferred_time ASC`);
    const [counts] = await db.query(`SELECT status, COUNT(*) as count FROM appointments WHERE preferred_date=CURRENT_DATE GROUP BY status`);
    res.json({ success: true, data: { appointments: rows, counts } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /appointments/:id ────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM appointments WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── PATCH /appointments/:id ──────────────────────────────────────────────────
router.patch('/:id', authenticate, authorize(['super_admin', 'admin', 'manager']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.query(
      'UPDATE appointments SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW() WHERE id=$3',
      [status || null, notes || null, req.params.id]
    );

    // Send confirmation email when status → confirmed
    if (status === 'confirmed') {
      const [[appt]] = await db.query(
        `SELECT a.*, sl.name as location_name
         FROM appointments a
         LEFT JOIN store_locations sl ON sl.id = a.location_id
         WHERE a.id = $1 LIMIT 1`,
        [req.params.id]
      ).catch(() => [[]]);

      if (appt?.customer_email) {
        const emailService = require('../../services/email.service');
        emailService.sendAppointmentConfirmation({
          to:         appt.customer_email,
          name:       appt.customer_name || 'Valued Customer',
          bookingRef: appt.booking_ref || appt.id?.slice(0, 8).toUpperCase(),
          date:       appt.preferred_date
            ? new Date(appt.preferred_date).toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : '—',
          time:       appt.preferred_time || '—',
          location:   appt.location_name || 'Our Boutique',
          purpose:    appt.purpose || 'Jewellery consultation',
        }).catch(e => console.error('[appointments] Email send failed:', e.message));

        // Log confirmation on CRM timeline
        syncToCrm({
          customerName:  appt.customer_name,
          customerPhone: appt.customer_phone,
          customerEmail: appt.customer_email,
          source:        'website',
          activityType:  'appointment',
          activityTitle: `Appointment confirmed — ${appt.preferred_date} at ${appt.preferred_time}`,
          resourceId:    req.params.id,
        }).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
module.exports.syncToCrm = syncToCrm; // exported for use in enquiries

