const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const ROLES = ['super_admin','admin','manager'];

const upload = multer({
  dest: '/tmp/imports/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv','.xlsx','.xls'].includes(ext)) cb(null, true);
    else cb(new Error('Only CSV and Excel files allowed'));
  }
});

// List import jobs
router.get('/jobs', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT ij.*,s.name as supplier_name FROM import_jobs ij LEFT JOIN suppliers s ON s.id=ij.supplier_id ORDER BY ij.created_at DESC LIMIT 50');
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// Get single job
router.get('/jobs/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM import_jobs WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// Upload CSV for preview (returns first 10 rows + detected columns)
router.post('/preview', authenticate, authorize(ROLES), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(422).json({ success:false, message:'No file uploaded' });
    const { import_type = 'supplier_csv' } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let rows = [];
    let columns = [];

    if (ext === '.csv') {
      const content = fs.readFileSync(req.file.path, 'utf8');
      const lines = content.split('\n').filter(l=>l.trim());
      if (lines.length > 0) {
        columns = lines[0].split(',').map(c=>c.trim().replace(/^"|"$/g,''));
        rows = lines.slice(1, 11).map(line => {
          const vals = line.split(',').map(v=>v.trim().replace(/^"|"$/g,''));
          return columns.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] || '' }), {});
        });
      }
    } else {
      // Excel — would need xlsx package
      return res.json({ success:true, data:{ columns:[], rows:[], note:'Excel import: install xlsx package. Use CSV for now.' } });
    }

    // Detect import type from column names
    const colLower = columns.map(c=>c.toLowerCase());
    const detectedType = colLower.includes('shape') && colLower.includes('carat') ? 'diamond'
      : colLower.includes('gemstone_type') || colLower.includes('species') ? 'gemstone'
      : colLower.includes('pearl_type') ? 'pearl'
      : colLower.includes('mounting_type') ? 'mounting'
      : 'jewellery';

    // Create import job record
    const [r] = await db.execute(
      `INSERT INTO import_jobs (import_type,filename,file_url,status,total_rows,created_by) VALUES ($1,$2,$3,'PENDING',$4,$5) RETURNING id`,
      [import_type, req.file.originalname, req.file.path, Math.max(0, rows.length - 1), req.user.id]
    );
    const jobId = r[0]?.id || r.rows?.[0]?.id;

    fs.unlinkSync(req.file.path);
    res.json({ success:true, data:{ job_id:jobId, columns, preview_rows:rows, detected_type:detectedType, total_rows:rows.length } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// Rapnet format field mapping helper
router.get('/templates/rapnet', authenticate, async (req, res) => {
  res.json({ success:true, data:{
    description:'RapNet CSV column mapping for diamonds',
    mapping:{
      'Shape':'shape', 'Weight':'carat', 'Color':'color', 'Clarity':'clarity',
      'Cut':'cut', 'Polish':'polish', 'Symmetry':'symmetry', 'Fluorescence Intensity':'fluorescence',
      'Lab':'primary_cert_lab', 'Certificate #':'primary_cert_no',
      'Depth %':'depth_percent', 'Table %':'table_percent',
      'Measurement':'dimensions', 'Rap Price':'rap_rate', 'Disc %':'rap_discount_pct',
      'Price/Ct':'base_price_per_carat', 'Total Price':'final_price',
    }
  }});
});

module.exports = router;
