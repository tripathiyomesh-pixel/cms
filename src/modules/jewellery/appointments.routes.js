const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/database');
const { successResponse, errorResponse } = require('../../common/response');

// ─── PUBLIC: Get available time slots for a date + location ──
router.get('/slots', async (req, res) => {
  try {
    const { license_id, location_id, date } = req.query;
    if (!license_id || !date) return res.status(400).json(errorResponse('license_id and date required'));

    // Get slot settings for this store
    const [settings] = await db.query(
      `SELECT setting_value FROM settings 
       WHERE license_id=? AND setting_key='appointment_slots'`,
      [license_id]
    );

    // Default slots if not configured
    const defaultSlots = [
      '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
      '12:00 PM','12:30 PM','02:00 PM','02:30 PM',
      '03:00 PM','03:30 PM','04:00 PM','04:30 PM',
      '05:00 PM','05:30 PM','06:00 PM','07:00 PM'
    ];
    const allSlots = settings.length
      ? JSON.parse(settings[0].setting_value)
      : defaultSlots;

    // Get already-booked slots for this date+location
    let bookedQuery = `SELECT preferred_time FROM appointments 
                       WHERE license_id=? AND preferred_date=? 
                       AND status NOT IN ('cancelled')`;
    const bookedParams = [license_id, date];
    if (location_id) {
      bookedQuery += ' AND location_id=?';
      bookedParams.push(location_id);
    }
    const [booked] = await db.query(bookedQuery, bookedParams);
    const bookedTimes = booked.map(b => b.preferred_time);

    // Get max bookings per slot (default 2)
    const [maxSetting] = await db.query(
      `SELECT setting_value FROM settings WHERE license_id=? AND setting_key='appointments_per_slot'`,
      [license_id]
    );
    const maxPerSlot = maxSetting.length ? parseInt(maxSetting[0].setting_value) : 2;

    // Count bookings per slot
    const slotCounts = {};
    bookedTimes.forEach(t => { slotCounts[t] = (slotCounts[t] || 0) + 1; });

    const slots = allSlots.map(time => ({
      time,
      available: (slotCounts[time] || 0) < maxPerSlot,
      remaining: maxPerSlot - (slotCounts[time] || 0)
    }));

    return res.json(successResponse({ date, slots }));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── PUBLIC: Book an appointment ─────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      license_id, location_id, customer_name, customer_phone, customer_email,
      preferred_date, preferred_time, purpose, product_ref, product_name,
      product_url, party_size, special_requests, lang
    } = req.body;

    if (!license_id || !customer_name || !customer_phone || !preferred_date || !preferred_time) {
      return res.status(400).json(errorResponse('Required: license_id, customer_name, customer_phone, preferred_date, preferred_time'));
    }

    // Generate booking reference
    const ref = 'APT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();

    const [result] = await db.query(
      `INSERT INTO appointments 
        (license_id, location_id, customer_name, customer_phone, customer_email,
         preferred_date, preferred_time, purpose, product_ref, product_name,
         product_url, party_size, special_requests, booking_ref, status, lang)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`,
      [
        license_id, location_id || null, customer_name, customer_phone, customer_email || null,
        preferred_date, preferred_time, purpose || 'Product discovery',
        product_ref || null, product_name || null, product_url || null,
        party_size || 1, special_requests || null, ref, lang || 'en'
      ]
    );

    // Get location details for confirmation
    let locationDetails = null;
    if (location_id) {
      const [loc] = await db.query('SELECT * FROM store_locations WHERE id=?', [location_id]);
      if (loc.length) locationDetails = loc[0];
    }

    return res.json(successResponse({
      booking_ref: ref,
      appointment_id: result.insertId,
      customer_name,
      preferred_date,
      preferred_time,
      location: locationDetails
    }, 'Appointment booked successfully'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── PUBLIC: Get booking by ref ──────────────────────────────
router.get('/ref/:ref', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, sl.name as location_name, sl.address as location_address,
              sl.phone as location_phone, sl.google_maps_url
       FROM appointments a
       LEFT JOIN store_locations sl ON sl.id = a.location_id
       WHERE a.booking_ref = ?`,
      [req.params.ref]
    );
    if (!rows.length) return res.status(404).json(errorResponse('Booking not found'));
    return res.json(successResponse(rows[0]));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── ADMIN: List all appointments ────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE a.license_id = ?';
    const params = [req.user.license_id];
    if (status) { where += ' AND a.status = ?'; params.push(status); }
    if (date)   { where += ' AND a.preferred_date = ?'; params.push(date); }

    const [rows] = await db.query(
      `SELECT a.*, sl.name as location_name 
       FROM appointments a
       LEFT JOIN store_locations sl ON sl.id = a.location_id
       ${where}
       ORDER BY a.preferred_date ASC, a.preferred_time ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM appointments a ${where}`, params
    );
    return res.json(successResponse({
      data: rows, total: count[0].total,
      page: parseInt(page), limit: parseInt(limit)
    }));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── ADMIN: Update appointment status ────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, notes, confirmed_time } = req.body;
    await db.query(
      `UPDATE appointments 
       SET status=COALESCE(?,status), notes=COALESCE(?,notes), 
           confirmed_time=COALESCE(?,confirmed_time),
           updated_at=NOW()
       WHERE id=? AND license_id=?`,
      [status||null, notes||null, confirmed_time||null, req.params.id, req.user.license_id]
    );
    return res.json(successResponse({}, 'Appointment updated'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── ADMIN: Today's appointments summary ─────────────────────
router.get('/summary/today', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM appointments 
       WHERE license_id=? AND preferred_date=?
       GROUP BY status`,
      [req.user.license_id, today]
    );
    const [upcoming] = await db.query(
      `SELECT a.*, sl.name as location_name
       FROM appointments a
       LEFT JOIN store_locations sl ON sl.id = a.location_id
       WHERE a.license_id=? AND a.preferred_date >= ? AND a.status='confirmed'
       ORDER BY a.preferred_date ASC, a.preferred_time ASC LIMIT 5`,
      [req.user.license_id, today]
    );
    return res.json(successResponse({ today: rows, upcoming }));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

module.exports = router;
