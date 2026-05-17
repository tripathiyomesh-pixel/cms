const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');

router.get('/', authenticate, async (req,res)=>{
  try { const [rows]=await db.query('SELECT * FROM feature_flags ORDER BY module,flag_key'); res.json({ success:true, data:rows }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:key', authenticate, authorize(['super_admin','admin']), async (req,res)=>{
  try { await db.query('UPDATE feature_flags SET is_enabled=$1,updated_at=NOW() WHERE flag_key=$2',[!!req.body.is_enabled,req.params.key]); res.json({ success:true, message:'Updated' }); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/', authenticate, authorize(['super_admin','admin']), async (req,res)=>{
  try {
    const {flags}=req.body;
    for(const f of flags||[]) await db.query('UPDATE feature_flags SET is_enabled=$1,updated_at=NOW() WHERE flag_key=$2',[!!f.is_enabled,f.key]);
    res.json({ success:true, message:'Flags updated' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
