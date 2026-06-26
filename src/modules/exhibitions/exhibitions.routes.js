const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];
const { notifyAdmins } = require('../notifications/notifications.routes');

// ── PUBLIC: list upcoming exhibitions ─────────────────────────
router.get('/public', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id,title,slug,subtitle,venue_name,venue_city,booth_number,
             start_date,end_date,start_time,end_time,hero_image,
             is_vip,registration_open,reg_close_date,max_registrations,
             (SELECT COUNT(*) FROM exhibition_registrations WHERE exhibition_id=e.id AND status!='cancelled') as reg_count
      FROM exhibitions e
      WHERE is_active=true AND is_published=true AND end_date >= CURRENT_DATE
      ORDER BY start_date ASC
    `);
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── PUBLIC: single exhibition ──────────────────────────────────
router.get('/public/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM exhibition_registrations WHERE exhibition_id=e.id AND status!='cancelled') as reg_count,
        (SELECT json_agg(json_build_object('id',p.id,'name',p.name,'slug',p.slug,'final_price',p.final_price,'currency',p.currency,'thumb_url',m.file_url,'is_featured',ep.is_featured))
         FROM exhibition_products ep JOIN products p ON p.id=ep.product_id
         LEFT JOIN media m ON m.product_id=p.id AND m.is_primary=true
         WHERE ep.exhibition_id=e.id ORDER BY ep.is_featured DESC, ep.sort_order ASC
        ) as featured_products
      FROM exhibitions e
      WHERE slug=$1 AND is_active=true AND is_published=true
    `, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Exhibition not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── PUBLIC: register for exhibition ───────────────────────────
router.post('/public/:slug/register', async (req, res) => {
  try {
    const { full_name, email, phone, company, visit_date, visit_time, party_size=1, notes } = req.body;
    if (!full_name || !phone) return res.status(422).json({ success:false, message:'Name and phone required' });

    const [exh] = await db.query(
      `SELECT id,title,is_vip,registration_open,reg_close_date,max_registrations,
              (SELECT COUNT(*) FROM exhibition_registrations WHERE exhibition_id=exhibitions.id AND status!='cancelled') as reg_count
       FROM exhibitions WHERE slug=$1 AND is_active=true AND is_published=true`, [req.params.slug]
    );
    if (!exh.length) return res.status(404).json({ success:false, message:'Exhibition not found' });
    const ex = exh[0];
    if (!ex.registration_open) return res.status(400).json({ success:false, message:'Registration is closed' });
    if (ex.reg_close_date && new Date() > new Date(ex.reg_close_date)) return res.status(400).json({ success:false, message:'Registration deadline passed' });
    if (ex.max_registrations && +ex.reg_count >= +ex.max_registrations) return res.status(400).json({ success:false, message:'Exhibition is fully booked' });

    const [r] = await db.execute(
      `INSERT INTO exhibition_registrations (exhibition_id,full_name,email,phone,company,visit_date,visit_time,party_size,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [ex.id, full_name, email||null, phone, company||null, visit_date||null, visit_time||null, parseInt(party_size)||1, notes||null]
    );
    // Notify admins (non-blocking)
    setImmediate(() => notifyAdmins({
      type: 'new_exhibition_reg', icon: 'calendar', color: 'purple',
      title: New exhibition registration: ${full_name},
      body: Registered for ${ex.title},
      link: '/exhibitions', resource: 'exhibition_reg',
    }));
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id }, message:`Registration confirmed for ${ex.title}` });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: list all exhibitions ───────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM exhibition_registrations WHERE exhibition_id=e.id AND status!='cancelled') as reg_count
      FROM exhibitions e ORDER BY start_date DESC
    `);
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: create exhibition ──────────────────────────────────
router.post('/', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { title,subtitle,description,venue_name,venue_address,venue_city,venue_country,venue_map_url,booth_number,start_date,end_date,start_time,end_time,hero_image,gallery_images,is_vip,registration_open,reg_open_date,reg_close_date,max_registrations,is_published,seo_title,seo_description } = req.body;
    if (!title||!start_date||!end_date) return res.status(422).json({ success:false, message:'title, start_date, end_date required' });
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + start_date.slice(0,7).replace('-','');
    const [r] = await db.execute(
      `INSERT INTO exhibitions (title,slug,subtitle,description,venue_name,venue_address,venue_city,venue_country,venue_map_url,booth_number,start_date,end_date,start_time,end_time,hero_image,gallery_images,is_vip,registration_open,reg_open_date,reg_close_date,max_registrations,is_published,seo_title,seo_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) RETURNING id`,
      [title,slug,subtitle||null,description||null,venue_name||null,venue_address||null,venue_city||null,venue_country||'UAE',venue_map_url||null,booth_number||null,start_date,end_date,start_time||'10:00',end_time||'20:00',hero_image||null,JSON.stringify(gallery_images||[]),!!is_vip,registration_open!==false,reg_open_date||null,reg_close_date||null,max_registrations||null,!!is_published,seo_title||null,seo_description||null]
    );
    // Notify admins (non-blocking)
    setImmediate(() => notifyAdmins({
      type: 'new_exhibition_reg', icon: 'calendar', color: 'purple',
      title: New exhibition registration: ${full_name},
      body: Registered for ${ex.title},
      link: '/exhibitions', resource: 'exhibition_reg',
    }));
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id, slug }, message:'Exhibition created' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: get single ─────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM exhibitions WHERE id=$1',[req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    const [products] = await db.query(`SELECT ep.*,p.name,p.sku,p.final_price FROM exhibition_products ep JOIN products p ON p.id=ep.product_id WHERE ep.exhibition_id=$1 ORDER BY ep.sort_order`,[req.params.id]);
    const [regs] = await db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER(WHERE status='confirmed') as confirmed, COUNT(*) FILTER(WHERE status='attended') as attended FROM exhibition_registrations WHERE exhibition_id=$1`,[req.params.id]);
    res.json({ success:true, data:{ ...rows[0], products, reg_stats:regs[0] } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: update exhibition ───────────────────────────────────
router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const fields=['title','subtitle','description','venue_name','venue_address','venue_city','venue_country','venue_map_url','booth_number','start_date','end_date','start_time','end_time','hero_image','is_vip','is_active','is_published','registration_open','reg_open_date','reg_close_date','max_registrations','seo_title','seo_description'];
    const updates=fields.filter(f=>req.body[f]!==undefined);
    if (req.body.gallery_images!==undefined) updates.push('gallery_images');
    if (!updates.length) return res.json({ success:true, message:'Nothing to update' });
    const vals=updates.map(f=>f==='gallery_images'?JSON.stringify(req.body[f]):req.body[f]);
    vals.push(req.params.id);
    await db.query(`UPDATE exhibitions SET ${updates.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${vals.length}`,vals);
    res.json({ success:true, message:'Updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: add product to exhibition ─────────────────────────
router.post('/:id/products', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { product_id, is_featured=false, sort_order=0 } = req.body;
    await db.execute('INSERT INTO exhibition_products (exhibition_id,product_id,is_featured,sort_order) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',[req.params.id,product_id,!!is_featured,sort_order]);
    res.json({ success:true, message:'Product added to exhibition' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: registrations list ─────────────────────────────────
router.get('/:id/registrations', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM exhibition_registrations WHERE exhibition_id=$1 ORDER BY created_at DESC',[req.params.id]);
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── ADMIN: update registration status ────────────────────────
router.patch('/:id/registrations/:regId', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE exhibition_registrations SET status=$1 WHERE id=$2 AND exhibition_id=$3',[status,req.params.regId,req.params.id]);
    res.json({ success:true, message:'Registration updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;

