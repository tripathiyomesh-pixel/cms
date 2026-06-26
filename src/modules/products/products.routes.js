const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const { upload } = require('../../config/cloudinary');
const slugify  = require('slugify');

const CACHE_TTL = 120;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const generateSKU = (metal='GEN', purity='NA') =>
  `${metal.slice(0,2).toUpperCase()}${purity.replace('K','')}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

const generateSlug = async (name) => {
  let slug = slugify(name, { lower:true, strict:true });
  const { rows } = await pool.query(`SELECT id FROM products WHERE slug=$1 LIMIT 1`, [slug]);
  if (rows.length) slug = `${slug}-${Date.now().toString(36).slice(-3)}`;
  return slug;
};

const calcFinalPrice = (d) => {
  const base    = parseFloat(d.base_price) || 0;
  const making  = parseFloat(d.making_charges) || 0;
  const discount= parseFloat(d.discount) || 0;
  return Math.max(0, base + making - discount);
};

// ─── LIST ────────────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, search, metal_type, purity, status,
            category_id, is_featured, sort='created_at', order='DESC' } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success:true, ...cached });

    const conditions = ['p.deleted_at IS NULL'];
    const params = [];
    let pi = 1;
    if (search)      { conditions.push(`p.name ILIKE $${pi}`); params.push(`%${search}%`); pi++; }
    if (metal_type)  { conditions.push(`p.metal_type=$${pi}`);  params.push(metal_type); pi++; }
    if (purity)      { conditions.push(`p.purity=$${pi}`);      params.push(purity); pi++; }
    if (status)      { conditions.push(`p.status=$${pi}`);      params.push(status); pi++; }
    if (category_id) { conditions.push(`p.category_id=$${pi}`); params.push(category_id); pi++; }
    if (is_featured==='true') conditions.push(`p.is_featured=true`);

    const allowed = ['name','created_at','final_price','stock_quantity','sort_order'];
    const sortCol = allowed.includes(sort) ? sort : 'created_at';
    const sortDir = order==='ASC' ? 'ASC' : 'DESC';
    const where   = conditions.join(' AND ');

    const [{ rows }, { rows: [cnt] }] = await Promise.all([
      pool.query(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug,
          (SELECT file_url FROM media WHERE product_id=p.id AND is_primary=true LIMIT 1) AS primary_image,
          (SELECT thumb_url FROM media WHERE product_id=p.id AND is_primary=true LIMIT 1) AS thumb_url
        FROM products p
        LEFT JOIN categories c ON c.id=p.category_id
        WHERE ${where}
        ORDER BY p.${sortCol} ${sortDir}
        LIMIT $${pi} OFFSET $${pi+1}`,
        [...params, parseInt(limit), offset]
      ),
      pool.query(`SELECT COUNT(*) as total FROM products p WHERE ${where}`, params),
    ]);

    const payload = { data:rows, pagination:{ total:parseInt(cnt.total), page:+page, limit:+limit, pages:Math.ceil(cnt.total/limit) } };
    await cache.set(cacheKey, payload, CACHE_TTL);
    res.json({ success:true, ...payload });
  } catch (e) { error(res, e.message); }
});

// ─── SINGLE ──────────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cacheKey = `products:single:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return success(res, cached);

    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id=p.category_id
      WHERE p.id=$1 AND p.deleted_at IS NULL LIMIT 1`, [req.params.id]
    );
    if (!rows.length) return error(res, 'Product not found', 404);

    const { rows: media } = await pool.query(
      `SELECT * FROM media WHERE product_id=$1 ORDER BY sort_order ASC`, [req.params.id]
    );
    const product = { ...rows[0], media };
    await cache.set(cacheKey, product, CACHE_TTL);
    success(res, product);
  } catch (e) { error(res, e.message); }
});

// ─── CREATE ──────────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize(['super_admin','admin','manager','editor']), async (req, res) => {
  try {
    const d = req.body;
    d.sku        = d.sku  || generateSKU(d.metal_type, d.purity);
    d.slug       = d.slug || await generateSlug(d.name);
    d.final_price= d.final_price ?? calcFinalPrice(d);
    d.created_by = req.user.id;

    const { rows: [product] } = await pool.query(`
      INSERT INTO products (
        name, sku, slug, description, short_description, category_id, collection_id,
        metal_type, purity, gross_weight, net_weight, gemstone_details, certifications,
        base_price, making_charges, making_charge_pct, discount, discount_pct, final_price,
        country_pricing, currency, tax_class, stock_quantity, is_made_to_order,
        tags, status, is_featured, is_new_arrival, is_best_seller, is_lab_grown,
        embossing_available, engraving_available, video_url, seo_title, seo_description, seo_slug,
        sort_order, product_type, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39
      ) RETURNING *`,
      [
        d.name, d.sku, d.slug, d.description||null, d.short_description||null,
        d.category_id||null, d.collection_id||null, d.metal_type||null, d.purity||null,
        d.gross_weight||0, d.net_weight||null,
        JSON.stringify(d.gemstone_details||[]), JSON.stringify(d.certifications||[]),
        d.base_price||0, d.making_charges||0, d.making_charge_pct||0,
        d.discount||0, d.discount_pct||0, d.final_price,
        JSON.stringify(d.country_pricing||{}), d.currency||'AED', d.tax_class||'standard',
        d.stock_quantity||0, d.is_made_to_order||false,
        JSON.stringify(d.tags||[]), d.status||'draft',
        d.is_featured||false, d.is_new_arrival||false, d.is_best_seller||false, d.is_lab_grown||false,
        d.embossing_available||false, d.engraving_available||false, d.video_url||null,
        d.seo_title||null, d.seo_description||null, d.seo_slug||null,
        d.sort_order||0, d.product_type||null, d.created_by,
      ]
    );
    await cache.delPattern('products:*');
    created(res, product, 'Product created');
  } catch (e) { error(res, e.message); }
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize(['super_admin','admin','manager','editor']), async (req, res) => {
  try {
    const { rows: [existing] } = await pool.query(`SELECT * FROM products WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    if (!existing) return error(res, 'Product not found', 404);

    const d = req.body;
    if (d.name && d.name !== existing.name) d.slug = await generateSlug(d.name);
    if (d.base_price || d.making_charges || d.discount) {
      d.final_price = calcFinalPrice({ ...existing, ...d });
    }
    d.updated_by = req.user.id;

    const fields = ['name','slug','description','short_description','category_id','collection_id',
      'metal_type','purity','gross_weight','net_weight','base_price','making_charges',
      'making_charge_pct','discount','discount_pct','final_price','currency','tax_class',
      'stock_quantity','is_made_to_order','status','is_featured','is_new_arrival',
      'is_best_seller','is_lab_grown','embossing_available','engraving_available','video_url',
      'seo_title','seo_description','seo_slug','sort_order','product_type','updated_by'];
    const jsonFields = ['gemstone_details','certifications','country_pricing','tags'];

    const sets = []; const vals = [];
    fields.forEach(f => {
      if (d[f] !== undefined) { sets.push(`${f}=$${sets.length+1}`); vals.push(d[f]); }
    });
    jsonFields.forEach(f => {
      if (d[f] !== undefined) { sets.push(`${f}=$${sets.length+1}`); vals.push(JSON.stringify(d[f])); }
    });
    sets.push(`updated_at=NOW()`);
    vals.push(req.params.id);

    const { rows: [product] } = await pool.query(
      `UPDATE products SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals
    );
    await cache.delPattern('products:*');
    success(res, product, 'Product updated');
  } catch (e) { error(res, e.message); }
});

// ─── DELETE ──────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE products SET deleted_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]
    );
    if (!rowCount) return error(res, 'Product not found', 404);
    await cache.delPattern('products:*');
    success(res, {}, 'Product deleted');
  } catch (e) { error(res, e.message); }
});

// ─── QUICK STATUS PATCH ──────────────────────────────────────────────────────
router.patch('/:id/status', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const allowed = ['status','is_featured','is_new_arrival','is_best_seller','is_lab_grown','is_active'];
    const sets = []; const vals = [];
    allowed.forEach(f => { if (req.body[f] !== undefined) { sets.push(`${f}=$${sets.length+1}`); vals.push(req.body[f]); } });
    if (!sets.length) return error(res, 'Nothing to update', 422);
    sets.push(`updated_at=NOW()`); vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals
    );
    if (!rows.length) return error(res, 'Product not found', 404);
    await cache.delPattern('products:*');
    success(res, rows[0], 'Product updated');
  } catch (e) { error(res, e.message); }
});

// ─── BULK STATUS ─────────────────────────────────────────────────────────────
router.post('/bulk-status', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids?.length || !status) return error(res, 'ids and status required', 422);
    const valid = ['active','draft','inactive','archived'];
    if (!valid.includes(status)) return error(res, 'Invalid status', 422);
    const placeholders = ids.map((_,i) => `$${i+2}`).join(',');
    await pool.query(
      `UPDATE products SET status=$1, updated_at=NOW() WHERE id IN (${placeholders})`,
      [status, ...ids]
    );
    await cache.delPattern('products:*');
    success(res, { updated: ids.length }, `${ids.length} products updated to ${status}`);
  } catch (e) { error(res, e.message); }
});

// ─── STOCK UPDATE ────────────────────────────────────────────────────────────
router.put('/:id/stock', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { quantity, type='adjustment', reference, notes } = req.body;
    if (quantity === undefined) return error(res, 'quantity required', 422);
    const { rows: [product] } = await pool.query(`SELECT id,stock_quantity FROM products WHERE id=$1`, [req.params.id]);
    if (!product) return error(res, 'Product not found', 404);
    let newQty = product.stock_quantity || 0;
    if (type==='in')       newQty += parseInt(quantity);
    else if (type==='out') newQty -= parseInt(quantity);
    else                   newQty  = parseInt(quantity);
    if (newQty < 0) return error(res, 'Insufficient stock', 422);
    await pool.query(`UPDATE products SET stock_quantity=$1, updated_at=NOW() WHERE id=$2`, [newQty, req.params.id]);
    await pool.query(
      `INSERT INTO inventory_ledger (product_id,type,quantity,balance,reference,notes,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [req.params.id, type, parseInt(quantity), newQty, reference||null, notes||null, req.user.id]
    );
    await cache.delPattern('products:*');
    success(res, { stock_quantity: newQty }, 'Stock updated');
  } catch (e) { error(res, e.message); }
});

// ─── MEDIA UPLOAD ────────────────────────────────────────────────────────────
router.post('/:id/media', authenticate, authorize(['super_admin','admin','manager','editor']),
  upload.array('files', 10), async (req, res) => {
  try {
    const { rows: [product] } = await pool.query(`SELECT id,name FROM products WHERE id=$1`, [req.params.id]);
    if (!product) return error(res, 'Product not found', 404);
    if (!req.files?.length) return error(res, 'No files uploaded', 422);
    const { file_type='image', alt_text, set_primary } = req.body;
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM media WHERE product_id=$1`, [req.params.id]);
    const media = await Promise.all(req.files.map((file, i) =>
      pool.query(
        `INSERT INTO media (product_id,file_url,thumb_url,cloudinary_id,file_type,media_type,file_size,alt_text,is_primary,sort_order)
         VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9) RETURNING *`,
        [
          req.params.id, file.path,
          file.path.replace('/upload/','/upload/w_400,q_auto/'),
          file.filename, file_type, file.size,
          alt_text||product.name,
          (set_primary==='true' && i===0),
          parseInt(count)+i,
        ]
      ).then(r => r.rows[0])
    ));
    await cache.delPattern('products:*');
    created(res, media, `${media.length} file(s) uploaded`);
  } catch (e) { error(res, e.message); }
});

// ─── DELETE MEDIA ────────────────────────────────────────────────────────────
router.delete('/:id/media/:mediaId', authenticate, authorize(['super_admin','admin','manager','editor']), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM media WHERE id=$1 AND product_id=$2`, [req.params.mediaId, req.params.id]
    );
    if (!rowCount) return error(res, 'Media not found', 404);
    await cache.delPattern('products:*');
    success(res, {}, 'Media deleted');
  } catch (e) { error(res, e.message); }
});

// ─── VARIANTS ────────────────────────────────────────────────────────────────
router.get('/:productId/variants', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM product_variants WHERE product_id=$1 AND is_active=true ORDER BY sort_order ASC`,
      [req.params.productId]
    );
    success(res, rows);
  } catch (e) { error(res, e.message); }
});

router.post('/:productId/variants', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, sku, attributes={}, price_delta=0, stock=0, weight, image_url, sort_order=0 } = req.body;
    if (!name) return error(res, 'name required', 422);
    const autoSku = sku || `V-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const { rows: [v] } = await pool.query(
      `INSERT INTO product_variants (product_id,name,sku,attributes,price_delta,stock,weight,image_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.params.productId, name, autoSku, JSON.stringify(attributes), price_delta, stock, weight||null, image_url||null, sort_order]
    );
    success(res, v, 'Variant created');
  } catch (e) { error(res, e.message); }
});

router.patch('/:productId/variants/:variantId', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const fields = ['name','sku','price_delta','stock','weight','image_url','sort_order','is_active'];
    const sets=[]; const vals=[];
    fields.forEach(f => { if (req.body[f]!==undefined) { sets.push(`${f}=$${sets.length+1}`); vals.push(req.body[f]); } });
    if (req.body.attributes!==undefined) { sets.push(`attributes=$${sets.length+1}`); vals.push(JSON.stringify(req.body.attributes)); }
    if (!sets.length) return success(res, {}, 'Nothing to update');
    sets.push('updated_at=NOW()'); vals.push(req.params.variantId, req.params.productId);
    await pool.query(
      `UPDATE product_variants SET ${sets.join(',')} WHERE id=$${vals.length-1} AND product_id=$${vals.length}`, vals
    );
    success(res, {}, 'Variant updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/:productId/variants/:variantId', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    await pool.query(
      `UPDATE product_variants SET is_active=false, updated_at=NOW() WHERE id=$1 AND product_id=$2`,
      [req.params.variantId, req.params.productId]
    );
    success(res, {}, 'Variant removed');
  } catch (e) { error(res, e.message); }
});


// ─── PRICING ENGINE ──────────────────────────────────────────────────────────
const { calculateFinalPrice } = require('../../common/pricing.service');

// POST /api/products/:id/calculate-price
router.post('/:id/calculate-price', authenticate, async (req, res) => {
  try {
    const { rows: [product] } = await pool.query(
      `SELECT p.*, gr.rate_22k as live_rate_22k
       FROM products p
       LEFT JOIN gold_rates gr ON gr.is_active=true
       WHERE p.id=$1 AND p.deleted_at IS NULL
       ORDER BY gr.fetched_at DESC LIMIT 1`,
      [req.params.id]
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const purity_map = { '24K': 1.0, '22K': 0.9167, '21K': 0.875, '18K': 0.75, '14K': 0.5833, '9K': 0.375 };
    const goldRate22k = parseFloat(req.body.gold_rate_22k) || parseFloat(product.live_rate_22k) || 0;
    const purityFactor = purity_map[product.purity] || purity_map[(product.purity || '').toUpperCase()] || 0.75;
    const grossWeight = parseFloat(product.gross_weight) || 0;

    const base_price = grossWeight > 0 && goldRate22k > 0
      ? grossWeight * goldRate22k * (purityFactor / purity_map['22K'])
      : parseFloat(product.base_price) || 0;

    const result = calculateFinalPrice({
      base_price,
      making_charges: product.making_charges || 0,
      making_charge_pct: product.making_charge_pct || 0,
      discount: product.discount || 0,
      discount_pct: product.discount_pct || 0,
    });

    res.json({
      success: true,
      data: {
        ...result,
        stone_value: parseFloat(product.stone_value) || 0,
        currency: product.currency || 'AED',
        gold_rate_22k_used: goldRate22k,
        gross_weight: grossWeight,
        purity: product.purity,
      },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/products/bulk-price-update
router.post('/bulk-price-update', authenticate, authorize(['super_admin', 'admin', 'manager']), async (req, res) => {
  try {
    const { collection_id, category_id, gold_rate_22k } = req.body;
    if (!gold_rate_22k) return res.status(422).json({ success: false, message: 'gold_rate_22k required' });
    if (!collection_id && !category_id) return res.status(422).json({ success: false, message: 'collection_id or category_id required' });

    const purity_map = { '24K': 1.0, '22K': 0.9167, '21K': 0.875, '18K': 0.75, '14K': 0.5833, '9K': 0.375 };
    const goldRate = parseFloat(gold_rate_22k);

    let whereClause = 'deleted_at IS NULL AND gross_weight > 0 AND purity IS NOT NULL';
    const params = [];
    if (collection_id) { params.push(collection_id); whereClause += ` AND collection_id=${params.length}`; }
    if (category_id)   { params.push(category_id);   whereClause += ` AND category_id=${params.length}`; }

    const { rows: products } = await pool.query(
      `SELECT id, purity, gross_weight, making_charges, making_charge_pct, discount, discount_pct FROM products WHERE ${whereClause}`,
      params
    );

    let updated = 0;
    for (const p of products) {
      const purityFactor = purity_map[p.purity] || purity_map[(p.purity||'').toUpperCase()] || 0.75;
      const base_price = parseFloat(p.gross_weight) * goldRate * (purityFactor / purity_map['22K']);
      const { final_price } = calculateFinalPrice({
        base_price,
        making_charges: p.making_charges || 0,
        making_charge_pct: p.making_charge_pct || 0,
        discount: p.discount || 0,
        discount_pct: p.discount_pct || 0,
      });
      await pool.query(`UPDATE products SET base_price=$1, final_price=$2, updated_at=NOW() WHERE id=$3`, [base_price, final_price, p.id]);
      updated++;
    }

    res.json({ success: true, data: { updated_count: updated, gold_rate_22k_used: goldRate } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

