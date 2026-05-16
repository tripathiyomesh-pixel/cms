const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const upload = require('../../config/cloudinary');
const db = require('../../config/db.pool');
const { successResponse, errorResponse } = require('../../common/response');

// ─── GET specs for a product ────────────────────────────────
router.get('/specs/:productId', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT js.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT('id',pc.id,'type',pc.cert_type,'number',pc.cert_number,
            'lab',pc.cert_lab,'date',pc.cert_date,'file',pc.cert_file_url,'primary',pc.is_primary)
        ) AS certifications,
        JSON_ARRAYAGG(
          JSON_OBJECT('id',pi.id,'url',pi.url,'alt',pi.alt_text,
            'primary',pi.is_primary,'order',pi.sort_order,'type',pi.image_type)
        ) AS images
       FROM product_jewellery_specs js
       LEFT JOIN product_certifications pc ON pc.product_id = js.product_id
       LEFT JOIN product_images pi ON pi.product_id = js.product_id
       WHERE js.product_id = ?
       GROUP BY js.id`,
      [req.params.productId]
    );
    if (!rows.length) return res.json(successResponse({}, 'No specs yet'));
    return res.json(successResponse(rows[0]));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── SAVE / UPDATE specs ────────────────────────────────────
router.post('/specs/:productId', authenticate, authorize(['super_admin','client_admin','store_manager']), async (req, res) => {
  const pid = req.params.productId;
  const s = req.body;
  try {
    await db.query(
      `INSERT INTO product_jewellery_specs
        (product_id,metal_type,purity,gross_weight,net_weight,
         has_diamond,diamond_carat,diamond_cut,diamond_color,diamond_clarity,diamond_shape,
         has_gemstone,gemstone_type,gemstone_carat,gemstone_color,
         making_charges,making_pct,use_live_rate,
         ring_size_min,ring_size_max,ring_sizes,occasion,gender,care_instructions RETURNING id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
        metal_type=VALUES(metal_type),purity=VALUES(purity),
        gross_weight=VALUES(gross_weight),net_weight=VALUES(net_weight),
        has_diamond=VALUES(has_diamond),diamond_carat=VALUES(diamond_carat),
        diamond_cut=VALUES(diamond_cut),diamond_color=VALUES(diamond_color),
        diamond_clarity=VALUES(diamond_clarity),diamond_shape=VALUES(diamond_shape),
        has_gemstone=VALUES(has_gemstone),gemstone_type=VALUES(gemstone_type),
        gemstone_carat=VALUES(gemstone_carat),gemstone_color=VALUES(gemstone_color),
        making_charges=VALUES(making_charges),making_pct=VALUES(making_pct),
        use_live_rate=VALUES(use_live_rate),ring_size_min=VALUES(ring_size_min),
        ring_size_max=VALUES(ring_size_max),ring_sizes=VALUES(ring_sizes),
        occasion=VALUES(occasion),gender=VALUES(gender),
        care_instructions=VALUES(care_instructions)`,
      [pid, s.metal_type||'gold', s.purity||'18K',
       s.gross_weight||null, s.net_weight||null,
       s.has_diamond||false, s.diamond_carat||null, s.diamond_cut||null,
       s.diamond_color||null, s.diamond_clarity||null, s.diamond_shape||null,
       s.has_gemstone||false, s.gemstone_type||null, s.gemstone_carat||null, s.gemstone_color||null,
       s.making_charges||0, s.making_pct||0, s.use_live_rate||false,
       s.ring_size_min||null, s.ring_size_max||null,
       s.ring_sizes ? JSON.stringify(s.ring_sizes) : null,
       s.occasion||null, s.gender||'women', s.care_instructions||null]
    );
    return res.json(successResponse({}, 'Jewellery specs saved'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── CERTIFICATIONS ─────────────────────────────────────────
router.post('/certifications/:productId', authenticate, upload.single('cert_file'), async (req, res) => {
  try {
    const { cert_type, cert_number, cert_lab, cert_date, is_primary } = req.body;
    const cert_file_url = req.file ? req.file.path : null;
    if (is_primary === 'true') {
      await db.query('UPDATE product_certifications SET is_primary=FALSE WHERE product_id=?', [req.params.productId]);
    }
    const [result] = await db.query(
      `INSERT INTO product_certifications (product_id,cert_type,cert_number,cert_lab,cert_date,cert_file_url,is_primary RETURNING id)
       VALUES (?,?,?,?,?,?,?)`,
      [req.params.productId, cert_type, cert_number, cert_lab||null, cert_date||null, cert_file_url, is_primary==='true']
    );
    return res.json(successResponse({ id: result[0].insertId }, 'Certification added'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

router.delete('/certifications/:id', authenticate, async (req, res) => {
  await db.query('DELETE FROM product_certifications WHERE id=?', [req.params.id]);
  return res.json(successResponse({}, 'Deleted'));
});

// ─── PRODUCT IMAGES ─────────────────────────────────────────
router.post('/images/:productId', authenticate, upload.array('images', 20), async (req, res) => {
  try {
    const pid = req.params.productId;
    const { is_primary, image_type } = req.body;
    if (!req.files || !req.files.length) return res.status(400).json(errorResponse('No images uploaded'));
    const [existing] = await db.query('SELECT COUNT(*) as cnt FROM product_images WHERE product_id=?', [pid]);
    let sort = existing[0].cnt;
    for (const file of req.files) {
      if (is_primary === 'true' && sort === 0) {
        await db.query('UPDATE product_images SET is_primary=FALSE WHERE product_id=?', [pid]);
      }
      await db.query(
        `INSERT INTO product_images (product_id,url,alt_text,is_primary,sort_order,image_type RETURNING id)
         VALUES (?,?,?,?,?,?)`,
        [pid, file.path, file.originalname, is_primary==='true' && sort===0, sort, image_type||'photo']
      );
      sort++;
    }
    return res.json(successResponse({}, `${req.files.length} image(s) uploaded`));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

router.delete('/images/:id', authenticate, async (req, res) => {
  await db.query('DELETE FROM product_images WHERE id=?', [req.params.id]);
  return res.json(successResponse({}, 'Deleted'));
});

router.patch('/images/:id/primary', authenticate, async (req, res) => {
  const [img] = await db.query('SELECT product_id FROM product_images WHERE id=?', [req.params.id]);
  if (!img.length) return res.status(404).json(errorResponse('Not found'));
  await db.query('UPDATE product_images SET is_primary=FALSE WHERE product_id=?', [img[0].product_id]);
  await db.query('UPDATE product_images SET is_primary=TRUE WHERE id=?', [req.params.id]);
  return res.json(successResponse({}, 'Primary image updated'));
});

// ─── METAL RATES ────────────────────────────────────────────
router.get('/metal-rates', async (req, res) => {
  try {
    const [rates] = await db.query(
      `SELECT * FROM metal_rates 
       WHERE fetched_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
       ORDER BY fetched_at DESC`
    );
    return res.json(successResponse(rates));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

router.post('/metal-rates', authenticate, authorize(['super_admin','client_admin']), async (req, res) => {
  try {
    const { metal, purity, rate_per_gram, rate_aed, rate_inr, rate_sar } = req.body;
    await db.query(
      `INSERT INTO metal_rates (metal,purity,rate_per_gram,rate_aed,rate_inr,rate_sar,source RETURNING id)
       VALUES (?,?,?,?,?,?,'manual')`,
      [metal, purity, rate_per_gram, rate_aed||null, rate_inr||null, rate_sar||null]
    );
    return res.json(successResponse({}, 'Rate saved'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

// ─── ENQUIRIES ───────────────────────────────────────────────
router.get('/enquiries', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE e.license_id = ?';
    const params = [req.user.license_id];
    if (status) { where += ' AND e.status = ?'; params.push(status); }
    const [rows] = await db.query(
      `SELECT e.*, p.name as product_name_ref 
       FROM enquiries e
       LEFT JOIN products p ON p.id = e.product_id
       ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [count] = await db.query(`SELECT COUNT(*) as total FROM enquiries e ${where}`, params);
    return res.json(successResponse({ data: rows, total: count[0].total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

router.post('/enquiries', async (req, res) => {
  try {
    const { license_id, product_id, enquiry_type, channel, customer_name,
            customer_phone, customer_email, country_code, message,
            product_sku, product_name, product_price } = req.body;
    await db.query(
      `INSERT INTO enquiries (license_id,product_id,enquiry_type,channel,customer_name,
        customer_phone,customer_email,country_code,message,product_sku,product_name,product_price RETURNING id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [license_id, product_id||null, enquiry_type||'product', channel||'form',
       customer_name||null, customer_phone||null, customer_email||null,
       country_code||'AE', message||null, product_sku||null, product_name||null, product_price||null]
    );
    return res.json(successResponse({}, 'Enquiry submitted'));
  } catch (e) {
    return res.status(500).json(errorResponse(e.message));
  }
});

router.patch('/enquiries/:id', authenticate, async (req, res) => {
  const { status, notes, followed_up_at } = req.body;
  await db.query(
    'UPDATE enquiries SET status=COALESCE(?,status), notes=COALESCE(?,notes), followed_up_at=COALESCE(?,followed_up_at) WHERE id=?',
    [status||null, notes||null, followed_up_at||null, req.params.id]
  );
  return res.json(successResponse({}, 'Enquiry updated'));
});

// ─── TRUST BADGES ───────────────────────────────────────────
router.get('/trust-badges', async (req, res) => {
  const { license_id } = req.query;
  const [rows] = await db.query(
    'SELECT * FROM trust_badges WHERE license_id=? AND is_active=TRUE ORDER BY sort_order',
    [license_id]
  );
  return res.json(successResponse(rows));
});

router.post('/trust-badges', authenticate, async (req, res) => {
  const { label, icon, icon_url, sort_order } = req.body;
  const [r] = await db.query(
    'INSERT INTO trust_badges (license_id,label,icon,icon_url,sort_order RETURNING id) VALUES (?,?,?,?,?)',
    [req.user.license_id, label, icon||null, icon_url||null, sort_order||0]
  );
  return res.json(successResponse({ id: r.insertId }, 'Badge added'));
});

router.delete('/trust-badges/:id', authenticate, async (req, res) => {
  await db.query('DELETE FROM trust_badges WHERE id=?', [req.params.id]);
  return res.json(successResponse({}, 'Deleted'));
});

// ─── APPOINTMENTS ───────────────────────────────────────────
router.get('/appointments', authenticate, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = 'WHERE license_id = ?';
  const params = [req.user.license_id];
  if (status) { where += ' AND status = ?'; params.push(status); }
  const [rows] = await db.query(
    `SELECT * FROM appointments ${where} ORDER BY preferred_date ASC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );
  const [count] = await db.query(`SELECT COUNT(*) as total FROM appointments ${where}`, params);
  return res.json(successResponse({ data: rows, total: count[0].total }));
});

router.post('/appointments', async (req, res) => {
  const { license_id, customer_name, customer_phone, customer_email,
          preferred_date, preferred_time, location, purpose } = req.body;
  await db.query(
    `INSERT INTO appointments (license_id,customer_name,customer_phone,customer_email,
      preferred_date,preferred_time,location,purpose RETURNING id) VALUES (?,?,?,?,?,?,?,?)`,
    [license_id, customer_name, customer_phone, customer_email||null,
     preferred_date, preferred_time||null, location||null, purpose||null]
  );
  return res.json(successResponse({}, 'Appointment booked'));
});

router.patch('/appointments/:id', authenticate, async (req, res) => {
  const { status, notes } = req.body;
  await db.query('UPDATE appointments SET status=?, notes=? WHERE id=?', [status, notes||null, req.params.id]);
  return res.json(successResponse({}, 'Updated'));
});

// ─── STORE LOCATIONS ────────────────────────────────────────
router.get('/locations', async (req, res) => {
  const { license_id } = req.query;
  const [rows] = await db.query(
    'SELECT * FROM store_locations WHERE license_id=? AND is_active=TRUE ORDER BY is_primary DESC, id',
    [license_id]
  );
  return res.json(successResponse(rows));
});

router.post('/locations', authenticate, async (req, res) => {
  const { name, address, city, country_code, phone, whatsapp, email, google_maps_url, working_hours, is_primary } = req.body;
  if (is_primary) await db.query('UPDATE store_locations SET is_primary=FALSE WHERE license_id=?', [req.user.license_id]);
  const [r] = await db.query(
    `INSERT INTO store_locations (license_id,name,address,city,country_code,phone,whatsapp,email,google_maps_url,working_hours,is_primary RETURNING id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [req.user.license_id, name, address, city||null, country_code||'AE',
     phone||null, whatsapp||null, email||null, google_maps_url||null, working_hours||null, is_primary||false]
  );
  return res.json(successResponse({ id: r.insertId }, 'Location added'));
});

router.delete('/locations/:id', authenticate, async (req, res) => {
  await db.query('DELETE FROM store_locations WHERE id=?', [req.params.id]);
  return res.json(successResponse({}, 'Deleted'));
});

// ─── WHATSAPP ENQUIRY LINK GENERATOR ────────────────────────
router.post('/whatsapp-link', async (req, res) => {
  const { whatsapp_number, product_name, product_sku, product_price, currency, product_url } = req.body;
  const msg = encodeURIComponent(
    `Hello! I'm interested in:\n\n` +
    `*${product_name}*\n` +
    `SKU: ${product_sku}\n` +
    (product_price ? `Price: ${currency || 'AED'} ${product_price}\n` : '') +
    (product_url ? `\nLink: ${product_url}` : '') +
    `\n\nPlease share more details.`
  );
  const clean = whatsapp_number.replace(/\D/g, '');
  const link = `https://wa.me/${clean}?text=${msg}`;
  return res.json(successResponse({ link }));
});

module.exports = router;
