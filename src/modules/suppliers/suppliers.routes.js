const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];

// SUPPLIERS
router.get('/', authenticate, async (req,res)=>{
  try {
    const { page=1, limit=20, search } = req.query;
    const offset=(page-1)*limit; const params=[];
    let where='WHERE is_active=true';
    if(search){ params.push(`%${search}%`); where+=` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    const qp=[...params,parseInt(limit),parseInt(offset)];
    const [rows]=await db.query(`SELECT * FROM suppliers ${where} ORDER BY name LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total FROM suppliers ${where}`,params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const {name,code,contact_name,email,phone,whatsapp,country,city,address,payment_terms,currency='USD',discount_pct=0,notes}=req.body;
    if(!name) return res.status(422).json({ success:false, message:'name required' });
    const [r]=await db.execute(
      `INSERT INTO suppliers (name,code,contact_name,email,phone,whatsapp,country,city,address,payment_terms,currency,discount_pct,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [name,code||null,contact_name||null,email||null,phone||null,whatsapp||null,country||null,city||null,address||null,payment_terms||null,currency,discount_pct,notes||null]
    );
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id }, message:'Supplier created' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req,res)=>{
  try {
    const [rows]=await db.query('SELECT * FROM suppliers WHERE id=$1',[req.params.id]);
    if(!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const fields=['name','code','contact_name','email','phone','whatsapp','country','city','address','payment_terms','currency','discount_pct','notes','is_active'];
    const updates=fields.filter(f=>req.body[f]!==undefined);
    if(!updates.length) return res.json({ success:true, message:'Nothing to update' });
    const vals=[...updates.map(f=>req.body[f]),req.params.id];
    await db.query(`UPDATE suppliers SET ${updates.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${vals.length}`,vals);
    res.json({ success:true, message:'Updated' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req,res)=>{
  try { await db.query('UPDATE suppliers SET is_active=false,updated_at=NOW() WHERE id=$1',[req.params.id]); res.json({ success:true, message:'Deactivated' }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// MEMOS
router.get('/memos/list', authenticate, async (req,res)=>{
  try {
    const {page=1,limit=20,status,search}=req.query;
    const offset=(page-1)*limit; const params=[];
    let where='WHERE 1=1';
    if(status){ params.push(status); where+=` AND m.status=$${params.length}`; }
    if(search){ params.push(`%${search}%`); where+=` AND (m.memo_number ILIKE $${params.length} OR m.customer_name ILIKE $${params.length})`; }
    const qp=[...params,parseInt(limit),parseInt(offset)];
    const [rows]=await db.query(`SELECT m.*,s.name as supplier_name FROM memos m LEFT JOIN suppliers s ON s.id=m.supplier_id ${where} ORDER BY m.created_at DESC LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total FROM memos m ${where}`,params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/memos', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const {supplier_id,customer_name,customer_phone,customer_email,issued_date,due_date,total_value,currency='USD',notes}=req.body;
    const memo_number='MEMO-'+Date.now().toString(36).toUpperCase();
    const [r]=await db.execute(
      `INSERT INTO memos (memo_number,supplier_id,customer_name,customer_phone,customer_email,issued_date,due_date,total_value,currency,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [memo_number,supplier_id||null,customer_name||null,customer_phone||null,customer_email||null,issued_date||new Date().toISOString().split('T')[0],due_date||null,total_value||null,currency,notes||null]
    );
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id, memo_number }, message:'Memo created' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/memos/:id', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const {status,notes}=req.body;
    await db.query('UPDATE memos SET status=COALESCE($1,status),notes=COALESCE($2,notes),updated_at=NOW() WHERE id=$3',[status||null,notes||null,req.params.id]);
    res.json({ success:true, message:'Memo updated' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
