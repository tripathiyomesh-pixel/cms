/**
 * Backend Health Check
 * Tests every critical endpoint.
 * Usage: node src/scripts/health_check.js [base_url]
 *
 * Set ADMIN_TOKEN env var for authenticated endpoints:
 *   ADMIN_TOKEN=eyJ... node src/scripts/health_check.js
 */
const BASE = process.argv[2] || process.env.API_URL || 'http://localhost:4000';
const TOKEN = process.env.ADMIN_TOKEN || '';

let passed = 0;
let failed = 0;

async function check(label, url, opts = {}) {
  const { method = 'GET', body, authRequired = false, expectStatus = 200 } = opts;
  const headers = { 'Content-Type': 'application/json' };
  if (authRequired && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  try {
    const res = await fetch(`${BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
    const ok = res.status < 500 && (authRequired && !TOKEN ? true : res.status === expectStatus || res.status < 400);
    if (ok) {
      console.log(`  OK  ${label}`);
      passed++;
    } else {
      console.log(`  FAIL ${label} — HTTP ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`  FAIL ${label} — ${e.message}`);
    failed++;
  }
}

(async () => {
  console.log(`\nJCOS Backend Health Check — ${BASE}\n${'─'.repeat(60)}`);
  if (!TOKEN) console.log('  (No ADMIN_TOKEN set — authenticated checks will be skipped)\n');

  // ── PUBLIC ──────────────────────────────────────────────────────────────
  console.log('\nPUBLIC ENDPOINTS');
  await check('Health endpoint',           '/health');
  await check('Gold rates current',        '/api/gold-rates/current');
  await check('Settings public',           '/api/settings/public');
  await check('WhatsApp number public',    '/api/settings/whatsapp_number');
  await check('Sitemap XML',               '/sitemap.xml');
  await check('Robots.txt',               '/robots.txt');
  await check('Appointment slots',         '/api/appointments/slots?date=2026-07-01');
  await check('Search endpoint',           '/api/search?q=diamond');
  await check('Collections public',        '/api/storefront/collections');
  await check('Products storefront',       '/api/storefront/products?limit=5');
  await check('Blog public',              '/api/blog?status=published&limit=5');

  // ── ADMIN (require token) ────────────────────────────────────────────────
  if (TOKEN) {
    console.log('\nADMIN ENDPOINTS');
    await check('Dashboard /stats',          '/api/dashboard/stats',       { authRequired: true });
    await check('Dashboard / (new shape)',   '/api/dashboard',             { authRequired: true });
    await check('Products list',            '/api/products',              { authRequired: true });
    await check('Collections list',         '/api/collections',           { authRequired: true });
    await check('Categories list',          '/api/categories',            { authRequired: true });
    await check('Diamonds list (natural)',  '/api/diamonds?type=natural', { authRequired: true });
    await check('Diamonds list (lab)',      '/api/diamonds?type=lab_grown',{ authRequired: true });
    await check('Enquiries list',           '/api/enquiries',             { authRequired: true });
    await check('Appointments list',        '/api/appointments',          { authRequired: true });
    await check('Customers list',           '/api/customers',             { authRequired: true });
    await check('Reports revenue',          '/api/reports/revenue',       { authRequired: true });
    await check('Reports enquiries',        '/api/reports/enquiries',     { authRequired: true });
    await check('Reports appointments',     '/api/reports/appointments',  { authRequired: true });
    await check('Reports CRM',             '/api/reports/crm',           { authRequired: true });
    await check('Reports customers',        '/api/reports/customers',     { authRequired: true });
    await check('Notifications list',       '/api/notifications',         { authRequired: true });
    await check('Notifications unread-count', '/api/notifications/unread-count', { authRequired: true });
    await check('Media library',           '/api/media',                 { authRequired: true });
    await check('SEO robots GET',          '/api/seo/robots',            { authRequired: true });
    await check('SEO redirects list',      '/api/seo/redirects',         { authRequired: true });
    await check('Webhooks list',           '/api/webhooks',              { authRequired: true });
    await check('Import jobs list',        '/api/import/jobs',           { authRequired: true });
    await check('Workforce list',          '/api/workforce/staff',       { authRequired: true });
    await check('Gold rates history',      '/api/gold-rates/history',    { authRequired: true });
    await check('Storefront config',       '/api/storefront/frontend-config', { authRequired: true });
  } else {
    console.log('\nADMIN ENDPOINTS — skipped (no ADMIN_TOKEN)');
  }

  // ── SUMMARY ─────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
