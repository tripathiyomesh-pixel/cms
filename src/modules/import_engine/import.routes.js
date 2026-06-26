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

// Confirm and start import — applies column mapping to preview rows and processes them
router.post('/start', authenticate, authorize(ROLES), async (req, res) => {
  try {
    const { job_id, mapping, import_type, rows } = req.body;
    if (!job_id) return res.status(422).json({ success:false, message:'job_id required' });
    if (!rows?.length) return res.status(422).json({ success:false, message:'No rows to import — rows must be provided' });

    await db.query(`UPDATE import_jobs SET status='PROCESSING' WHERE id=$1`, [job_id]);

    // Remap columns according to the user's mapping
    const remapped = rows.map(row => {
      const out = {};
      for (const [csvCol, sysField] of Object.entries(mapping || {})) {
        if (sysField && row[csvCol] !== undefined) out[sysField] = row[csvCol];
      }
      return out;
    });

    let imported = 0, skipped = 0, errors = [];
    const type = import_type || 'jewellery';

    for (const row of remapped) {
      try {
        if (type === 'diamond') {
          const invType = row.diamond_type === 'LAB_GROWN' ? 'LAB_GROWN_DIAMOND' : 'NATURAL_DIAMOND';
          const autoSku = `DMD-${invType === 'LAB_GROWN_DIAMOND' ? 'LG' : 'NT'}-${Date.now().toString(36).toUpperCase().slice(-5)}-${imported}`;
          const name = row.name || `${type} ${row.shape || ''} ${row.carat || ''}ct ${row.color || ''} ${row.clarity || ''}`.trim();
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + autoSku.toLowerCase();
          const [p] = await db.execute(
            `INSERT INTO products (name,sku,slug,base_price,final_price,currency,status,inventory_type,inventory_mode,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
            [name, autoSku, slug, parseFloat(row.base_price)||0, parseFloat(row.final_price)||0, row.currency||'USD', row.status||'active', invType, row.inventory_mode||'IN_HOUSE', req.user.id]
          );
          const pid = p[0]?.id || p.rows?.[0]?.id;
          await db.execute(
            `INSERT INTO diamond_details (product_id,diamond_type,growth_type,shape,carat,color,clarity,cut,polish,symmetry,fluorescence,primary_cert_lab,primary_cert_no,rap_rate,rap_discount_pct) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
            [pid, row.diamond_type||'NATURAL', row.growth_type||null, row.shape||null, parseFloat(row.carat)||null, row.color||null, row.clarity||null, row.cut||null, row.polish||null, row.symmetry||null, row.fluorescence||null, row.primary_cert_lab||null, row.primary_cert_no||null, parseFloat(row.rap_rate)||null, parseFloat(row.rap_discount_pct)||null]
          );
          imported++;
        } else if (type === 'customer') {
          if (!row.phone) { skipped++; continue; }
          await db.execute(
            `INSERT INTO customers (name,email,phone,country_code,notes) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (phone) DO NOTHING`,
            [row.name||'Unknown', row.email||null, row.phone, row.country_code||'AE', row.notes||null]
          );
          imported++;
        } else if (type === 'supplier') {
          if (!row.name) { skipped++; continue; }
          await db.execute(
            `INSERT INTO suppliers (name,contact_name,email,phone,country,city) VALUES ($1,$2,$3,$4,$5,$6)`,
            [row.name, row.contact_name||null, row.email||null, row.phone||null, row.country||null, row.city||null]
          );
          imported++;
        } else {
          // jewellery / gemstone / pearl / mounting — insert as generic product
          if (!row.name) { skipped++; continue; }
          const autoSku = `${type.slice(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}-${imported}`;
          const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + autoSku.toLowerCase();
          await db.execute(
            `INSERT INTO products (name,sku,slug,base_price,final_price,currency,status,inventory_type,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [row.name, autoSku, slug, parseFloat(row.base_price)||0, parseFloat(row.final_price)||0, row.currency||'AED', row.status||'active', type.toUpperCase(), req.user.id]
          );
          imported++;
        }
      } catch(e) { errors.push({ row: imported+skipped+1, error: e.message }); skipped++; }
    }

    await db.query(
      `UPDATE import_jobs SET status='DONE', imported=$1, skipped=$2, errors=$3, error_log=$4, completed_at=NOW() WHERE id=$5`,
      [imported, skipped, errors.length, JSON.stringify(errors.slice(0,50)), job_id]
    );

    res.json({ success:true, data:{ imported, skipped, errors: errors.slice(0,10), message:`${imported} records imported, ${skipped} skipped` }});
  } catch(e) {
    res.status(500).json({ success:false, message:e.message });
  }
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
