/**
 * VANTIX-CMS — Standalone Media Library Routes
 *
 * /api/media — browse all media across all products
 * /api/media/bulk-delete — delete multiple media files
 * /api/media/:id — update alt text, set primary
 * /api/media/general — upload media not tied to a product (general library)
 *
 * Complements the product-specific /api/products/:id/media endpoints.
 */
const express = require('express');
const router  = express.Router();
const { pool } = require('../../config/database');
const { upload: rawUpload } = require('../../config/cloudinary');
const multer = require('multer');

const ALLOWED_MIMES = new Set(['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','application/pdf']);
const upload = {
  array: (field, max) => [
    rawUpload.array(field, max),
    (req, res, next) => {
      if (!req.files) return next();
      const bad = req.files.find(f => !ALLOWED_MIMES.has(f.mimetype));
      if (bad) return res.status(422).json({ success:false, message:`File type not allowed: ${bad.mimetype}` });
      next();
    }
  ]
};
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const EDITORS = ['super_admin', 'admin', 'manager', 'editor'];

// ── GET /api/media — paginated media browser ──────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page      = 1,
      limit     = 48,
      search    = '',
      file_type = '',
      product_id = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (m.alt_text ILIKE $${params.length} OR m.cloudinary_id ILIKE $${params.length} OR p.name ILIKE $${params.length})`;
    }
    if (file_type) { params.push(file_type); where += ` AND m.file_type = $${params.length}`; }
    if (product_id) { params.push(product_id); where += ` AND m.product_id = $${params.length}`; }

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(`
      SELECT
        m.id, m.file_url, m.thumb_url, m.cloudinary_id, m.file_type,
        m.alt_text, m.is_primary, m.sort_order, m.file_size, m.created_at,
        m.product_id,
        p.name AS product_name, p.sku AS product_sku
      FROM media m
      LEFT JOIN products p ON p.id = m.product_id
      ${where}
      ORDER BY m.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    // Total count
    const countParams = params.slice(0, -2);
    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM media m LEFT JOIN products p ON p.id=m.product_id ${where}`,
      countParams
    );

    // Stats
    const { rows: stats } = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER(WHERE file_type='image') AS images,
        COUNT(*) FILTER(WHERE file_type='video') AS videos,
        COUNT(*) FILTER(WHERE file_type='pdf')   AS pdfs,
        COALESCE(SUM(file_size), 0)              AS total_size
      FROM media
    `);

    res.json({
      success: true,
      data: rows,
      total: parseInt(count),
      page: parseInt(page),
      stats: stats[0],
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/media/folders — unique product names as 'folders' ────────────────
router.get('/folders', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.sku, COUNT(m.id) AS media_count
      FROM products p
      JOIN media m ON m.product_id = p.id
      GROUP BY p.id, p.name, p.sku
      ORDER BY p.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/media/bulk-delete — delete multiple media files ─────────────────
router.post('/bulk-delete', authenticate, authorize(EDITORS), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return res.status(422).json({ success: false, message: 'ids array required' });

    // Cap at 50 per request to prevent abuse
    const safeIds = ids.slice(0, 50);

    const { rowCount } = await pool.query(
      `DELETE FROM media WHERE id = ANY($1::uuid[])`,
      [safeIds]
    );

    // Optionally: delete from Cloudinary too
    // const cloudinary = require('cloudinary').v2;
    // await cloudinary.api.delete_resources(cloudinaryIds);

    res.json({ success: true, message: `${rowCount} file(s) deleted`, deleted: rowCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── PATCH /api/media/:id — update alt_text, is_primary ───────────────────────
router.patch('/:id', authenticate, authorize(EDITORS), async (req, res) => {
  try {
    const { alt_text, is_primary } = req.body;
    const updates = [];
    const vals    = [];

    if (alt_text !== undefined)   { vals.push(alt_text);   updates.push(`alt_text=$${vals.length}`);   }
    if (is_primary !== undefined) { vals.push(is_primary); updates.push(`is_primary=$${vals.length}`); }

    if (!updates.length) return res.json({ success: true, message: 'Nothing to update' });

    // If setting as primary, unset other primaries for same product
    if (is_primary === true || is_primary === 'true') {
      const { rows: [media] } = await pool.query(`SELECT product_id FROM media WHERE id=$1`, [req.params.id]);
      if (media?.product_id) {
        await pool.query(
          `UPDATE media SET is_primary=false WHERE product_id=$1 AND id!=$2`,
          [media.product_id, req.params.id]
        );
      }
    }

    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE media SET ${updates.join(', ')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── DELETE /api/media/:id — delete single ─────────────────────────────────────
router.delete('/:id', authenticate, authorize(EDITORS), async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM media WHERE id=$1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/media/upload/:productId — upload files for a product ────────────
router.post('/upload/:productId',
  authenticate,
  authorize(EDITORS),
  ...upload.array('files', 20),
  async (req, res) => {
    try {
      const { productId } = req.params;
      if (!req.files?.length) return res.status(422).json({ success: false, message: 'No files uploaded' });

      const { rows: [product] } = await pool.query(`SELECT id, name FROM products WHERE id=$1`, [productId]);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const { rows: [{ count }] } = await pool.query(
        `SELECT COUNT(*) FROM media WHERE product_id=$1`, [productId]
      );

      const media = await Promise.all(req.files.map((file, i) =>
        pool.query(
          `INSERT INTO media
             (product_id, file_url, thumb_url, cloudinary_id, file_type, file_size, alt_text, is_primary, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           RETURNING *`,
          [
            productId,
            file.path,
            file.path.replace('/upload/', '/upload/w_400,q_auto/'),
            file.filename,
            (() => {
              const mime = file.mimetype || '';
              if (mime.startsWith('image/')) return 'image';
              if (mime.startsWith('video/')) return 'video';
              if (mime === 'application/pdf') return 'pdf';
              return 'image'; // safe default
            })(),
            file.size,
            req.body.alt_text || product.name,
            (req.body.set_primary === 'true' && i === 0 && parseInt(count) === 0),
            parseInt(count) + i,
          ]
        ).then(r => r.rows[0])
      ));

      res.status(201).json({ success: true, data: media, message: `${media.length} file(s) uploaded` });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

module.exports = router;
