const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];
const STATUSES = ['INQUIRY','DESIGNING','APPROVAL_PENDING','APPROVED','MANUFACTURING','STONE_SETTING','POLISHING','QC','READY','SHIPPED','CANCELLED'];
const FLOW     = ['INQUIRY','DESIGNING','APPROVAL_PENDING','APPROVED','MANUFACTURING','STONE_SETTING','POLISHING','QC','READY','SHIPPED'];

router.get('/', authenticate, async (req,res)=>{
  try {
    const {page=1,limit=20,status,search}=req.query;
    const offset=(page-1)*limit; const params=[];
    let where='WHERE 1=1';
    if(status){ params.push(status); where+=` AND status=$${params.length}`; }
    if(search){ params.push(`%${search}%`); where+=` AND (customer_name ILIKE $${params.length} OR order_number ILIKE $${params.length})`; }
    const qp=[...params,parseInt(limit),parseInt(offset)];
    const [rows]=await db.query(`SELECT * FROM custom_orders ${where} ORDER BY created_at DESC LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total FROM custom_orders ${where}`,params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', async (req,res)=>{
  try {
    const {customer_name,customer_phone,customer_email,description,inspiration_urls=[],metal_preference,stone_preference,budget_min,budget_max,currency='AED'}=req.body;
    if(!customer_name||!customer_phone) return res.status(422).json({ success:false, message:'customer_name and customer_phone required' });
    const order_number='CUST-'+Date.now().toString(36).toUpperCase();
    const [r]=await db.execute(
      `INSERT INTO custom_orders (order_number,customer_name,customer_phone,customer_email,description,inspiration_urls,metal_preference,stone_preference,budget_min,budget_max,currency) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [order_number,customer_name,customer_phone,customer_email||null,description||null,JSON.stringify(inspiration_urls),metal_preference||null,stone_preference||null,budget_min||null,budget_max||null,currency]
    );
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id, order_number }, message:'Custom order created' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/stats/summary', authenticate, async (req,res)=>{
  try {
    const [byStatus]=await db.query(`SELECT status,COUNT(*) as count FROM custom_orders GROUP BY status`);
    const [recent]=await db.query(`SELECT * FROM custom_orders ORDER BY created_at DESC LIMIT 5`);
    res.json({ success:true, data:{ by_status:byStatus, recent } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req,res)=>{
  try {
    const [rows]=await db.query('SELECT * FROM custom_orders WHERE id=$1',[req.params.id]);
    if(!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    const [cads]=await db.query('SELECT * FROM custom_order_cad WHERE custom_order_id=$1 ORDER BY version DESC',[req.params.id]);
    res.json({ success:true, data:{ ...rows[0], cad_designs:cads } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/status', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const {status,notes,quoted_amount,estimated_days,assigned_to}=req.body;
    if(!STATUSES.includes(status)) return res.status(422).json({ success:false, message:'Invalid status' });
    const sets=['status=$1','updated_at=NOW()']; const vals=[status];
    if(notes){vals.push(notes);sets.push(`notes=$${vals.length}`);}
    if(quoted_amount!==undefined){vals.push(quoted_amount);sets.push(`quoted_amount=$${vals.length}`,`quoted_at=NOW()`);}
    if(estimated_days){vals.push(estimated_days);sets.push(`estimated_days=$${vals.length}`);}
    if(assigned_to){vals.push(assigned_to);sets.push(`assigned_to=$${vals.length}`);}
    if(status==='APPROVED') sets.push('approved_at=NOW()');
    if(status==='SHIPPED')  sets.push('delivered_at=NOW()');
    vals.push(req.params.id);
    await db.query(`UPDATE custom_orders SET ${sets.join(',')} WHERE id=$${vals.length}`,vals);
    res.json({ success:true, message:'Status updated' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/cad', authenticate, authorize(ROLES), async (req,res)=>{
  try {
    const {cad_file_url,preview_url,notes}=req.body;
    const [last]=await db.query('SELECT MAX(version) as v FROM custom_order_cad WHERE custom_order_id=$1',[req.params.id]);
    const version=(+last[0]?.v||0)+1;
    const [r]=await db.execute(
      `INSERT INTO custom_order_cad (custom_order_id,version,cad_file_url,preview_url,notes) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [req.params.id,version,cad_file_url||null,preview_url||null,notes||null]
    );
    await db.query("UPDATE custom_orders SET status='APPROVAL_PENDING',updated_at=NOW() WHERE id=$1",[req.params.id]);
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id, version }, message:'CAD uploaded' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/cad/:cadId/approve', authenticate, async (req,res)=>{
  try {
    const {approved,feedback}=req.body;
    const newStatus=approved?'APPROVED':'REJECTED';
    await db.query('UPDATE custom_order_cad SET status=$1,customer_feedback=$2 WHERE id=$3',[newStatus,feedback||null,req.params.cadId]);
    if(approved) await db.query("UPDATE custom_orders SET status='APPROVED',approved_at=NOW(),updated_at=NOW() WHERE id=$1",[req.params.id]);
    else await db.query("UPDATE custom_orders SET status='DESIGNING',updated_at=NOW() WHERE id=$1",[req.params.id]);
    res.json({ success:true, message:approved?'CAD approved':'Sent back for revision' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
