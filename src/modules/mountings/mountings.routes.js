const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, mounting_type, category, gender, search } = req.query;
    const offset = (page-1)*limit;
    const params = [];
    let where = "WHERE p.deleted_at IS NULL AND p.inventory_type='MOUNTING'";
    if (mounting_type) { params.push(mounting_type); where += ` AND md.mounting_type=$${params.length}`; }
    if (category)      { params.push(category);      where += ` AND md.category=$${params.length}`; }
    if (gender)        { params.push(gender);         where += ` AND md.gender=$${params.length}`; }
    if (search)        { params.push(`%${search}%`);  where += ` AND p.name ILIKE $${params.length}`; }
    const qp = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(`
      SELECT p.id,p.name,p.sku,p.final_price,p.currency,p.status,
             md.mounting_type,md.style,md.category,md.gender,md.compatible_shapes,
             md.min_carat,md.max_carat,md.metal_options,md.casting_weight,
             md.cad_file_url,md.production_days,img.file_url as thumb_url
      FROM products p
      LEFT JOIN mounting_details md ON md.product_id=p.id
      LEFT JOIN media img ON img.product_id=p.id AND img.is_primary=true
      ${where} ORDER BY p.created_at DESC
      LIMIT $${qp.length-1} OFFSET $${qp.length}
    `, qp);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM products p LEFT JOIN mounting_details md ON md.product_id=p.id ${where}`, params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*,md.* FROM products p LEFT JOIN mounting_details md ON md.product_id=p.id WHERE p.id=$1 AND p.deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { name, mounting_type, style, category='Ring', gender, shank_style,
            head_type, prong_type, compatible_shapes=[], min_carat, max_carat,
            metal_options=[], ring_sizes_available=[], casting_weight,
            cad_file_url, production_days=7, base_labor_price, customization_fee,
            base_price=0, final_price, currency='AED', status='draft',
            inventory_mode='IN_HOUSE', internal_notes } = req.body;
    if (!name) return res.status(422).json({ success:false, message:'name required' });
    const autoSku = `MNT-${(mounting_type||'XX').slice(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + autoSku.toLowerCase();
    const [r] = await db.execute(
      `INSERT INTO products (name,sku,slug,base_price,final_price,currency,status,inventory_type,inventory_mode,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,'MOUNTING',$8,$9) RETURNING id`,
      [name,autoSku,autoSlug,base_price,final_price||base_price,currency,status,inventory_mode,req.user.id]
    );
    const productId = r[0]?.id || r.rows?.[0]?.id;
    await db.execute(
      `INSERT INTO mounting_details (product_id,mounting_type,style,category,gender,shank_style,head_type,prong_type,compatible_shapes,min_carat,max_carat,metal_options,ring_sizes_available,casting_weight,cad_file_url,production_days,base_labor_price,customization_fee,internal_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [productId,mounting_type||null,style||null,category,gender||null,shank_style||null,head_type||null,prong_type||null,JSON.stringify(compatible_shapes),min_carat||null,max_carat||null,JSON.stringify(metal_options),JSON.stringify(ring_sizes_available),casting_weight||null,cad_file_url||null,production_days,base_labor_price||null,customization_fee||null,internal_notes||null]
    );
    res.json({ success:true, data:{ id:productId, sku:autoSku }, message:'Mounting created' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const fields = ['mounting_type','style','category','gender','shank_style','head_type','prong_type','min_carat','max_carat','casting_weight','cad_file_url','production_days','base_labor_price','internal_notes'];
    const jsonFields = ['compatible_shapes','metal_options','ring_sizes_available'];
    const allFields = [...fields, ...jsonFields];
    const updates = allFields.filter(f=>req.body[f]!==undefined);
    if (updates.length) {
      const vals = updates.map(f => jsonFields.includes(f) ? JSON.stringify(req.body[f]) : req.body[f]);
      vals.push(req.params.id);
      await db.query(`UPDATE mounting_details SET ${updates.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE product_id=$${vals.length}`, vals);
    }
    res.json({ success:true, message:'Updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try { await db.query('UPDATE products SET deleted_at=NOW() WHERE id=$1',[req.params.id]); res.json({ success:true, message:'Deleted' }); }
  catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
