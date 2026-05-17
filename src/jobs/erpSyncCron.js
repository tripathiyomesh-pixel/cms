/**
 * ERP Sync Cron
 * Pulls updated products from Vantix ERP every X minutes
 * Only runs if ERP_SYNC_ENABLED=true and ERP_API_URL + ERP_API_KEY are set
 */
const { upsertProductFromERP } = require('../modules/erp_integration/erp.routes');
const db = require('../config/db.pool');

async function fetchFromERP() {
  const erpUrl  = process.env.ERP_API_URL;
  const apiKey  = process.env.ERP_API_KEY;
  const enabled = process.env.ERP_SYNC_ENABLED === 'true';

  if (!enabled || !erpUrl || !apiKey) return;

  try {
    // Get last successful pull timestamp
    const [lastSync] = await db.query(
      `SELECT created_at FROM erp_sync_log
       WHERE event_type='product_pull' AND status='success'
       ORDER BY created_at DESC LIMIT 1`
    );
    const since = lastSync[0]?.created_at
      ? new Date(lastSync[0].created_at).toISOString()
      : new Date(Date.now() - 24*60*60*1000).toISOString();

    let page=1, synced=0;
    while(true) {
      const url = `${erpUrl}/api/v1/public/products?updated_since=${encodeURIComponent(since)}&page=${page}&page_size=100`;
      const resp = await fetch(url, { headers:{'X-API-Key':apiKey,'Content-Type':'application/json'} });
      if (!resp.ok) { console.error(`ERP sync HTTP ${resp.status}`); break; }
      const data = await resp.json();
      const items = data.items || [];
      if (!items.length) break;
      for (const item of items) {
        try { await upsertProductFromERP(item); synced++; }
        catch(e) { console.error(`ERP sync item error [${item.code}]:`, e.message); }
      }
      if (items.length < 100) break;
      page++;
    }

    if (synced > 0) {
      await db.execute(
        `INSERT INTO erp_sync_log (event_type,direction,status,payload,response_data)
         VALUES ('product_pull','inbound','success',$1,$2)`,
        [JSON.stringify({since}), JSON.stringify({synced})]
      );
      console.log(`✅ ERP sync: ${synced} products updated`);
    }
  } catch(e) {
    console.error('ERP sync failed:', e.message);
  }
}

function startERPSyncCron() {
  const enabled  = process.env.ERP_SYNC_ENABLED === 'true';
  const interval = parseInt(process.env.ERP_SYNC_INTERVAL_MINUTES || '15') * 60 * 1000;
  if (!enabled) { console.log('ℹ️  ERP sync disabled (set ERP_SYNC_ENABLED=true to activate)'); return; }
  fetchFromERP(); // Run immediately
  setInterval(fetchFromERP, interval);
  console.log(`⏰ ERP sync cron started — every ${interval/60000} minutes`);
}

module.exports = { startERPSyncCron };
