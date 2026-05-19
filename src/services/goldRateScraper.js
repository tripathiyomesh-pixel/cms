/**
 * Gold Rate Scraper — Dubai retail rates
 * 
 * Sources (in priority order):
 * 1. dubaicityofgold.com (DJG official — 3x daily)
 * 2. goldratetodaydubai.com (backup)
 * 3. Manual fallback (admin-set rate)
 * 
 * DJG publishes at: 9:00AM, 1:30PM, 6:00PM UAE time
 */

const https = require('https');
const http  = require('http');

function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Parse DJG / Dubai City of Gold rate page
async function scrapedubaicityofgold() {
  const html = await fetchUrl('https://dubaicityofgold.com/dubai-gold-rate-today/');
  
  // Pattern: prices in AED per gram
  const patterns = {
    rate_24k: /24[Kk].*?(\d{3,4}(?:\.\d{1,2})?)/,
    rate_22k: /22[Kk].*?(\d{3,4}(?:\.\d{1,2})?)/,
    rate_21k: /21[Kk].*?(\d{3,4}(?:\.\d{1,2})?)/,
    rate_18k: /18[Kk].*?(\d{3,4}(?:\.\d{1,2})?)/,
  };

  const rates = {};
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern);
    if (match) rates[key] = parseFloat(match[1]);
  }

  if (!rates.rate_24k || rates.rate_24k < 400 || rates.rate_24k > 1000) {
    throw new Error('Invalid rates from dubaicityofgold');
  }

  // Derive missing rates if needed
  if (!rates.rate_22k) rates.rate_22k = parseFloat((rates.rate_24k * (22/24)).toFixed(2));
  if (!rates.rate_18k) rates.rate_18k = parseFloat((rates.rate_24k * (18/24)).toFixed(2));
  if (!rates.rate_21k) rates.rate_21k = parseFloat((rates.rate_24k * (21/24)).toFixed(2));

  return { ...rates, source: 'dubaicityofgold.com' };
}

// Backup: goldratetodaydubai.com
async function scrapeGoldRateToday() {
  const html = await fetchUrl('https://goldratetodaydubai.com/');
  
  // Look for AED rates in JSON-LD or page content
  const k24 = html.match(/24[Kk][^0-9]*(\d{3,4}(?:\.\d{1,2})?)\s*(?:AED|aed)/i);
  const k22 = html.match(/22[Kk][^0-9]*(\d{3,4}(?:\.\d{1,2})?)\s*(?:AED|aed)/i);
  const k18 = html.match(/18[Kk][^0-9]*(\d{3,4}(?:\.\d{1,2})?)\s*(?:AED|aed)/i);

  if (!k24) throw new Error('Could not parse goldratetodaydubai');

  const rate_24k = parseFloat(k24[1]);
  return {
    rate_24k,
    rate_22k: k22 ? parseFloat(k22[1]) : parseFloat((rate_24k * 22/24).toFixed(2)),
    rate_21k: parseFloat((rate_24k * 21/24).toFixed(2)),
    rate_18k: k18 ? parseFloat(k18[1]) : parseFloat((rate_24k * 18/24).toFixed(2)),
    source: 'goldratetodaydubai.com',
  };
}

// GulfNews gold rate (very reliable)
async function scrapeGulfNews() {
  const html = await fetchUrl('https://gulfnews.com/gold-forex');
  
  const k24 = html.match(/24\s*[Kk]arat[^0-9]*(\d{3,4}(?:\.\d{1,2})?)/i) ||
               html.match(/(\d{3,4}(?:\.\d{1,2})?)[^0-9]*24\s*[Kk]/i);
  const k22 = html.match(/22\s*[Kk]arat[^0-9]*(\d{3,4}(?:\.\d{1,2})?)/i) ||
               html.match(/(\d{3,4}(?:\.\d{1,2})?)[^0-9]*22\s*[Kk]/i);

  if (!k24) throw new Error('Could not parse gulfnews');
  const rate_24k = parseFloat(k24[1]);

  return {
    rate_24k,
    rate_22k: k22 ? parseFloat(k22[1]) : parseFloat((rate_24k * 22/24).toFixed(2)),
    rate_21k: parseFloat((rate_24k * 21/24).toFixed(2)),
    rate_18k: parseFloat((rate_24k * 18/24).toFixed(2)),
    source: 'gulfnews.com',
  };
}

/**
 * Main scraper — tries sources in order, returns first success
 */
async function scrapeGoldRate() {
  const sources = [
    { name: 'Dubai City of Gold', fn: scrapedubaicityofgold },
    { name: 'Gold Rate Today Dubai', fn: scrapeGoldRateToday },
    { name: 'Gulf News', fn: scrapeGulfNews },
  ];

  for (const source of sources) {
    try {
      const rates = await source.fn();
      console.log(`✅ Gold rate fetched from ${source.name}: 24K=${rates.rate_24k} AED`);
      return rates;
    } catch(e) {
      console.warn(`⚠️  ${source.name} failed: ${e.message}`);
    }
  }

  throw new Error('All gold rate sources failed');
}

module.exports = { scrapeGoldRate };
