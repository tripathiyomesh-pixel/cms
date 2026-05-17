/**
 * RapNet Instant Inventory Integration
 * Proxies requests to RapNet API — diamonds are NEVER stored in our DB
 * Requires: RAPNET_TOKEN env var (Bearer token from RapNet account)
 * Docs: https://raptech.rapaport.com/instant-inventory/
 *
 * IMPORTANT: Per RapNet terms, diamonds must NOT be downloaded or saved to local DB
 */
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../common/guards/auth.guard');

const RAPNET_API = 'https://technet.rapnetapis.com/instant-inventory/api';

const getRapnetToken = async () => {
  // Token can be stored as env var OR fetched via RapNet login API
  const token = process.env.RAPNET_TOKEN;
  if (!token) throw new Error('RAPNET_TOKEN env var not set. Get your token from RapNet account settings.');
  return token;
};

const rapnetHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ─── SEARCH DIAMONDS (live from RapNet) ───────────────────────
// GET /api/rapnet/diamonds?shape=Round&carat_min=0.5&color_from=D&clarity_from=VS1&page=1
router.get('/diamonds', async (req, res) => {
  try {
    const token = await getRapnetToken();
    const {
      shapes, color_from='D', color_to='M', clarity_from='IF', clarity_to='I3',
      size_from='0.20', size_to='30', cut_from, cut_to,
      price_total_from, price_total_to,
      labs, fluorescence_intensities,
      has_image, has_video,
      sort_by='Price', sort_direction='Asc',
      page_number='1', page_size='20',
      search_type='White'
    } = req.query;

    const body = {
      request: { body: {
        search_type,
        shapes:   shapes ? (Array.isArray(shapes) ? shapes : shapes.split(',')) : undefined,
        color_from, color_to,
        clarity_from, clarity_to,
        size_from: String(size_from),
        size_to:   String(size_to),
        cut_from,  cut_to,
        price_total_from: price_total_from ? String(price_total_from) : undefined,
        price_total_to:   price_total_to   ? String(price_total_to)   : undefined,
        labs: labs ? (Array.isArray(labs) ? labs : labs.split(',')) : ['GIA','IGI'],
        fluorescence_intensities: fluorescence_intensities ? fluorescence_intensities.split(',') : undefined,
        hasImage: has_image === 'true' ? true : undefined,
        hasVideo: has_video === 'true' ? true : undefined,
        sort_by, sort_direction,
        page_number: String(page_number),
        page_size:  String(page_size),
      }}
    };

    // Remove undefined keys
    const cleanBody = JSON.parse(JSON.stringify(body));

    const rapRes = await fetch(`${RAPNET_API}/Diamonds`, {
      method:  'POST',
      headers: rapnetHeaders(token),
      body:    JSON.stringify(cleanBody),
    });

    if (!rapRes.ok) {
      const err = await rapRes.text();
      return res.status(rapRes.status).json({ success: false, message: `RapNet API error: ${err}` });
    }

    const data = await rapRes.json();
    if (data?.response?.header?.error_code !== 0) {
      return res.status(400).json({ success: false, message: data?.response?.header?.error_message || 'RapNet error' });
    }

    const results = data?.response?.body;
    const markup  = parseFloat(process.env.RAPNET_MARKUP_PCT || '5') / 100; // default 5% markup

    // Apply markup to prices, add source flag
    const diamonds = (results?.diamonds || []).map(d => ({
      ...d,
      source:         'rapnet',
      original_price: d.price_total,
      final_price:    d.price_total ? +(d.price_total * (1 + markup)).toFixed(2) : null,
      currency:       'USD',
      // DO NOT store — display only
    }));

    res.json({
      success: true,
      data: {
        diamonds,
        total:         results?.search_results?.total_diamonds_found || 0,
        returned:      results?.search_results?.diamonds_returned || 0,
        page:          +page_number,
        source:        'rapnet_instant_inventory',
        note:          'Live feed from RapNet. Stones not stored in local database.',
      }
    });
  } catch (e) {
    if (e.message.includes('RAPNET_TOKEN')) {
      return res.status(503).json({ success: false, message: e.message, code: 'RAPNET_NOT_CONFIGURED' });
    }
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── GET SINGLE DIAMOND (live from RapNet) ───────────────────
router.get('/diamonds/:diamond_id', async (req, res) => {
  try {
    const token = await getRapnetToken();
    const rapRes = await fetch(`${RAPNET_API}/SingleDiamond`, {
      method:  'POST',
      headers: rapnetHeaders(token),
      body:    JSON.stringify({ request: { body: { diamond_id: +req.params.diamond_id } } }),
    });
    if (!rapRes.ok) return res.status(rapRes.status).json({ success: false, message: 'RapNet API error' });
    const data = await rapRes.json();
    const diamond = data?.response?.body?.diamond;
    if (!diamond) return res.status(404).json({ success: false, message: 'Diamond not found on RapNet' });

    const markup = parseFloat(process.env.RAPNET_MARKUP_PCT || '5') / 100;
    res.json({ success: true, data: { ...diamond, source: 'rapnet', final_price: +(diamond.price_total*(1+markup)).toFixed(2), currency: 'USD' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── CERTIFICATE DOWNLOAD URL ─────────────────────────────────
// RapNet provides cert download for their diamonds
router.get('/diamonds/:diamond_id/certificate', async (req, res) => {
  const certUrl = `https://www.diamondselections.com/GetCertificate.aspx?diamondid=${req.params.diamond_id}`;
  res.json({ success: true, data: { cert_url: certUrl } });
});

// ─── PRICE LIST (Rapaport price list — requires subscription) ─
router.get('/price-list', authenticate, async (req, res) => {
  try {
    const token = await getRapnetToken();
    const { shape = 'Round', color, clarity } = req.query;

    const rapRes = await fetch('https://technet.rapnetapis.com/pricelist/api/Prices', {
      method:  'POST',
      headers: rapnetHeaders(token),
      body:    JSON.stringify({ request: { body: { shape, color, clarity } } }),
    });
    if (!rapRes.ok) return res.status(rapRes.status).json({ success: false, message: 'RapNet price list error' });
    const data = await rapRes.json();
    res.json({ success: true, data: data?.response?.body });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── STATUS CHECK ──────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const token = process.env.RAPNET_TOKEN;
  res.json({
    success: true,
    data: {
      configured:    !!token,
      token_set:     !!token,
      markup_pct:    parseFloat(process.env.RAPNET_MARKUP_PCT || '5'),
      api_endpoint:  RAPNET_API,
      note:          token ? 'RapNet connected' : 'Set RAPNET_TOKEN env var to activate',
      docs:          'https://raptech.rapaport.com/instant-inventory/',
    }
  });
});

module.exports = router;
