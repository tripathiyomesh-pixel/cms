/**
 * Gold Rate Auto-Fetch Cron
 * Runs every hour — stores rates in metal_rates table
 * Requires env: GOLD_API_KEY (goldapi.io free tier)
 */
const db = require('../config/db.pool');

const METALS = [
  { metal:'gold', purity:'24K', factor:1.0 },
  { metal:'gold', purity:'22K', factor:22/24 },
  { metal:'gold', purity:'18K', factor:18/24 },
  { metal:'gold', purity:'14K', factor:14/24 },
];
const USD_TO_AED = 3.6725;

async function fetchGoldRate() {
  try {
    const apiKey = process.env.GOLD_API_KEY;
    if (!apiKey) return; // Silent if not configured — manual entry still works

    const res  = await fetch('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const price24k = parseFloat(data.price_gram_24k);
    if (!price24k) throw new Error('Invalid API response');

    for (const m of METALS) {
      const rateUsd = (price24k * m.factor).toFixed(4);
      const rateAed = (price24k * m.factor * USD_TO_AED).toFixed(4);
      await db.execute(
        `INSERT INTO metal_rates (metal,purity,rate_per_gram,currency,source,fetched_at)
         VALUES ($1,$2,$3,'USD','goldapi.io',NOW())
         ON CONFLICT (metal,purity)
         DO UPDATE SET rate_per_gram=$3,source='goldapi.io',fetched_at=NOW(),updated_at=NOW()`,
        [m.metal, m.purity, rateUsd]
      );
    }
    console.log(`✅ Gold rates updated — 24K: $${price24k.toFixed(2)}/g USD | AED ${(price24k*USD_TO_AED).toFixed(2)}/g`);
  } catch(e) {
    console.error('❌ Gold rate fetch failed:', e.message);
  }
}

function startGoldRateCron() {
  fetchGoldRate(); // Immediate on startup
  setInterval(fetchGoldRate, 60*60*1000); // Every hour
  console.log('⏰ Gold rate cron: every hour (set GOLD_API_KEY env to activate)');
}

module.exports = { startGoldRateCron, fetchGoldRate };
