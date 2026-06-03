const express = require('express');
const { makeSlug } = require('../../common/slug.util');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager','editor'];

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, status, search } = req.query;
    const offset=(page-1)*limit; const params=[];
    let where='WHERE 1=1';
    if(status){ params.push(status); where+=` AND status=$${params.length}`; }
    if(search){ params.push(`%${search}%`); where+=` AND (title ILIKE $${params.length} OR excerpt ILIKE $${params.length})`; }
    const qp=[...params,parseInt(limit),parseInt(offset)];
    const [rows]=await db.query(`SELECT id,title,slug,status,author_name,cover_image,published_at,created_at FROM blog_posts ${where} ORDER BY created_at DESC LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total FROM blog_posts ${where}`,params);
    res.json({ success:true, data:{ data:rows, total:+cnt[0]?.total||0, page:+page } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const col = req.params.id.includes('-') && !req.params.id.match(/^[0-9a-f]{8}/) ? 'slug' : 'id';
    const [rows]=await db.query(`SELECT * FROM blog_posts WHERE ${col}=$1`,[req.params.id]);
    if(!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const {title,slug,content,excerpt,cover_image,status='draft',tags=[],seo_title,seo_description,category}=req.body;
    if(!title) return res.status(422).json({ success:false, message:'title required' });
    const autoSlug = slug || makeSlug(title);
    const [r]=await db.execute(
      `INSERT INTO blog_posts (title,slug,content,excerpt,cover_image,status,tags,seo_title,seo_description,category,author_name,author_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [title,autoSlug,content||null,excerpt||null,cover_image||null,status,JSON.stringify(tags),seo_title||null,seo_description||null,category||null,req.user.name,req.user.id,status==='published'?new Date():null]
    );
    res.json({ success:true, data:{ id:r[0]?.id||r.rows?.[0]?.id }, message:'Post created' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const fields=['title','content','excerpt','cover_image','status','category','seo_title','seo_description'];
    const updates=fields.filter(f=>req.body[f]!==undefined);
    if(req.body.tags) { updates.push('tags'); }
    if(req.body.status==='published') { updates.push('published_at'); }
    if(!updates.length) return res.json({ success:true, message:'Nothing to update' });
    const vals=updates.map(f=>f==='tags'?JSON.stringify(req.body[f]):f==='published_at'?new Date():req.body[f]);
    vals.push(req.params.id);
    await db.query(`UPDATE blog_posts SET ${updates.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${vals.length}`,vals);
    res.json({ success:true, message:'Updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try { await db.query('DELETE FROM blog_posts WHERE id=$1',[req.params.id]); res.json({ success:true, message:'Deleted' }); }
  catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
