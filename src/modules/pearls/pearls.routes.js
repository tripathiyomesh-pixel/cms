const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, pearl_type, search } = req.query;
    const offset = (page-1)*limit;
    const params = [];
    let where = "WHERE p.deleted_at IS NULL AND p.inventory_type='PEARL'";
    if (pearl_type) { params.push(pearl_type); where += ` AND pd.pearl_type=$${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND p.name ILIKE $${params.length}`; }
    const qp = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await db.query(`
      SELECT p.id,p.name,p.sku,p.final_price,p.currency,p.status,
             pd.pearl_type,pd.pearl_color,pd.overtone,pd.shape,pd.size_mm_min,pd.size_mm_max,
             pd.nacre_quality,pd.luster,pd.surface,pd.matching_grade,pd.is_strand,
             m.file_url as thumb_url
      FROM products p
      LEFT JOIN pearl_details pd ON pd.product_id=p.id
      LEFT JOIN media m ON m.product_id=p.id AND m.is_primary=true
      ${where} ORDER BY p.created_at DESC
      LIMIT $${qp.length-1} OFFSET $${qp.length}
    `, qp);
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM products p LEFT JOIN pearl_details pd ON pd.product_id=p.id ${where}`, params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*,pd.* FROM products p LEFT JOIN pearl_details pd ON pd.product_id=p.id WHERE p.id=$1 AND p.deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { name, pearl_type, pearl_color, overtone, shape, size_mm_min, size_mm_max,
            nacre_quality, luster, surface, matching_grade, is_strand=false,
            strand_length, num_pearls, cert_lab, cert_number,
            base_price=0, final_price, currency='AED', status='draft',
            inventory_mode='IN_HOUSE', internal_notes } = req.body;
    if (!name || !pearl_type) return res.status(422).json({ success:false, message:'name and pearl_type required' });
    const autoSku = `PRL-${pearl_type.slice(0,2).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + autoSku.toLowerCase();
    const [r] = await db.execute(
      `INSERT INTO products (name,sku,slug,base_price,final_price,currency,status,inventory_type,inventory_mode,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,'PEARL',$8,$9) RETURNING id`,
      [name,autoSku,autoSlug,base_price,final_price||base_price,currency,status,inventory_mode,req.user.id]
    );
    const productId = r[0]?.id || r.rows?.[0]?.id;
    await db.execute(
      `INSERT INTO pearl_details (product_id,pearl_type,pearl_color,overtone,shape,size_mm_min,size_mm_max,nacre_quality,luster,surface,matching_grade,is_strand,strand_length,num_pearls,cert_lab,cert_number,internal_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [productId,pearl_type,pearl_color||null,overtone||null,shape||null,size_mm_min||null,size_mm_max||null,nacre_quality||null,luster||null,surface||null,matching_grade||null,is_strand,strand_length||null,num_pearls||null,cert_lab||null,cert_number||null,internal_notes||null]
    );
    res.json({ success:true, data:{ id:productId, sku:autoSku }, message:'Pearl created' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const fields = ['pearl_type','pearl_color','overtone','shape','size_mm_min','size_mm_max','nacre_quality','luster','surface','matching_grade','is_strand','strand_length','num_pearls','cert_lab','cert_number','internal_notes'];
    const updates = fields.filter(f=>req.body[f]!==undefined);
    if (updates.length) { const vals=[...updates.map(f=>req.body[f]),req.params.id]; await db.query(`UPDATE pearl_details SET ${updates.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE product_id=$${vals.length}`,vals); }
    const pf=['name','status','final_price','base_price'].filter(f=>req.body[f]!==undefined);
    if (pf.length) { const pv=[...pf.map(f=>req.body[f]),req.params.id]; await db.query(`UPDATE products SET ${pf.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${pv.length}`,pv); }
    res.json({ success:true, message:'Updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try { await db.query('UPDATE products SET deleted_at=NOW() WHERE id=$1',[req.params.id]); res.json({ success:true, message:'Deleted' }); }
  catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
