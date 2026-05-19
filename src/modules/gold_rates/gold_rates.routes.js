const router  = require('express').Router();
const db      = require('../../config/db.pool');
const { authenticate } = require('../../common/guards/auth.guard');
const { scrapeGoldRate } = require('../../services/goldRateScraper');

// GET current gold rate (public — storefront + admin)
router.get('/current', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM gold_rates WHERE is_active=true ORDER BY fetched_at DESC LIMIT 1'
    );
    if (!rows.length) return res.json({ success:true, data:null });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET rate history (last 30 days)
router.get('/history', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM gold_rate_history ORDER BY recorded_at DESC LIMIT 90`
    );
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST — manually set gold rate (admin override)
router.post('/manual', authenticate, async (req, res) => {
  try {
    const { rate_24k, rate_22k, rate_21k, rate_18k, rate_14k } = req.body;
    if (!rate_24k) return res.status(422).json({ success:false, message:'rate_24k required' });

    // Deactivate previous
    await db.query('UPDATE gold_rates SET is_active=false WHERE is_active=true');

    // Insert new
    const [rows] = await db.query(
      `INSERT INTO gold_rates (rate_24k, rate_22k, rate_21k, rate_18k, rate_14k, source)
       VALUES ($1, $2, $3, $4, $5, 'manual') RETURNING *`,
      [
        rate_24k,
        rate_22k || parseFloat((rate_24k * 22/24).toFixed(2)),
        rate_21k || parseFloat((rate_24k * 21/24).toFixed(2)),
        rate_18k || parseFloat((rate_24k * 18/24).toFixed(2)),
        rate_14k || parseFloat((rate_24k * 14/24).toFixed(2)),
      ]
    );

    // Save to history
    await db.query(
      `INSERT INTO gold_rate_history (rate_24k, rate_22k, rate_18k, source)
       VALUES ($1, $2, $3, 'manual')`,
      [rows[0].rate_24k, rows[0].rate_22k, rows[0].rate_18k]
    );

    res.json({ success:true, data:rows[0], message:'Gold rate updated manually' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST — scrape from web sources
router.post('/scrape', authenticate, async (req, res) => {
  try {
    const rates = await scrapeGoldRate();

    // Deactivate previous
    await db.query('UPDATE gold_rates SET is_active=false WHERE is_active=true');

    // Insert scraped rate
    const [rows] = await db.query(
      `INSERT INTO gold_rates (rate_24k, rate_22k, rate_21k, rate_18k, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [rates.rate_24k, rates.rate_22k, rates.rate_21k, rates.rate_18k, rates.source, rates.source_url||null]
    );

    // Save to history
    await db.query(
      `INSERT INTO gold_rate_history (rate_24k, rate_22k, rate_18k, source)
       VALUES ($1, $2, $3, $4)`,
      [rates.rate_24k, rates.rate_22k, rates.rate_18k, rates.source]
    );

    res.json({ success:true, data:rows[0], message:`Gold rate fetched from ${rates.source}` });
  } catch(e) { res.status(500).json({ success:false, message:`Scraping failed: ${e.message}` }); }
});

// GET role capabilities (dynamic — from DB)
router.get('/roles', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM role_capabilities ORDER BY sort_order ASC');
    res.json({ success:true, data:rows });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// PUT — update role capabilities (admin can edit role permissions)
router.put('/roles/:role', authenticate, async (req, res) => {
  try {
    const { capabilities } = req.body;
    const [rows] = await db.query(
      `UPDATE role_capabilities SET capabilities=$1::jsonb, updated_at=NOW()
       WHERE role=$2 RETURNING *`,
      [JSON.stringify(capabilities), req.params.role]
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Role not found' });
    res.json({ success:true, data:rows[0], message:'Role capabilities updated' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
