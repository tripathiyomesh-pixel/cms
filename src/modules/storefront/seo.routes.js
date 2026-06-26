/**
 * VANTIX-CMS — SEO Routes
 *
 * Phase 1 additions:
 *  - /api/seo/redirects  — redirect manager (GET/POST/DELETE)
 *  - /api/seo/audit/:slug — basic page SEO score
 *  - /api/seo/robots     — manage robots.txt content via settings
 *  - /api/seo/test-email — test SMTP connection
 *  - sitemap.xml — existing, unchanged
 *  - robots.txt  — now reads from settings table instead of being static
 */
const express  = require('express');
const router   = express.Router();
const db       = require('../../config/db.pool');
const { pool } = require('../../config/database');
const { authenticate, authorize } = require('../../common/guards/auth.guard');

const ADMIN_ROLES = ['super_admin', 'admin', 'manager'];

// ── Ensure redirects table exists ─────────────────────────────────────────────
async function ensureRedirectsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS seo_redirects (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      from_path   VARCHAR(500) NOT NULL UNIQUE,
      to_path     VARCHAR(500) NOT NULL,
      type        SMALLINT    NOT NULL DEFAULT 301 CHECK (type IN (301,302)),
      is_active   BOOLEAN     DEFAULT TRUE,
      hit_count   INTEGER     DEFAULT 0,
      created_at  TIMESTAMP   DEFAULT NOW(),
      updated_at  TIMESTAMP   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_seo_redirects_from ON seo_redirects(from_path) WHERE is_active = TRUE;
  `);
}
ensureRedirectsTable().catch(e => console.error('[seo] redirects table init error:', e.message));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getBaseUrl = (req) =>
  process.env.STORE_URL || `${req.protocol}://${req.get('host').replace(':4000', ':3001')}`;

// ─────────────────────────────────────────────────────────────────────────────
// SITEMAP.XML
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req);

    const [products]    = await db.query(`SELECT slug, updated_at FROM products WHERE deleted_at IS NULL AND status='active' ORDER BY updated_at DESC LIMIT 5000`);
    const [blogs]       = await db.query(`SELECT slug, updated_at FROM blog_posts WHERE status='published' ORDER BY published_at DESC`);
    const [categories]  = await db.query(`SELECT slug, updated_at FROM categories WHERE is_active=true`);
    const [collections] = await db.query(`SELECT slug, updated_at FROM collections WHERE is_active=true`);
    const [pages]       = await db.query(`SELECT slug, updated_at FROM pages WHERE status='published' AND is_deleted IS NOT TRUE`).catch(() => [[]]);

    const staticPages = [
      { url: '/',            priority: '1.0', freq: 'daily'   },
      { url: '/jewellery',   priority: '0.9', freq: 'daily'   },
      { url: '/diamonds',    priority: '0.9', freq: 'daily'   },
      { url: '/gemstones',   priority: '0.9', freq: 'daily'   },
      { url: '/pearls',      priority: '0.8', freq: 'weekly'  },
      { url: '/mountings',   priority: '0.8', freq: 'weekly'  },
      { url: '/custom',      priority: '0.8', freq: 'monthly' },
      { url: '/appointment', priority: '0.7', freq: 'monthly' },
      { url: '/verify',      priority: '0.6', freq: 'monthly' },
      { url: '/blog',        priority: '0.7', freq: 'daily'   },
      { url: '/about',       priority: '0.5', freq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const p of staticPages) {
      xml += `  <url><loc>${base}${p.url}</loc><priority>${p.priority}</priority><changefreq>${p.freq}</changefreq></url>\n`;
    }
    for (const p of products) {
      xml += `  <url><loc>${base}/jewellery/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.8</priority><changefreq>weekly</changefreq></url>\n`;
    }
    for (const b of blogs) {
      xml += `  <url><loc>${base}/blog/${b.slug}</loc><lastmod>${new Date(b.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.6</priority><changefreq>monthly</changefreq></url>\n`;
    }
    for (const c of categories) {
      xml += `  <url><loc>${base}/jewellery?category=${c.slug}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>\n`;
    }
    for (const p of pages) {
      xml += `  <url><loc>${base}/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.5</priority><changefreq>monthly</changefreq></url>\n`;
    }

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROBOTS.TXT — reads from settings table (admin-configurable)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/robots.txt', async (req, res) => {
  try {
    const base = getBaseUrl(req);
    // Check if admin has customised robots.txt
    const [rows] = await db.query(
      `SELECT value FROM settings WHERE key='robots_txt_content' LIMIT 1`
    ).catch(() => [[]]);

    if (rows[0]?.value) {
      const content = typeof rows[0].value === 'string'
        ? rows[0].value.replace(/^"|"$/g, '') // strip JSON string quotes
        : rows[0].value;
      res.setHeader('Content-Type', 'text/plain');
      return res.send(content);
    }

    // Default robots.txt
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login

Sitemap: ${base}/sitemap.xml`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROBOTS.TXT — Update via admin
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/seo/robots — returns robots.txt content as JSON (admin)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/robots', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT value FROM settings WHERE key='robots_txt_content' LIMIT 1`).catch(() => [[]]);
    const base = getBaseUrl(req);
    const defaultContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml`;
    const content = rows[0]?.value
      ? (typeof rows[0].value === 'string' ? rows[0].value.replace(/^"|"$/g, '') : rows[0].value)
      : defaultContent;
    res.json({ success: true, data: { content } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/robots', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(422).json({ success: false, message: 'content required' });
    await pool.query(
      `INSERT INTO settings (key, value, group_name, type, is_public)
       VALUES ('robots_txt_content', $1::jsonb, 'seo', 'text', false)
       ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify(content)]
    ).catch(() => {
      // settings table may not have updated_at — try simpler upsert
      return pool.query(
        `INSERT INTO settings (key, value, group_name, type, is_public)
         VALUES ('robots_txt_content', $1::jsonb, 'seo', 'text', false)
         ON CONFLICT (key) DO UPDATE SET value = $1::jsonb`,
        [JSON.stringify(content)]
      );
    });
    res.json({ success: true, message: 'robots.txt updated' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEO AUDIT — basic on-page SEO score for a page/product
// ─────────────────────────────────────────────────────────────────────────────
router.get('/audit/:type/:slug', authenticate, async (req, res) => {
  try {
    const { type, slug } = req.params;
    let record = null;

    if (type === 'page') {
      const [rows] = await db.query(`SELECT title, html_content, grapes_data FROM pages WHERE slug=$1 AND is_deleted IS NOT TRUE`, [slug]);
      record = rows[0];
    } else if (type === 'product') {
      const [rows] = await db.query(`SELECT name as title, description, seo_title, seo_description FROM products WHERE slug=$1 AND deleted_at IS NULL`, [slug]);
      record = rows[0];
    } else if (type === 'blog') {
      const [rows] = await db.query(`SELECT title, content, seo_title, seo_description, excerpt FROM blog_posts WHERE slug=$1`, [slug]);
      record = rows[0];
    }

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    // ── Scoring ────────────────────────────────────────────────────────────
    const issues   = [];
    const warnings = [];
    const passes   = [];
    let score      = 100;

    const title = record.seo_title || record.title || record.name || '';
    const desc  = record.seo_description || record.description || record.excerpt || '';

    // Title checks
    if (!title) {
      issues.push({ check: 'Title', message: 'Missing SEO title or page title', impact: 'high' });
      score -= 20;
    } else if (title.length < 30) {
      warnings.push({ check: 'Title length', message: `Title is ${title.length} chars — aim for 50–60`, impact: 'medium' });
      score -= 8;
    } else if (title.length > 65) {
      warnings.push({ check: 'Title length', message: `Title is ${title.length} chars — keep under 65`, impact: 'medium' });
      score -= 8;
    } else {
      passes.push({ check: 'Title', message: `Title length is good (${title.length} chars)` });
    }

    // Meta description checks
    if (!desc) {
      issues.push({ check: 'Meta description', message: 'Missing meta description', impact: 'high' });
      score -= 15;
    } else if (desc.length < 100) {
      warnings.push({ check: 'Meta description', message: `Description is ${desc.length} chars — aim for 150–160`, impact: 'medium' });
      score -= 5;
    } else if (desc.length > 165) {
      warnings.push({ check: 'Meta description', message: `Description is ${desc.length} chars — keep under 165`, impact: 'low' });
      score -= 3;
    } else {
      passes.push({ check: 'Meta description', message: `Description length is good (${desc.length} chars)` });
    }

    // Content checks (for pages/blogs)
    const contentText = record.html_content || record.content || '';
    const wordCount   = contentText.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

    if (type !== 'product') {
      if (wordCount < 100) {
        issues.push({ check: 'Content length', message: `Only ${wordCount} words — aim for 300+ for good rankings`, impact: 'high' });
        score -= 15;
      } else if (wordCount < 300) {
        warnings.push({ check: 'Content length', message: `${wordCount} words — aim for 500+`, impact: 'medium' });
        score -= 5;
      } else {
        passes.push({ check: 'Content length', message: `Good content length (${wordCount} words)` });
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';

    res.json({
      success: true,
      data: {
        slug, type, score, grade,
        summary: { issues: issues.length, warnings: warnings.length, passes: passes.length },
        issues, warnings, passes,
        meta: { title, description: desc, wordCount },
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REDIRECT MANAGER
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/seo/redirects — list all redirects
router.get('/redirects', authenticate, async (req, res) => {
  try {
    const { search, type } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (search) { params.push(`%${search}%`); where += ` AND (from_path ILIKE $${params.length} OR to_path ILIKE $${params.length})`; }
    if (type)   { params.push(parseInt(type));  where += ` AND type = $${params.length}`; }

    const { rows } = await pool.query(
      `SELECT id, from_path, to_path, type, is_active, hit_count, created_at
       FROM seo_redirects ${where} ORDER BY created_at DESC LIMIT 500`,
      params
    );
    res.json({ success: true, data: rows, total: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/seo/redirects — create a redirect
router.post('/redirects', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const { from_path, to_path, type = 301 } = req.body;
    if (!from_path || !to_path) return res.status(422).json({ success: false, message: 'from_path and to_path required' });
    if (![301, 302].includes(Number(type))) return res.status(422).json({ success: false, message: 'type must be 301 or 302' });
    if (from_path === to_path) return res.status(422).json({ success: false, message: 'from_path and to_path cannot be the same' });

    const { rows } = await pool.query(
      `INSERT INTO seo_redirects (from_path, to_path, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (from_path) DO UPDATE SET to_path=$2, type=$3, updated_at=NOW()
       RETURNING *`,
      [from_path, to_path, Number(type)]
    );
    res.status(201).json({ success: true, data: rows[0], message: 'Redirect created' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/seo/redirects/:id — toggle active / update
router.patch('/redirects/:id', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const { is_active, to_path, type } = req.body;
    const updates = [];
    const vals    = [];

    if (is_active !== undefined) { vals.push(is_active); updates.push(`is_active=$${vals.length}`); }
    if (to_path)                 { vals.push(to_path);   updates.push(`to_path=$${vals.length}`);   }
    if (type)                    { vals.push(type);       updates.push(`type=$${vals.length}`);      }

    if (!updates.length) return res.json({ success: true, message: 'Nothing to update' });

    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE seo_redirects SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Redirect not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/seo/redirects/:id
router.delete('/redirects/:id', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    await pool.query(`DELETE FROM seo_redirects WHERE id=$1`, [req.params.id]);
    res.json({ success: true, message: 'Redirect deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST EMAIL — for the settings page SMTP test button
// ─────────────────────────────────────────────────────────────────────────────
router.post('/test-email', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const emailService = require('../../services/email.service');
    const { to } = req.body;
    if (!to) return res.status(422).json({ success: false, message: 'to email required' });

    const result = await emailService.sendRaw({
      to,
      subject: `Test Email from ${process.env.APP_NAME || 'VantixCMS'}`,
      html: `<p>This is a test email from your VantixCMS installation. SMTP is configured correctly! ✅</p>`,
      text: 'This is a test email from VantixCMS. SMTP is configured correctly!',
    });

    if (result.devMode) {
      return res.json({ success: true, message: 'Dev mode: email logged to console (SMTP not configured)', devMode: true });
    }
    res.json({ success: true, message: `Test email sent to ${to}`, messageId: result.messageId });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Email failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SMTP VERIFY — test connection without sending
// ─────────────────────────────────────────────────────────────────────────────
router.get('/smtp-status', authenticate, authorize(ADMIN_ROLES), async (req, res) => {
  try {
    const emailService = require('../../services/email.service');
    const result = await emailService.verify();
    res.json({ success: result.ok, message: result.message });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

