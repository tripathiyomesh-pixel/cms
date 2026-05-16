require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Client } = require('pg');

const PLUGINS = [
  {
    id: 'jewellery', name: 'Jewellery & Diamonds',
    description: 'Metal type, purity, karat, gemstone details, certifications (GIA/IGI/SGL), making charges, gross/net weight, ring sizes, occasion tags.',
    icon: 'Gem', color: 'amber', version: '1.2.0', category: 'industry',
    author: 'KenTech Global', is_premium: false,
    config_schema: { whatsapp_number: { type: 'text', label: 'WhatsApp number', placeholder: '+971 50 000 0000' }, live_gold_rate: { type: 'boolean', label: 'Show live gold rate' } },
    product_fields: ['metal_type','purity','gross_weight','net_weight','diamond_carat','diamond_cut','diamond_color','diamond_clarity','certifications','making_charges','ring_sizes'],
  },
  {
    id: 'whatsapp', name: 'WhatsApp Enquiry',
    description: 'Add WhatsApp enquiry button on product pages. Pre-fills product name, SKU, and price in the message.',
    icon: 'MessageCircle', color: 'green', version: '1.0.0', category: 'communication',
    author: 'KenTech Global', is_premium: false,
    config_schema: { whatsapp_number: { type: 'text', label: 'WhatsApp number', required: true }, message_template: { type: 'textarea', label: 'Message template' } },
    product_fields: [],
  },
  {
    id: 'appointments', name: 'Boutique Appointments',
    description: 'Cartier-style appointment booking for showrooms. 5-step booking flow with time slots, location selection, and booking reference.',
    icon: 'Calendar', color: 'blue', version: '1.1.0', category: 'commerce',
    author: 'KenTech Global', is_premium: false,
    config_schema: { max_per_slot: { type: 'number', label: 'Max bookings per slot', default: 2 }, slot_duration: { type: 'number', label: 'Slot duration (minutes)', default: 30 } },
    product_fields: [],
  },
  {
    id: 'analytics', name: 'Google Analytics 4',
    description: 'Integrate GA4 tracking on your storefront. Track product views, enquiries, and appointment bookings as events.',
    icon: 'BarChart', color: 'orange', version: '1.0.0', category: 'marketing',
    author: 'KenTech Global', is_premium: false,
    config_schema: { measurement_id: { type: 'text', label: 'GA4 Measurement ID', placeholder: 'G-XXXXXXXXXX' } },
    product_fields: [],
  },
  {
    id: 'meta_pixel', name: 'Meta Pixel',
    description: 'Add Facebook/Instagram pixel tracking. Track ViewContent, Lead, and Purchase events.',
    icon: 'Facebook', color: 'blue', version: '1.0.0', category: 'marketing',
    author: 'KenTech Global', is_premium: false,
    config_schema: { pixel_id: { type: 'text', label: 'Meta Pixel ID', placeholder: '123456789012345' } },
    product_fields: [],
  },
  {
    id: 'multilingual', name: 'Arabic + Multi-language',
    description: 'Add Arabic RTL support and multi-language content. Translate product names, descriptions, and page content.',
    icon: 'Languages', color: 'purple', version: '1.0.0', category: 'localization',
    author: 'KenTech Global', is_premium: true,
    config_schema: { default_lang: { type: 'select', label: 'Default language', options: ['en','ar','hi'] }, rtl_support: { type: 'boolean', label: 'Enable RTL (Arabic)' } },
    product_fields: [],
  },
  {
    id: 'live_gold_rate', name: 'Live Gold Rate Pricing',
    description: 'Automatically update product prices based on live gold rates. Fetches rates hourly from goldapi.io.',
    icon: 'TrendingUp', color: 'gold', version: '1.0.0', category: 'pricing',
    author: 'KenTech Global', is_premium: true,
    config_schema: { api_key: { type: 'text', label: 'GoldAPI.io API key' }, update_interval: { type: 'number', label: 'Update interval (minutes)', default: 60 } },
    product_fields: [],
  }, },
    product_fields: ['sizes','colors','fabric','care_instructions','season'],
  }, },
    product_fields: ['bedrooms','bathrooms','area','floor','amenities','floor_plan_url'],
  },
];

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASS,
  });
  await client.connect();
  console.log('🔗 Connected. Seeding plugins...');

  for (const p of PLUGINS) {
    await client.query(`
      INSERT INTO plugins (id, name, description, icon, color, version, category, author, is_premium, config_schema, product_fields)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, description=EXCLUDED.description, version=EXCLUDED.version,
        config_schema=EXCLUDED.config_schema, product_fields=EXCLUDED.product_fields
    `, [p.id, p.name, p.description, p.icon, p.color, p.version, p.category,
        p.author, p.is_premium, JSON.stringify(p.config_schema), JSON.stringify(p.product_fields)]);
    console.log(`  ✅ ${p.name}`);
  }

  console.log('✅ Plugin seeding complete');
  await client.end();
}
seed().catch(e => { console.error('❌', e.message); process.exit(1); });
