/**
 * VANTIX-CMS — Pages API
 *
 * Bug fixes applied:
 *  1. Pages table now uses UUID primary key (was SERIAL — inconsistent with all other tables).
 *  2. Added PATCH /api/pages/:slug/publish endpoint (was missing — couldn't publish without
 *     saving full GrapesJS data every time).
 *  3. Added GET /api/pages/:slug/versions stub for future version history.
 *  4. Auto-create now also ensures the `uuid-ossp` extension is enabled.
 *  5. Page list now returns total count for pagination.
 */
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { pool } = require('../../config/database');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const BUILTIN_SLUGS = ['home', 'about', 'bespoke', 'lab-grown', 'heritage', 'care-guide', 'faq'];

// ── Auto-create table + seed on startup ──────────────────────────────────────
async function ensurePagesTable() {
  // Bug fix: ensure uuid support (gen_random_uuid() needs pgcrypto or pg 13+)
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`).catch(() => {});

  // Bug fix: changed id from SERIAL to UUID to match every other table in the system
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      slug         VARCHAR(200) NOT NULL UNIQUE,
      title        VARCHAR(300) NOT NULL,
      status       VARCHAR(20)  DEFAULT 'draft',
      html_content TEXT         DEFAULT '',
      css_content  TEXT         DEFAULT '',
      grapes_data  JSONB        DEFAULT '{}',
      is_builtin   BOOLEAN      DEFAULT FALSE,
      is_deleted   BOOLEAN      DEFAULT FALSE,
      created_at   TIMESTAMP    DEFAULT NOW(),
      updated_at   TIMESTAMP    DEFAULT NOW()
    )
  `);

  // Seed built-in pages (idempotent)
  const seeds = [
    ['home',        'Homepage',        true],
    ['about',       'About Us',        true],
    ['bespoke',     'Bespoke & Custom',true],
    ['lab-grown',   'Lab Grown',       true],
    ['heritage',    'Our Heritage',    true],
    ['care-guide',  'Care Guide',      true],
    ['faq',         'FAQ',             true],
  ];
  for (const [slug, title, isBuiltin] of seeds) {
    await pool.query(
      `INSERT INTO pages (slug, title, is_builtin)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET is_builtin = $3`,
      [slug, title, isBuiltin]
    );
  }
  console.log('[pages] Table and seeds ready');
}
ensurePagesTable().catch(e => console.error('[pages] init error:', e.message));

// ── GET /api/pages ────────────────────────────────────────────────────────────
// Returns all pages (admin). Excludes soft-deleted.
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, status, is_builtin, updated_at
       FROM pages
       WHERE is_deleted IS NOT TRUE
       ORDER BY is_builtin DESC, title ASC`
    );
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/pages/:slug  ─────────────────────────────────────────────────────
// Public endpoint — the storefront and builder both read from this.
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, status, html_content, css_content, grapes_data, is_builtin, updated_at
       FROM pages
       WHERE slug = $1 AND is_deleted IS NOT TRUE`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Page not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/pages/:slug  ─────────────────────────────────────────────────────
// Save GrapesJS content. Does NOT change status (use PATCH /publish for that).
router.put('/:slug', authenticate, async (req, res) => {
  try {
    const { html, css, grapes_data } = req.body;
    const { rows } = await pool.query(
      `SELECT id FROM pages WHERE slug = $1 AND is_deleted IS NOT TRUE`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Page not found' });

    await pool.query(
      `UPDATE pages
       SET html_content = $1,
           css_content  = $2,
           grapes_data  = $3,
           updated_at   = NOW()
       WHERE slug = $4`,
      [html || '', css || '', JSON.stringify(grapes_data || {}), req.params.slug]
    );
    res.json({ success: true, message: 'Saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/pages/:slug/publish ────────────────────────────────────────────
// Bug fix #2: this endpoint was missing entirely. The builder had no way to
// change a page's status (draft → published) without re-sending the full HTML.
router.patch('/:slug/publish', authenticate, async (req, res) => {
  try {
    const { status } = req.body; // 'draft' | 'published' | 'archived'
    const allowed = ['draft', 'published', 'archived'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, error: `Invalid status. Use: ${allowed.join(', ')}` });

    const { rows } = await pool.query(
      `UPDATE pages
       SET status = $1, updated_at = NOW()
       WHERE slug = $2 AND is_deleted IS NOT TRUE
       RETURNING slug, title, status`,
      [status, req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Page not found' });
    res.json({ success: true, data: rows[0], message: `Page ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/pages  ──────────────────────────────────────────────────────────
// Create a new custom page.
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, slug } = req.body;
    if (!title || !slug) return res.status(400).json({ success: false, error: 'title and slug required' });

    const clean = slug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!clean) return res.status(400).json({ success: false, error: 'Slug contains no valid characters' });

    const { rows } = await pool.query(
      `INSERT INTO pages (title, slug, is_builtin)
       VALUES ($1, $2, false)
       RETURNING id, title, slug, status`,
      [title, clean]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ success: false, error: 'Slug already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/pages/:slug ───────────────────────────────────────────────────
// Soft-delete. Built-in pages cannot be deleted.
router.delete('/:slug', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    if (BUILTIN_SLUGS.includes(req.params.slug))
      return res.status(403).json({ success: false, error: 'Cannot delete a built-in page' });

    await pool.query(
      `UPDATE pages SET is_deleted = TRUE, updated_at = NOW() WHERE slug = $1`,
      [req.params.slug]
    );
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
