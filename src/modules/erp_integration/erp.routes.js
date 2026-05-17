/**
 * Vantix ERP ↔ CMS Integration
 * 
 * INBOUND (ERP → CMS):
 *   POST /api/erp/webhook          — receive product/stock/price events
 *   POST /api/erp/sync/products    — manual full sync trigger
 * 
 * OUTBOUND (CMS → ERP):
 *   POST order to ERP on checkout
 *   POST customer to ERP on signup
 * 
 * PULL (CMS pulls from ERP on schedule):
 *   Cron: every 15 min → GET /api/v1/public/products?updated_since=...
 */

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db      = require('../../config/db.pool');
const { cache } = require('../../config/redis');

const ROLES = ['super_admin','admin','manager'];

// ─── HELPERS ─────────────────────────────────────────────────

// Verify HMAC-SHA256 signature from ERP webhook
function verifyWebhookSignature(payload, signature, secret) {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature.replace('sha256=',''), 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch { return false; }
}

// Log sync event
async function logSync(event_type, direction, status, payload, response_data, error_msg) {
  try {
    await db.execute(
      `INSERT INTO erp_sync_log (event_type, direction, status, payload, response_data, error_message)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [event_type, direction, status, JSON.stringify(payload||{}), JSON.stringify(response_data||{}), error_msg||null]
    );
  } catch(e) { console.error('Sync log error:', e.message); }
}

// Map ERP product_type to CMS inventory_type
const TYPE_MAP = {
  'JW':'JEWELLERY', 'CD':'NATURAL_DIAMOND', 'LD':'LAB_GROWN_DIAMOND',
  'GS':'GEMSTONE',  'PR':'PEARL',           'MT':'MOUNTING',
  'WT':'JEWELLERY', 'MG':'JEWELLERY',       'NI':'JEWELLERY',
};

// ─── WEBHOOK RECEIVER (ERP pushes to us) ─────────────────────
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-webhook-signature'] || '';
  const secret    = process.env.ERP_WEBHOOK_SECRET || '';

  // Verify signature
  if (secret && signature) {
    const valid = verifyWebhookSignature(req.body, signature, secret);
    if (!valid) {
      await logSync('webhook', 'inbound', 'failed', req.body, null, 'Invalid signature');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
  }

  const { event, data } = req.body;
  if (!event || !data) return res.status(422).json({ success: false, message: 'event and data required' });

  res.json({ success: true, message: 'Received' }); // Respond fast, process async

  // Process event
  try {
    switch(event) {

      case 'product.created':
      case 'product.updated': {
        await upsertProductFromERP(data);
        await logSync(event, 'inbound', 'success', data, { action: 'upserted' });
        break;
      }

      case 'product.deleted': {
        if (data.item_id || data.erp_id) {
          await db.query(
            `UPDATE products SET status='inactive', updated_at=NOW()
             WHERE erp_id=$1 OR sku=$2`,
            [data.item_id||data.erp_id, data.sku||'']
          );
        }
        await logSync(event, 'inbound', 'success', data, { action: 'deactivated' });
        break;
      }

      case 'stock.changed': {
        const { item_id, sku, new_qty, in_stock } = data;
        await db.query(
          `UPDATE products SET
             stock_quantity = $1,
             updated_at     = NOW()
           WHERE erp_id=$2 OR sku=$3`,
          [parseInt(new_qty)||0, item_id||'', sku||'']
        );
        // Also update diamond availability if it's a diamond
        if (typeof in_stock !== 'undefined') {
          await db.query(
            `UPDATE diamond_details SET is_available=$1
             WHERE product_id=(SELECT id FROM products WHERE erp_id=$2 OR sku=$3 LIMIT 1)`,
            [!!in_stock, item_id||'', sku||'']
          );
        }
        // Clear product cache
        await cache.del(`storefront:products:*`);
        await logSync(event, 'inbound', 'success', data, { qty: new_qty });
        break;
      }

      case 'price.changed': {
        const { item_id, sku, new_price, old_price, web_compare_price } = data;
        await db.query(
          `UPDATE products SET
             final_price   = $1,
             compare_price = COALESCE($2, compare_price),
             updated_at    = NOW()
           WHERE erp_id=$3 OR sku=$4`,
          [parseFloat(new_price)||0, web_compare_price ? parseFloat(web_compare_price) : null, item_id||'', sku||'']
        );
        await cache.del(`storefront:products:*`);
        await logSync(event, 'inbound', 'success', data, { old_price, new_price });
        break;
      }

      default:
        await logSync(event, 'inbound', 'unknown_event', data, null, `Unknown event: ${event}`);
    }
  } catch(e) {
    await logSync(event, 'inbound', 'error', req.body, null, e.message);
    console.error(`ERP webhook processing error [${event}]:`, e.message);
  }
});

// ─── UPSERT PRODUCT FROM ERP DATA ─────────────────────────────
async function upsertProductFromERP(data) {
  const inventoryType = TYPE_MAP[data.product_type] || 'JEWELLERY';
  const title    = data.ecom_title || data.name;
  const slug     = data.ecom_slug  || data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const price    = parseFloat(data.web_price    || data.sale_price)  || 0;
  const compare  = parseFloat(data.web_compare_price || data.tag_price) || null;
  const sku      = data.code || data.sku;
  const erp_id   = data.id;

  // Check if product exists
  const [existing] = await db.query(
    `SELECT id FROM products WHERE erp_id=$1 OR sku=$2 LIMIT 1`,
    [erp_id, sku]
  );

  let productId;

  if (existing.length) {
    productId = existing[0].id;
    await db.query(
      `UPDATE products SET
         name=$1, slug=$2, sku=$3, erp_id=$4,
         final_price=$5, compare_price=$6, currency=$7,
         description=$8, stock_quantity=$9,
         status=CASE WHEN $10 THEN 'active' ELSE 'inactive' END,
         is_new=$11, gender=$12, occasion=$13, style=$14,
         inventory_type=$15, updated_at=NOW()
       WHERE id=$16`,
      [title, slug, sku, erp_id, price, compare, data.currency||'AED',
       data.description_en||null, parseInt(data.stock_qty)||0,
       data.in_stock !== false, false, data.gender||null,
       data.occasion||null, data.style||null, inventoryType, productId]
    );
  } else {
    const [r] = await db.execute(
      `INSERT INTO products
         (name,slug,sku,erp_id,base_price,final_price,compare_price,currency,
          description,stock_quantity,status,inventory_type,gender,occasion,style,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',$11,$12,$13,$14,NULL) RETURNING id`,
      [title, slug, sku, erp_id, price, price, compare, data.currency||'AED',
       data.description_en||null, parseInt(data.stock_qty)||0,
       inventoryType, data.gender||null, data.occasion||null, data.style||null]
    );
    productId = r[0]?.id || r.rows?.[0]?.id;
  }

  if (!productId) throw new Error('Failed to get product ID after upsert');

  // Handle hero image + gallery
  if (data.hero_image) {
    await db.query(
      `INSERT INTO media (product_id, file_url, is_primary, source)
       VALUES ($1,$2,true,'erp')
       ON CONFLICT (product_id, file_url) DO NOTHING`,
      [productId, data.hero_image]
    );
  }
  if (Array.isArray(data.images)) {
    for (const img of data.images) {
      await db.execute(
        `INSERT INTO media (product_id, file_url, thumb_url, is_primary, alt_text, source)
         VALUES ($1,$2,$2,$3,$4,'erp')
         ON CONFLICT (product_id, file_url) DO NOTHING`,
        [productId, img.url||img.file_url, !!img.is_primary, img.caption||img.alt_text||null]
      );
    }
  }

  // Diamond-specific fields
  if (['NATURAL_DIAMOND','LAB_GROWN_DIAMOND'].includes(inventoryType) && data.stone_carat) {
    const diamondType = inventoryType==='LAB_GROWN_DIAMOND' ? 'LAB_GROWN' : 'NATURAL';
    const [dd] = await db.query('SELECT id FROM diamond_details WHERE product_id=$1',[productId]);
    if (dd.length) {
      await db.query(
        `UPDATE diamond_details SET
           carat=$1,color=$2,clarity=$3,primary_cert_lab=$4,primary_cert_no=$5,
           is_available=$6,updated_at=NOW()
         WHERE product_id=$7`,
        [data.stone_carat,data.stone_color,data.stone_clarity,data.cert_lab,data.cert_number,
         data.in_stock!==false, productId]
      );
    } else {
      await db.execute(
        `INSERT INTO diamond_details (product_id,diamond_type,carat,color,clarity,primary_cert_lab,primary_cert_no,is_available)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [productId,diamondType,data.stone_carat,data.stone_color,data.stone_clarity,
         data.cert_lab,data.cert_number,data.in_stock!==false]
      );
    }
  }

  // Jewellery specs
  if (inventoryType==='JEWELLERY') {
    await db.execute(
      `INSERT INTO jewellery_specs (product_id,metal_type,purity,gross_weight,net_weight)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (product_id) DO UPDATE SET
         metal_type=$2,purity=$3,gross_weight=$4,net_weight=$5`,
      [productId, data.metal_type,data.metal_purity,data.gross_weight,data.net_weight]
    ).catch(()=>{}); // Table may not exist yet
  }

  // Clear all product caches
  await cache.del('storefront:store');
  return productId;
}

// ─── SCHEDULED PULL (CMS pulls from ERP) ─────────────────────
router.post('/sync/pull', authenticate, authorize(ROLES), async (req, res) => {
  const erpUrl = process.env.ERP_API_URL;
  const apiKey = process.env.ERP_API_KEY;
  if (!erpUrl || !apiKey) return res.status(503).json({ success:false, message:'ERP_API_URL and ERP_API_KEY not configured' });

  try {
    // Get last sync time
    const [lastSync] = await db.query(
      `SELECT created_at FROM erp_sync_log WHERE event_type='product_pull' AND status='success' ORDER BY created_at DESC LIMIT 1`
    );
    const updatedSince = lastSync[0]?.created_at ? new Date(lastSync[0].created_at).toISOString() : '2020-01-01T00:00:00Z';

    let page=1, total_synced=0, errors=[];
    const pageSize = 100;

    while(true) {
      const url = `${erpUrl}/api/v1/public/products?updated_since=${encodeURIComponent(updatedSince)}&page=${page}&page_size=${pageSize}&in_stock=false`;
      const resp = await fetch(url, {
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' }
      });
      if (!resp.ok) throw new Error(`ERP API error ${resp.status}`);
      const data = await resp.json();
      const items = data.items || [];
      if (!items.length) break;

      for (const item of items) {
        try {
          await upsertProductFromERP(item);
          total_synced++;
        } catch(e) {
          errors.push({ sku: item.code, error: e.message });
        }
      }

      if (items.length < pageSize) break;
      page++;
    }

    await logSync('product_pull','inbound','success',{ updated_since:updatedSince },{ total_synced, errors: errors.length });
    res.json({ success:true, data:{ synced:total_synced, errors } });
  } catch(e) {
    await logSync('product_pull','inbound','error',{},null,e.message);
    res.status(500).json({ success:false, message:e.message });
  }
});

// ─── PUSH ORDER TO ERP ─────────────────────────────────────────
async function pushOrderToERP(order) {
  const erpUrl = process.env.ERP_API_URL;
  const apiKey = process.env.ERP_API_KEY;
  if (!erpUrl || !apiKey) { console.log('ERP not configured — order not pushed'); return null; }

  try {
    const resp = await fetch(`${erpUrl}/api/v1/public/orders`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await resp.json();
    await logSync('order_push','outbound',resp.ok?'success':'error',order,data);
    return resp.ok ? data : null;
  } catch(e) {
    await logSync('order_push','outbound','error',order,null,e.message);
    return null;
  }
}

// ─── SYNC STATUS (admin) ──────────────────────────────────────
router.get('/status', authenticate, async (req, res) => {
  try {
    const erpUrl = process.env.ERP_API_URL;
    const apiKey = process.env.ERP_API_KEY;

    // Test ERP connection
    let erpOnline = false;
    if (erpUrl && apiKey) {
      try {
        const r = await fetch(`${erpUrl}/api/v1/public/metal-rates`, {
          headers:{'X-API-Key':apiKey}, signal: AbortSignal.timeout(5000)
        });
        erpOnline = r.ok;
      } catch {}
    }

    const [recentLogs] = await db.query(
      `SELECT event_type,direction,status,created_at,error_message
       FROM erp_sync_log ORDER BY created_at DESC LIMIT 20`
    );
    const [stats] = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status='success') as success,
         COUNT(*) FILTER (WHERE status='error' OR status='failed') as errors,
         COUNT(*) FILTER (WHERE created_at>=NOW()-INTERVAL '24 hours') as last_24h
       FROM erp_sync_log`
    );
    const [erpProducts] = await db.query(
      `SELECT COUNT(*) as total FROM products WHERE erp_id IS NOT NULL`
    );

    res.json({ success:true, data:{
      configured:  !!(erpUrl && apiKey),
      erp_online:  erpOnline,
      erp_url:     erpUrl ? erpUrl.replace(/\/api.*$/,'') : null,
      stats:       stats[0],
      erp_products:+erpProducts[0]?.total || 0,
      recent_logs: recentLogs,
    }});
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── SYNC LOG (admin) ─────────────────────────────────────────
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { page=1, limit=50, status, event_type } = req.query;
    const params=[]; let where='WHERE 1=1';
    if(status)     { params.push(status);     where+=` AND status=$${params.length}`; }
    if(event_type) { params.push(event_type); where+=` AND event_type=$${params.length}`; }
    const qp=[...params,+limit,(page-1)*+limit];
    const [rows] = await db.query(
      `SELECT id,event_type,direction,status,error_message,created_at
       FROM erp_sync_log ${where} ORDER BY created_at DESC LIMIT $${qp.length-1} OFFSET $${qp.length}`,
      qp
    );
    const [cnt] = await db.query(`SELECT COUNT(*) as total FROM erp_sync_log ${where}`,params);
    res.json({ success:true, data:rows, total:+cnt[0]?.total||0 });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── MANUAL FULL SYNC TRIGGER (admin) ─────────────────────────
router.post('/sync/full', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  res.json({ success:true, message:'Full sync started in background' });
  // Run async
  setTimeout(async () => {
    try {
      const erpUrl = process.env.ERP_API_URL;
      const apiKey = process.env.ERP_API_KEY;
      if (!erpUrl || !apiKey) return;
      let page=1, total=0;
      while(true) {
        const resp = await fetch(`${erpUrl}/api/v1/public/products?page=${page}&page_size=100`, {
          headers:{'X-API-Key':apiKey}
        });
        if (!resp.ok) break;
        const data = await resp.json();
        const items = data.items||[];
        if (!items.length) break;
        for (const item of items) {
          try { await upsertProductFromERP(item); total++; }
          catch(e) { console.error('Sync item error:', e.message); }
        }
        if (items.length < 100) break;
        page++;
      }
      await logSync('full_sync','inbound','success',{},{total_synced:total});
      console.log(`✅ ERP full sync complete — ${total} products`);
    } catch(e) {
      await logSync('full_sync','inbound','error',{},null,e.message);
    }
  }, 100);
});

module.exports = { router, pushOrderToERP, upsertProductFromERP };
