/**
 * VANTIX-CMS — Pages API for GrapesJS Page Builder
 * Self-healing: creates the `pages` table and seeds 7 default pages on first load.
 */
const express = require('express');
const router  = express.Router();
const { pool } = require('../../config/database');
const { authenticate } = require('../../common/guards/auth.guard');

const BUILTIN = ['home','about','bespoke','lab-grown','heritage','care-guide','faq'];

// ── Auto-create table + seed on startup ──────────────────────────────────────
async function ensurePagesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id           SERIAL PRIMARY KEY,
      slug         VARCHAR(200) NOT NULL UNIQUE,
      title        VARCHAR(300) NOT NULL,
      status       VARCHAR(20)  DEFAULT 'draft',
      html_content TEXT         DEFAULT '',
      css_content  TEXT         DEFAULT '',
      grapes_data  JSONB        DEFAULT '{}',
      is_deleted   BOOLEAN      DEFAULT FALSE,
      created_at   TIMESTAMP    DEFAULT NOW(),
      updated_at   TIMESTAMP    DEFAULT NOW()
    )
  `);
  const seeds = [
    ['home','Homepage'],['about','About Us'],['bespoke','Bespoke & Custom'],
    ['lab-grown','Lab Grown'],['heritage','Our Heritage'],['care-guide','Care Guide'],['faq','FAQ'],
  ];
  for (const [slug, title] of seeds) {
    await pool.query(
      `INSERT INTO pages (slug, title) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
      [slug, title]
    );
  }
  console.log('[pages] Table and seeds ready');
}
ensurePagesTable().catch(e => console.error('[pages] init error:', e.message));

// ── GET /api/pages ────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, status, updated_at
       FROM pages WHERE is_deleted IS NOT TRUE ORDER BY id ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── GET /api/pages/:slug  (public — storefront reads this) ───────────────────
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, status, html_content, css_content, grapes_data, updated_at
       FROM pages WHERE slug = $1 AND is_deleted IS NOT TRUE`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Page not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── PUT /api/pages/:slug  — save from GrapesJS ───────────────────────────────
router.put('/:slug', authenticate, async (req, res) => {
  try {
    const { html, css, grapes_data, status } = req.body;
    const { rows } = await pool.query(
      `SELECT id FROM pages WHERE slug = $1 AND is_deleted IS NOT TRUE`, [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Page not found' });
    await pool.query(
      `UPDATE pages
       SET html_content=$1, css_content=$2, grapes_data=$3,
           status=COALESCE(NULLIF($4,''), status), updated_at=NOW()
       WHERE slug=$5`,
      [html||'', css||'', JSON.stringify(grapes_data||{}), status||'', req.params.slug]
    );
    res.json({ success: true, message: 'Saved' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── POST /api/pages  — create a new custom page ──────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, slug } = req.body;
    if (!title || !slug) return res.status(400).json({ success: false, error: 'title and slug required' });
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    const { rows } = await pool.query(
      `INSERT INTO pages (title, slug) VALUES ($1,$2) RETURNING id, title, slug, status`,
      [title, clean]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code==='23505') return res.status(409).json({ success:false, error:'Slug already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/pages/:slug ───────────────────────────────────────────────────
router.delete('/:slug', authenticate, async (req, res) => {
  try {
    if (BUILTIN.includes(req.params.slug))
      return res.status(403).json({ success:false, error:'Cannot delete a built-in page' });
    await pool.query(
      `UPDATE pages SET is_deleted=TRUE, updated_at=NOW() WHERE slug=$1`, [req.params.slug]
    );
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
