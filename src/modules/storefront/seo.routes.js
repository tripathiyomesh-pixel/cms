const express = require('express');
const router  = express.Router();
const db = require('../../config/db.pool');

const getBaseUrl = (req) => {
  const setting = process.env.STORE_URL || `${req.protocol}://${req.get('host').replace('4000','3001')}`;
  return setting;
};

// ─── SITEMAP.XML ───────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = getBaseUrl(req);

    const [products] = await db.query(
      `SELECT slug, updated_at FROM products WHERE deleted_at IS NULL AND status='active' ORDER BY updated_at DESC LIMIT 5000`
    );
    const [blogs] = await db.query(
      `SELECT slug, updated_at FROM blog_posts WHERE status='published' ORDER BY published_at DESC`
    );
    const [categories] = await db.query('SELECT slug, updated_at FROM categories WHERE is_active=true');
    const [collections] = await db.query('SELECT slug, updated_at FROM collections WHERE is_active=true');

    const staticPages = [
      { url:'/', priority:'1.0', freq:'daily' },
      { url:'/diamonds', priority:'0.9', freq:'daily' },
      { url:'/gemstones', priority:'0.9', freq:'daily' },
      { url:'/pearls', priority:'0.8', freq:'weekly' },
      { url:'/mountings', priority:'0.8', freq:'weekly' },
      { url:'/jewellery', priority:'0.9', freq:'daily' },
      { url:'/custom', priority:'0.8', freq:'monthly' },
      { url:'/appointment', priority:'0.7', freq:'monthly' },
      { url:'/verify', priority:'0.6', freq:'monthly' },
      { url:'/blog', priority:'0.7', freq:'daily' },
      { url:'/about', priority:'0.5', freq:'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (const p of staticPages) {
      xml += `  <url><loc>${base}${p.url}</loc><priority>${p.priority}</priority><changefreq>${p.freq}</changefreq></url>\n`;
    }
    for (const p of products) {
      const type = 'jewellery';
      xml += `  <url><loc>${base}/${type}/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.8</priority><changefreq>weekly</changefreq></url>\n`;
    }
    for (const b of blogs) {
      xml += `  <url><loc>${base}/blog/${b.slug}</loc><lastmod>${new Date(b.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.6</priority><changefreq>monthly</changefreq></url>\n`;
    }
    for (const c of categories) {
      xml += `  <url><loc>${base}/jewellery?category=${c.slug}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>\n`;
    }

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ROBOTS.TXT ───────────────────────────────────────────────
router.get('/robots.txt', (req, res) => {
  const base = getBaseUrl(req);
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /account

Sitemap: ${base}/sitemap.xml
`);
});

// ─── SCHEMA.ORG JSON-LD for products ──────────────────────────
router.get('/schema/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const base = getBaseUrl(req);

    const [rows] = await db.query(
      `SELECT p.*, m.file_url as thumb_url FROM products p
       LEFT JOIN media m ON m.product_id = p.id AND m.is_primary = true
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false });
    const p = rows[0];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description || p.name,
      sku: p.sku,
      url: `${base}/${type}/${p.slug || p.id}`,
      image: p.thumb_url || '',
      offers: {
        '@type': 'Offer',
        price: p.final_price,
        priceCurrency: p.currency || 'AED',
        availability: p.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };

    res.json(schema);
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
