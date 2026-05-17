const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, shape, color, clarity, cut, diamond_type,
            min_carat, max_carat, min_price, max_price, is_available, search } = req.query;
    const offset = (page-1)*limit;
    const params = [];
    let where = "WHERE p.deleted_at IS NULL AND p.inventory_type IN ('NATURAL_DIAMOND','LAB_GROWN_DIAMOND')";
    if (diamond_type) { params.push(diamond_type); where += ` AND d.diamond_type=$${params.length}`; }
    if (shape)        { params.push(shape);        where += ` AND d.shape=$${params.length}`; }
    if (color)        { params.push(color);        where += ` AND d.color=$${params.length}`; }
    if (clarity)      { params.push(clarity);      where += ` AND d.clarity=$${params.length}`; }
    if (cut)          { params.push(cut);          where += ` AND d.cut=$${params.length}`; }
    if (min_carat)    { params.push(parseFloat(min_carat)); where += ` AND d.carat>=$${params.length}`; }
    if (max_carat)    { params.push(parseFloat(max_carat)); where += ` AND d.carat<=$${params.length}`; }
    if (is_available) { params.push(is_available==='true'); where += ` AND d.is_available=$${params.length}`; }
    if (search)       { params.push(`%${search}%`); where += ` AND (p.name ILIKE $${params.length} OR d.primary_cert_no ILIKE $${params.length})`; }
    const qParams = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(`
      SELECT p.id,p.name,p.sku,p.final_price,p.currency,p.status,p.inventory_mode,
             d.diamond_type,d.shape,d.carat,d.color,d.clarity,d.cut,d.polish,
             d.symmetry,d.fluorescence,d.primary_cert_no,d.primary_cert_lab,
             d.rap_rate,d.rap_discount_pct,d.is_available,d.hold_until,d.country_of_origin,
             m.file_url as thumb_url
      FROM products p
      LEFT JOIN diamond_details d ON d.product_id=p.id
      LEFT JOIN media m ON m.product_id=p.id AND m.is_primary=true
      ${where} ORDER BY p.created_at DESC
      LIMIT $${qParams.length-1} OFFSET $${qParams.length}
    `, qParams);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM products p LEFT JOIN diamond_details d ON d.product_id=p.id ${where}`, params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*,d.* FROM products p LEFT JOIN diamond_details d ON d.product_id=p.id WHERE p.id=$1 AND p.deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { name, diamond_type='NATURAL', growth_type, country_of_origin,
            shape, carat, color, clarity, cut, polish, symmetry, fluorescence,
            fluorescence_color, laser_inscription,
            meas_length, meas_width, meas_depth, table_percent, depth_percent,
            crown_angle, pavilion_angle, girdle, culet,
            rap_rate, rap_discount_pct, primary_cert_no, primary_cert_lab, cert_url,
            base_price=0, final_price, currency='USD', status='draft',
            inventory_mode='IN_HOUSE', is_available=true, internal_notes } = req.body;

    const inv_type = diamond_type==='LAB_GROWN' ? 'LAB_GROWN_DIAMOND' : 'NATURAL_DIAMOND';
    const autoName = name || `${diamond_type==='LAB_GROWN'?'Lab':'Natural'} ${shape||''} ${carat||''}ct ${color||''} ${clarity||''}`.trim();
    const autoSku  = `DMD-${diamond_type==='LAB_GROWN'?'LG':'NT'}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const autoSlug = autoName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + autoSku.toLowerCase();
    const fp = final_price || base_price || 0;

    const [r] = await db.execute(
      `INSERT INTO products (name,sku,slug,base_price,final_price,currency,status,inventory_type,inventory_mode,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [autoName,autoSku,autoSlug,base_price,fp,currency,status,inv_type,inventory_mode,req.user.id]
    );
    const productId = r[0]?.id || r.rows?.[0]?.id;

    await db.execute(
      `INSERT INTO diamond_details (product_id,diamond_type,growth_type,country_of_origin,shape,carat,color,clarity,cut,polish,symmetry,fluorescence,fluorescence_color,laser_inscription,meas_length,meas_width,meas_depth,table_percent,depth_percent,crown_angle,pavilion_angle,girdle,culet,rap_rate,rap_discount_pct,primary_cert_no,primary_cert_lab,cert_url,is_available,internal_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
      [productId,diamond_type,growth_type||null,country_of_origin||null,shape||null,carat||null,color||null,clarity||null,cut||null,polish||null,symmetry||null,fluorescence||null,fluorescence_color||null,laser_inscription||null,meas_length||null,meas_width||null,meas_depth||null,table_percent||null,depth_percent||null,crown_angle||null,pavilion_angle||null,girdle||null,culet||null,rap_rate||null,rap_discount_pct||null,primary_cert_no||null,primary_cert_lab||null,cert_url||null,is_available,internal_notes||null]
    );
    res.json({ success:true, data:{ id:productId, sku:autoSku }, message:'Diamond created' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const df = ['shape','carat','color','clarity','cut','polish','symmetry','fluorescence','fluorescence_color','laser_inscription','meas_length','meas_width','meas_depth','table_percent','depth_percent','rap_rate','rap_discount_pct','country_of_origin','is_available','hold_until','hold_by_customer','primary_cert_no','primary_cert_lab','cert_url','internal_notes'];
    const du = df.filter(f=>req.body[f]!==undefined);
    if (du.length) { const dv=[...du.map(f=>req.body[f]),req.params.id]; await db.query(`UPDATE diamond_details SET ${du.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE product_id=$${dv.length}`,dv); }
    const pf=['name','status','final_price','base_price','inventory_mode'].filter(f=>req.body[f]!==undefined);
    if (pf.length) { const pv=[...pf.map(f=>req.body[f]),req.params.id]; await db.query(`UPDATE products SET ${pf.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${pv.length}`,pv); }
    res.json({ success:true, message:'Updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try { await db.query('UPDATE products SET deleted_at=NOW() WHERE id=$1',[req.params.id]); res.json({ success:true, message:'Deleted' }); }
  catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/compare', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length || ids.length>4) return res.status(422).json({ success:false, message:'Send 2–4 IDs' });
    const [rows] = await db.query(`SELECT p.id,p.name,p.sku,p.final_price,p.currency,d.*,m.file_url as thumb_url FROM products p LEFT JOIN diamond_details d ON d.product_id=p.id LEFT JOIN media m ON m.product_id=p.id AND m.is_primary=true WHERE p.id IN (${ids.map((_,i)=>`$${i+1}`).join(',')})`,ids);
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
