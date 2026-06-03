const { notifyAdmins } = require('../notifications/notifications.routes');
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');

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
    res.json({ success: true, data: { date, available_slots: allSlots.filter(t => !bookedTimes.includes(t)), booked_count: bookedTimes.length } });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, preferred_date, preferred_time, purpose, party_size=1, notes } = req.body;
    if (!customer_name || !customer_phone || !preferred_date || !preferred_time)
      return res.status(422).json({ success: false, message: 'Name, phone, date and time required' });
    const [booked] = await db.query(
      `SELECT id FROM appointments WHERE preferred_date=$1 AND preferred_time=$2 AND status IN ('pending','confirmed')`,
      [preferred_date, preferred_time]
    );
    if (booked.length >= 2) return res.status(409).json({ success: false, message: 'Slot fully booked. Please choose another time.' });
    const [r] = await db.execute(
      `INSERT INTO appointments (customer_name,customer_phone,customer_email,preferred_date,preferred_time,purpose,party_size,notes,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING id`,
      [customer_name, customer_phone, customer_email||null, preferred_date, preferred_time, purpose||null, parseInt(party_size)||1, notes||null]
    );
    res.json({ success: true, data: { id: r[0]?.id || r.rows?.[0]?.id }, message: 'Appointment booked. We will confirm via WhatsApp.' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, status, date, search } = req.query;
    const offset=(page-1)*limit; const params=[];
    let where='WHERE 1=1';
    if(status){ params.push(status); where+=` AND status=$${params.length}`; }
    if(date)  { params.push(date);   where+=` AND preferred_date=$${params.length}`; }
    if(search){ params.push(`%${search}%`); where+=` AND (customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`; }
    const qp=[...params,parseInt(limit),parseInt(offset)];
    const [rows]=await db.query(`SELECT * FROM appointments ${where} ORDER BY preferred_date DESC,preferred_time ASC LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total FROM appointments ${where}`,params);
    notifyAdmins({ type:'new_appointment', title:'New appointment request', body:`${req.body.customer_name||req.body.name||'Customer'} — ${req.body.type||'Consultation'} on ${req.body.appointment_date||'TBD'}`, icon:'calendar', color:'purple', link:'/appointments' }).catch(()=>{});
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/today', authenticate, async (req, res) => {
  try {
    const [rows]=await db.query(`SELECT * FROM appointments WHERE preferred_date=CURRENT_DATE ORDER BY preferred_time ASC`);
    const [counts]=await db.query(`SELECT status,COUNT(*) as count FROM appointments WHERE preferred_date=CURRENT_DATE GROUP BY status`);
    res.json({ success:true, data:{ appointments:rows, summary:counts } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.query('UPDATE appointments SET status=COALESCE($1,status),notes=COALESCE($2,notes),updated_at=NOW() WHERE id=$3',
      [status||null, notes||null, req.params.id]);

    // Send confirmation email when status changes to 'confirmed'
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
      }
    }

    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
