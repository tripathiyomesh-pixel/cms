/**
 * Payment Gateway Module
 * Supports: Tap Payments, Geidea, Tabby, Tamara, Razorpay, Stripe
 * 
 * Flow:
 *   POST /api/payments/initiate     — create payment session
 *   POST /api/payments/webhook/:gw  — receive gateway callback
 *   POST /api/payments/verify       — verify payment after redirect
 *   POST /api/payments/refund       — process refund
 *   GET  /api/payments/gateways     — get enabled gateways (public)
 *   GET  /api/payments/transaction/:id — get transaction details
 *   GET  /api/payments/             — list transactions (admin)
 */
const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db       = require('../../config/db.pool');

const ADMIN = ['super_admin','admin','manager'];

// ─── HELPERS ──────────────────────────────────────────────────

async function getSetting(key) {
  const [rows] = await db.query('SELECT value FROM settings WHERE key=$1 LIMIT 1',[key]);
  const v = rows[0]?.value;
  if (!v) return '';
  if (typeof v === 'string') return v.replace(/^"|"$/g,'');
  return String(v).replace(/^"|"$/g,'');
}

async function getGatewayConfig(gateway) {
  const keys = {
    tap:      ['tap_enabled','tap_public_key','tap_secret_key','tap_test_mode'],
    geidea:   ['geidea_enabled','geidea_merchant_key','geidea_password','geidea_test_mode'],
    tabby:    ['tabby_enabled','tabby_public_key','tabby_secret_key','tabby_test_mode'],
    tamara:   ['tamara_enabled','tamara_token','tamara_test_mode'],
    razorpay: ['razorpay_enabled','razorpay_key_id','razorpay_key_secret','razorpay_test_mode'],
    stripe:   ['stripe_enabled','stripe_public_key','stripe_secret_key','stripe_test_mode'],
  };
  const config = {};
  for (const k of (keys[gateway]||[])) {
    config[k.replace(gateway+'_','')] = await getSetting(k);
  }
  return config;
}

async function createTransaction(data) {
  const [r] = await db.execute(
    `INSERT INTO payment_transactions
       (order_id,order_number,gateway,gateway_order_id,gateway_session_id,
        amount,currency,status,customer_email,customer_phone,customer_name,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'initiated',$8,$9,$10,$11) RETURNING id`,
    [data.order_id||null, data.order_number||null, data.gateway,
     data.gateway_order_id||null, data.gateway_session_id||null,
     data.amount, data.currency||'AED',
     data.customer_email||null, data.customer_phone||null, data.customer_name||null,
     JSON.stringify(data.metadata||{})]
  );
  return r[0]?.id || r.rows?.[0]?.id;
}

const TX_UPDATABLE = new Set(["status","gateway_payment_id","captured_at","refund_amount","refunded_at","webhook_payload","metadata"]);
async function updateTransaction(id, updates) {
  const fields = Object.keys(updates).filter(k => TX_UPDATABLE.has(k));
  const vals   = Object.values(updates);
  vals.push(id);
  await db.query(
    `UPDATE payment_transactions SET ${fields.map((f,i)=>`${f}=$${i+1}`).join(',')},updated_at=NOW() WHERE id=$${vals.length}`,
    vals
  );
}

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

// ─── GET ENABLED GATEWAYS (public — storefront uses this) ─────
router.get('/gateways', async (req, res) => {
  try {
    const ALL = ['tap','geidea','tabby','tamara','razorpay','stripe'];
    const enabled = [];
    for (const gw of ALL) {
      const isEnabled = await getSetting(`${gw}_enabled`);
      if (isEnabled === 'true') {
        const publicKey = await getSetting(`${gw}_public_key`) || await getSetting(`${gw}_key_id`) || '';
        enabled.push({ id: gw, name: GW_LABELS[gw]?.name, logo: GW_LABELS[gw]?.logo, type: GW_LABELS[gw]?.type, public_key: publicKey });
      }
    }
    res.json({ success: true, data: enabled });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

const GW_LABELS = {
  tap:      { name:'Tap Payments',  logo:'💳', type:'card',     currencies:['AED','SAR','KWD','BHD','OMR','QAR'], regions:['UAE','KSA','Kuwait','Bahrain'] },
  geidea:   { name:'Geidea',        logo:'💳', type:'card',     currencies:['AED','SAR','EGP'],                   regions:['UAE','KSA','Egypt'] },
  tabby:    { name:'Tabby',         logo:'🛍️', type:'bnpl',     currencies:['AED','SAR'],                         regions:['UAE','KSA'] },
  tamara:   { name:'Tamara',        logo:'🛒', type:'bnpl',     currencies:['SAR','AED'],                         regions:['KSA','UAE'] },
  razorpay: { name:'Razorpay',      logo:'₹',  type:'card_upi', currencies:['INR'],                               regions:['India'] },
  stripe:   { name:'Stripe',        logo:'💳', type:'card',     currencies:['USD','GBP','EUR','AED'],             regions:['International'] },
};

// ─── INITIATE PAYMENT ─────────────────────────────────────────
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { gateway, amount, currency='AED', order_number, order_id,
            customer_name, customer_email, customer_phone,
            success_url, cancel_url, items=[] } = req.body;

    if (!gateway || !amount || !order_number)
      return res.status(422).json({ success:false, message:'gateway, amount, order_number required' });

    // Server-side amount validation — prevent client-side tampering
    if (order_number) {
      const [orderRows] = await db.query(
        'SELECT total_amount FROM orders WHERE order_number=$1 LIMIT 1', [order_number]
      );
      if (orderRows.length) {
        const expected = parseFloat(orderRows[0].total_amount);
        const given    = parseFloat(amount);
        if (Math.abs(expected - given) > 0.01)
          return res.status(422).json({ success:false, message:'Payment amount does not match order total' });
      }
    }

    const cfg = await getGatewayConfig(gateway);
    if (cfg.enabled !== 'true')
      return res.status(400).json({ success:false, message:`${gateway} is not enabled` });

    const base = getBaseUrl(req);
    const successUrl = success_url || `${base}/checkout/success?order=${order_number}`;
    const cancelUrl  = cancel_url  || `${base}/checkout/cancel?order=${order_number}`;

    let result;
    switch(gateway) {
      case 'tap':      result = await initiateTap(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, customer_phone, successUrl, cancelUrl, base }); break;
      case 'geidea':   result = await initiateGeidea(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, customer_phone, successUrl, cancelUrl, base }); break;
      case 'tabby':    result = await initiateTabby(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, customer_phone, successUrl, cancelUrl, items }); break;
      case 'tamara':   result = await initiateTamara(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, customer_phone, successUrl, cancelUrl, items }); break;
      case 'razorpay': result = await initiateRazorpay(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, customer_phone }); break;
      case 'stripe':   result = await initiateStripe(cfg, { amount, currency, order_number, order_id, customer_name, customer_email, successUrl, cancelUrl }); break;
      default: return res.status(400).json({ success:false, message:'Unknown gateway' });
    }

    // Store transaction
    const txId = await createTransaction({
      order_id, order_number, gateway,
      gateway_order_id:  result.gateway_order_id,
      gateway_session_id:result.session_id,
      amount, currency, customer_email, customer_phone, customer_name,
      metadata: result.metadata||{},
    });

    res.json({ success:true, data:{ transaction_id:txId, ...result } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── TAP PAYMENTS ──────────────────────────────────────────────
async function initiateTap(cfg, { amount, currency, order_number, customer_name, customer_email, customer_phone, successUrl, cancelUrl }) {
  const baseUrl = cfg.test_mode==='true' ? 'https://api.tap.company/v2' : 'https://api.tap.company/v2';
  const resp = await fetch(`${baseUrl}/charges`, {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${cfg.secret_key}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      amount, currency,
      customer:{ first_name:customer_name, email:customer_email, phone:{ country_code:'971', number:customer_phone?.replace(/\D/g,'').slice(-9)||'' } },
      source:{ id:'src_all' },
      redirect:{ url:successUrl },
      reference:{ merchant:order_number },
      description:`Order ${order_number}`,
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || 'Tap API error');
  return {
    gateway_order_id: data.id,
    session_id:       data.id,
    redirect_url:     data.transaction?.url || data.redirect?.url,
    status:           data.status,
    metadata:         { tap_charge_id: data.id },
  };
}

// ── GEIDEA HPP ────────────────────────────────────────────────
async function initiateGeidea(cfg, { amount, currency, order_number, customer_name, customer_email, successUrl, cancelUrl, base }) {
  const isTest  = cfg.test_mode === 'true';
  const apiBase = isTest ? 'https://api.merchant.geidea.net' : 'https://api.merchant.geidea.net';

  // Geidea HPP: generate session token first
  const timestamp = new Date().toISOString();
  const signature = crypto.createHash('sha256')
    .update(`${cfg.merchant_key}${amount.toFixed(2)}${currency}${order_number}${timestamp}${cfg.password}`)
    .digest('hex');

  const resp = await fetch(`${apiBase}/payment-intent/api/v2/direct/session`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({
      merchantPublicKey: cfg.merchant_key,
      amount:            parseFloat(amount).toFixed(2),
      currencyCode:      currency,
      merchantReferenceId: order_number,
      timestamp,
      signature,
      customerEmail:     customer_email,
      callbackUrl:       `${base}/api/payments/webhook/geidea`,
      returnUrl:         successUrl,
    })
  });
  const data = await resp.json();
  if (data.responseCode !== '000') throw new Error(data.detailedResponseMessage || 'Geidea session error');

  const hppBase = isTest ? 'https://api-merchant.geidea.net/hpp' : 'https://api-merchant.geidea.net/hpp';
  return {
    gateway_order_id: data.session?.id || order_number,
    session_id:       data.session?.id,
    redirect_url:     data.session?.id ? `${hppBase}?sessionId=${data.session.id}` : null,
    redirect_url:     `https://www.merchant.geidea.net/${isTest?'uat/':''}payment-intent/api/v2/hosted/${data.session?.id}`,
    status:          'initiated',
    metadata:        { geidea_session: data.session?.id },
  };
}

// ── TABBY ─────────────────────────────────────────────────────
async function initiateTabby(cfg, { amount, currency, order_number, customer_name, customer_email, customer_phone, successUrl, cancelUrl, items }) {
  const isTest = cfg.test_mode === 'true';
  const apiBase = isTest ? 'https://api.tabby.ai' : 'https://api.tabby.ai';

  const resp = await fetch(`${apiBase}/api/v2/checkout`, {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${cfg.secret_key}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      payment:{
        amount:      String(parseFloat(amount).toFixed(2)),
        currency,
        description: `Order ${order_number}`,
        buyer:{
          phone:    customer_phone||'',
          email:    customer_email||'',
          name:     customer_name||'',
          dob:      '1990-01-01',
        },
        buyer_history:{ registered_since:'2019-01-01', loyalty_level:0 },
        order:{
          tax_amount:'0.00',
          shipping_amount:'0.00',
          discount_amount:'0.00',
          updated_at: new Date().toISOString(),
          reference_id: order_number,
          items: items.length ? items.map(i=>({
            title:    i.name||'Jewellery',
            quantity: i.qty||1,
            unit_price: String(parseFloat(i.unit_price||i.final_price||0).toFixed(2)),
            sku:      i.sku||order_number,
            category:'Jewellery',
          })) : [{ title:'Order', quantity:1, unit_price:String(parseFloat(amount).toFixed(2)), sku:order_number, category:'Jewellery' }],
        },
        order_history:[],
        shipping_address:{ city:'Dubai', address:'Dubai', zip:'00000' },
        meta:{ order_id:order_number, customer:'',},
      },
      lang:'en',
      merchant_code:'',
      merchant_urls:{ success:successUrl, cancel:cancelUrl, failure:cancelUrl },
    })
  });
  const data = await resp.json();
  if (data.status === 'rejected') throw new Error('Tabby: customer not eligible for BNPL');
  if (!data.id) throw new Error(data.error||'Tabby session error');

  return {
    gateway_order_id: data.id,
    session_id:       data.id,
    redirect_url:     data.configuration?.available_products?.installments?.[0]?.web_url || data.payment?.checkout_url,
    status:          'initiated',
    metadata:        { tabby_id: data.id, installments: data.configuration?.available_products?.installments },
  };
}

// ── TAMARA ────────────────────────────────────────────────────
async function initiateTamara(cfg, { amount, currency, order_number, customer_name, customer_email, customer_phone, successUrl, cancelUrl, items }) {
  const isTest  = cfg.test_mode === 'true';
  const apiBase = isTest ? 'https://api-sandbox.tamara.co' : 'https://api.tamara.co';

  const resp = await fetch(`${apiBase}/checkout`, {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${cfg.token}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      order_reference_id: order_number,
      total_amount:{ amount:parseFloat(amount).toFixed(2), currency },
      description: `Order ${order_number}`,
      country_code: currency==='SAR'?'SA':'AE',
      payment_type:'PAY_BY_INSTALMENTS',
      instalments: 3,
      customer:{ first_name:(customer_name||'').split(' ')[0]||'Customer', last_name:(customer_name||'').split(' ').slice(1).join(' ')||'Name', email:customer_email||'', phone_number:customer_phone||'' },
      billing_address:{ first_name:'Customer', last_name:'Name', line1:'Dubai', city:'Dubai', country_code:'AE' },
      shipping_address:{ first_name:'Customer', last_name:'Name', line1:'Dubai', city:'Dubai', country_code:'AE' },
      items: items.length ? items.map(i=>({
        reference_id: i.sku||order_number,
        type:'Jewellery',
        name: i.name||'Jewellery',
        sku:  i.sku||order_number,
        quantity: i.qty||1,
        unit_price:{ amount:parseFloat(i.unit_price||i.final_price||0).toFixed(2), currency },
        discount_amount:{ amount:'0.00', currency },
        tax_amount:{ amount:'0.00', currency },
        total_amount:{ amount:parseFloat(i.unit_price||i.final_price||0).toFixed(2), currency },
      })) : [{ reference_id:order_number,type:'Jewellery',name:'Order',sku:order_number,quantity:1,unit_price:{ amount:parseFloat(amount).toFixed(2),currency },discount_amount:{ amount:'0.00',currency },tax_amount:{ amount:'0.00',currency },total_amount:{ amount:parseFloat(amount).toFixed(2),currency } }],
      urls:{ notification:`${apiBase}`,success:successUrl,failure:cancelUrl,cancel:cancelUrl },
      merchant_url:successUrl,
    })
  });
  const data = await resp.json();
  if (!data.checkout_id) throw new Error(data.message||'Tamara checkout error');

  return {
    gateway_order_id: data.order_id || data.checkout_id,
    session_id:       data.checkout_id,
    redirect_url:     data.checkout_url,
    status:          'initiated',
    metadata:        { tamara_checkout_id: data.checkout_id, tamara_order_id: data.order_id },
  };
}

// ── RAZORPAY ──────────────────────────────────────────────────
async function initiateRazorpay(cfg, { amount, currency='INR', order_number }) {
  const auth = Buffer.from(`${cfg.key_id}:${cfg.key_secret}`).toString('base64');
  const resp = await fetch('https://api.razorpay.com/v1/orders', {
    method:'POST',
    headers:{ 'Authorization':`Basic ${auth}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      amount:   Math.round(parseFloat(amount)*100), // paise
      currency,
      receipt:  order_number,
      notes:    { order_number },
    })
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.description||'Razorpay error');

  return {
    gateway_order_id: data.id,
    session_id:       data.id,
    redirect_url:     null, // Razorpay uses JS SDK — no redirect
    public_key:       cfg.key_id,
    razorpay_order:   data,
    status:          'initiated',
    metadata:        { razorpay_order_id: data.id },
  };
}

// ── STRIPE ────────────────────────────────────────────────────
async function initiateStripe(cfg, { amount, currency='USD', order_number, customer_name, customer_email, successUrl, cancelUrl }) {
  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${cfg.secret_key}`, 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'line_items[0][price_data][currency]':           currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]':        String(Math.round(parseFloat(amount)*100)),
      'line_items[0][price_data][product_data][name]': `Order ${order_number}`,
      'line_items[0][quantity]':                       '1',
      'mode':           'payment',
      'success_url':    `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url':     cancelUrl,
      'customer_email': customer_email||'',
      'metadata[order_number]': order_number,
    }).toString()
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message||'Stripe error');

  return {
    gateway_order_id: data.payment_intent,
    session_id:       data.id,
    redirect_url:     data.url,
    status:          'initiated',
    metadata:        { stripe_session_id: data.id },
  };
}

// ─── WEBHOOK RECEIVERS ────────────────────────────────────────
router.post('/webhook/:gateway', express.raw({ type:'*/*' }), async (req, res) => {
  const { gateway } = req.params;
  const body = req.body;
  const rawBody = Buffer.isBuffer(body) ? body.toString() : JSON.stringify(body);

  res.status(200).json({ received: true }); // Always 200 fast

  try {
    let parsed;
    try { parsed = JSON.parse(rawBody); } catch { parsed = {}; }

    switch(gateway) {

      case 'tap': {
        // Verify Tap webhook HMAC-SHA256
        const tapWHSecret = process.env.TAP_WEBHOOK_SECRET || '';
        const tapSig = req.headers['hashstring'] || req.headers['x-tap-signature'] || '';
        if (tapWHSecret && tapSig) {
          const tapExp = crypto.createHmac('sha256', tapWHSecret).update(rawBody).digest('hex');
          if (tapSig !== tapExp) { console.error('Tap webhook: invalid signature'); return; }
        }
        const charge = parsed;
        const txId = charge.reference?.merchant;
        if (charge.status === 'CAPTURED') {
          await db.query(
            `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW(), webhook_payload=$2 WHERE order_number=$3`,
            [charge.id, parsed, txId]
          );
          await db.query(`UPDATE orders SET status='confirmed', payment_status='paid' WHERE order_number=$1`,[txId]);
        } else if (['FAILED','ABANDONED','CANCELLED'].includes(charge.status)) {
          await db.query(
            `UPDATE payment_transactions SET status='failed', webhook_payload=$1 WHERE order_number=$2`,
            [parsed, txId]
          );
        }
        break;
      }

      case 'geidea': {
        // Verify Geidea webhook signature
        const geidWHSig = req.headers['x-geidea-signature'] || '';
        const geidCfgW  = await getGatewayConfig('geidea');
        if (geidCfgW.password && geidWHSig) {
          const geidExp = crypto.createHash('sha256')
            .update((geidCfgW.merchant_key||'') + (parsed.amount||'') + (parsed.currencyCode||'') + (parsed.merchantReferenceId||'') + (parsed.postDateTime||'') + geidCfgW.password)
            .digest('hex');
          if (geidWHSig !== geidExp) { console.error('Geidea webhook: invalid signature'); return; }
        }
        const ref = parsed.merchantReferenceId || parsed.order?.merchantReferenceId;
        const status = parsed.detailedResponseCode === '000' ? 'captured' : 'failed';
        await db.query(
          `UPDATE payment_transactions SET status=$1, gateway_payment_id=$2, webhook_payload=$3 ${status==='captured'?', captured_at=NOW()':''} WHERE order_number=$4`,
          [status, parsed.orderId||'', parsed, ref]
        );
        if (status === 'captured') await db.query(`UPDATE orders SET status='confirmed' WHERE order_number=$1`,[ref]);
        break;
      }

      case 'tabby': {
        // Verify Tabby HMAC-SHA256
        const tabbyCfgW = await getGatewayConfig('tabby');
        const tabbySigH = req.headers['x-tabby-hmac-sha256'] || '';
        if (tabbyCfgW.secret_key && tabbySigH) {
          const tabbyExp = crypto.createHmac('sha256', tabbyCfgW.secret_key).update(rawBody).digest('hex');
          try {
            if (!crypto.timingSafeEqual(Buffer.from(tabbySigH,'hex'), Buffer.from(tabbyExp,'hex')))
              { console.error('Tabby webhook: invalid signature'); return; }
          } catch { console.error('Tabby webhook: malformed sig header'); return; }
        }
        const payment = parsed.payment || parsed;
        if (payment.status === 'AUTHORIZED' || payment.status === 'CLOSED') {
          const ref = payment.order?.reference_id || payment.meta?.order_id;
          await db.query(
            `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW(), webhook_payload=$2 WHERE order_number=$3`,
            [payment.id, parsed, ref]
          );
          await db.query(`UPDATE orders SET status='confirmed' WHERE order_number=$1`,[ref]);
        }
        break;
      }

      case 'tamara': {
        // Verify Tamara HMAC-SHA256
        const tamaraCfgW = await getGatewayConfig('tamara');
        const tamaraSigH = req.headers['x-tamara-signature'] || '';
        if (tamaraCfgW.token && tamaraSigH) {
          const tamaraExp = crypto.createHmac('sha256', tamaraCfgW.token).update(rawBody).digest('hex');
          if (tamaraSigH !== tamaraExp) { console.error('Tamara webhook: invalid signature'); return; }
        }
        if (parsed.event_type === 'order_approved' || parsed.status === 'approved') {
          const ref = parsed.order_reference_id;
          await db.query(
            `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW(), webhook_payload=$2 WHERE order_number=$3`,
            [parsed.order_id||'', parsed, ref]
          );
          await db.query(`UPDATE orders SET status='confirmed' WHERE order_number=$1`,[ref]);
        }
        break;
      }

      case 'razorpay': {
        // Verify Razorpay signature
        const cfg = await getGatewayConfig('razorpay');
        const sig = req.headers['x-razorpay-signature']||'';
        const expected = crypto.createHmac('sha256', cfg.key_secret).update(rawBody).digest('hex');
        if (sig !== expected) { console.error('Invalid Razorpay signature'); break; }
        if (parsed.event === 'payment.captured') {
          const ref = parsed.payload?.payment?.entity?.notes?.order_number;
          await db.query(
            `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW(), webhook_payload=$2 WHERE order_number=$3`,
            [parsed.payload?.payment?.entity?.id, parsed, ref]
          );
          await db.query(`UPDATE orders SET status='confirmed' WHERE order_number=$1`,[ref]);
        }
        break;
      }

      case 'stripe': {
        const cfg = await getGatewayConfig('stripe');
        const sig = req.headers['stripe-signature']||'';
        // Stripe webhook HMAC-SHA256 verification
        const stripeWHSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
        if (stripeWHSecret && stripeSig) {
          const parts = Object.fromEntries(stripeSig.split(',').map(p => { const [k,...v]=p.split('='); return [k,v.join('=')]; }));
          const sigAge = Math.floor(Date.now()/1000) - parseInt(parts.t||0);
          if (sigAge > 300) { console.error('Stripe: stale webhook'); return; }
          const sigExp = crypto.createHmac('sha256',stripeWHSecret).update((parts.t||'')+'.'+rawBody).digest('hex');
          if (!parts.v1 || parts.v1 !== sigExp) { console.error('Stripe: invalid sig'); return; }
        }
        // original logic below
        if (parsed.type === 'checkout.session.completed') {
          const ref = parsed.data?.object?.metadata?.order_number;
          await db.query(
            `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW(), webhook_payload=$2 WHERE order_number=$3`,
            [parsed.data?.object?.payment_intent, parsed, ref]
          );
          await db.query(`UPDATE orders SET status='confirmed' WHERE order_number=$1`,[ref]);
        }
        break;
      }
    }
  } catch(e) { console.error(`Payment webhook [${gateway}] error:`, e.message); }
});

// ─── VERIFY PAYMENT (after redirect back to site) ─────────────
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { gateway, tap_id, session_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (gateway === 'tap' && tap_id) {
      const cfg = await getGatewayConfig('tap');
      const resp = await fetch(`https://api.tap.company/v2/charges/${tap_id}`, {
        headers:{ 'Authorization':`Bearer ${cfg.secret_key}` }
      });
      const charge = await resp.json();
      const captured = charge.status === 'CAPTURED';
      if (captured) {
        await db.query(
          `UPDATE payment_transactions SET status='captured', captured_at=NOW() WHERE gateway_order_id=$1`,
          [tap_id]
        );
      }
      return res.json({ success:true, data:{ captured, status:charge.status, amount:charge.amount, currency:charge.currency } });
    }

    if (gateway === 'razorpay' && razorpay_payment_id) {
      const cfg = await getGatewayConfig('razorpay');
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', cfg.key_secret).update(body).digest('hex');
      const valid = expected === razorpay_signature;
      if (valid) {
        await db.query(
          `UPDATE payment_transactions SET status='captured', gateway_payment_id=$1, captured_at=NOW() WHERE gateway_order_id=$2`,
          [razorpay_payment_id, razorpay_order_id]
        );
      }
      return res.json({ success:true, data:{ captured:valid, payment_id:razorpay_payment_id } });
    }

    res.json({ success:true, data:{ captured:false, message:'No verifiable payment data provided' } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── REFUND ───────────────────────────────────────────────────
router.post('/refund', authenticate, authorize(ADMIN), async (req, res) => {
  try {
    const { transaction_id, amount, reason='customer_request' } = req.body;
    const [rows] = await db.query('SELECT * FROM payment_transactions WHERE id=$1',[transaction_id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Transaction not found' });
    const tx = rows[0];
    if (tx.status !== 'captured') return res.status(400).json({ success:false, message:'Only captured payments can be refunded' });

    const cfg = await getGatewayConfig(tx.gateway);
    const refundAmount = parseFloat(amount || tx.amount);

    let refundResult;
    switch(tx.gateway) {
      case 'tap': {
        const resp = await fetch(`https://api.tap.company/v2/refunds`, {
          method:'POST',
          headers:{ 'Authorization':`Bearer ${cfg.secret_key}`,'Content-Type':'application/json' },
          body: JSON.stringify({ charge_id:tx.gateway_payment_id, amount:refundAmount, currency:tx.currency, reason })
        });
        refundResult = await resp.json();
        break;
      }
      case 'razorpay': {
        const auth = Buffer.from(`${cfg.key_id}:${cfg.key_secret}`).toString('base64');
        const resp = await fetch(`https://api.razorpay.com/v1/payments/${tx.gateway_payment_id}/refund`, {
          method:'POST',
          headers:{ 'Authorization':`Basic ${auth}`,'Content-Type':'application/json' },
          body: JSON.stringify({ amount:Math.round(refundAmount*100), notes:{ reason } })
        });
        refundResult = await resp.json();
        break;
      }
      case 'stripe': {
        const resp = await fetch('https://api.stripe.com/v1/refunds', {
          method:'POST',
          headers:{ 'Authorization':`Bearer ${cfg.secret_key}`,'Content-Type':'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ payment_intent:tx.gateway_payment_id, amount:String(Math.round(refundAmount*100)), reason:'requested_by_customer' })
        });
        refundResult = await resp.json();
        break;
      }
      default: return res.status(400).json({ success:false, message:`Refund not yet implemented for ${tx.gateway}` });
    }

    await db.query(
      `UPDATE payment_transactions SET status='refunded', refund_amount=$1, refunded_at=NOW() WHERE id=$2`,
      [refundAmount, transaction_id]
    );
    await db.query(`UPDATE orders SET status='returned' WHERE order_number=$1`,[tx.order_number]);

    res.json({ success:true, data:refundResult, message:`Refund of ${tx.currency} ${refundAmount} processed` });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── LIST TRANSACTIONS (admin) ────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, limit=20, gateway, status, search } = req.query;
    const params=[]; let where='WHERE 1=1';
    if(gateway) { params.push(gateway); where+=` AND gateway=$${params.length}`; }
    if(status)  { params.push(status);  where+=` AND status=$${params.length}`; }
    if(search)  { params.push(`%${search}%`); where+=` AND (order_number ILIKE $${params.length} OR customer_email ILIKE $${params.length} OR gateway_payment_id ILIKE $${params.length})`; }
    const qp=[...params,+limit,(page-1)*+limit];
    const [rows]=await db.query(`SELECT * FROM payment_transactions ${where} ORDER BY created_at DESC LIMIT $${qp.length-1} OFFSET $${qp.length}`,qp);
    const [cnt]=await db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status='captured' THEN amount ELSE 0 END) as revenue FROM payment_transactions ${where}`,params);
    res.json({ success:true, data:rows, total:+cnt[0]?.total||0, revenue:+cnt[0]?.revenue||0 });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── SINGLE TRANSACTION ───────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows]=await db.query('SELECT * FROM payment_transactions WHERE id=$1',[req.params.id]);
    if(!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:rows[0] });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
