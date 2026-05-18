require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');
async function up() {
  const client = new Client({ host:process.env.DB_HOST||'localhost', port:+process.env.DB_PORT||5432, database:process.env.DB_NAME, user:process.env.DB_USER, password:process.env.DB_PASS });
  await client.connect();
  await client.query(`
    INSERT INTO settings (id, key, value, is_public) VALUES
      -- Preloader
      (gen_random_uuid(), 'preloader_enabled',   '"false"'::json, true),
      (gen_random_uuid(), 'preloader_style',     '"spinner"'::json, true),
      (gen_random_uuid(), 'preloader_color',     '"#c9a84c"'::json, true),
      -- Cookie consent
      (gen_random_uuid(), 'cookie_enabled',      '"false"'::json, true),
      (gen_random_uuid(), 'cookie_message',      '"We use cookies to enhance your browsing experience."'::json, true),
      (gen_random_uuid(), 'cookie_accept_label', '"Accept"'::json, true),
      (gen_random_uuid(), 'cookie_decline_label','"Decline"'::json, true),
      (gen_random_uuid(), 'cookie_more_link',    '"/privacy-policy"'::json, true),
      (gen_random_uuid(), 'cookie_expire_days',  '"30"'::json, true),
      -- Popup
      (gen_random_uuid(), 'popup_enabled',       '"false"'::json, true),
      (gen_random_uuid(), 'popup_type',          '"newsletter"'::json, true),
      (gen_random_uuid(), 'popup_title',         '"Exclusive Jewellery Offers"'::json, true),
      (gen_random_uuid(), 'popup_message',       '"Subscribe for early access to new collections and exclusive VIP offers."'::json, true),
      (gen_random_uuid(), 'popup_image',         '""'::json, true),
      (gen_random_uuid(), 'popup_delay',         '"3000"'::json, true),
      (gen_random_uuid(), 'popup_cta_text',      '"View Collection"'::json, true),
      (gen_random_uuid(), 'popup_cta_url',       '"/jewellery"'::json, true),
      -- Maintenance mode
      (gen_random_uuid(), 'maintenance_enabled', '"false"'::json, false),
      (gen_random_uuid(), 'maintenance_message', '"We are updating our collection. Back soon."'::json, true),
      -- Analytics + custom code
      (gen_random_uuid(), 'google_analytics_id', '""'::json, false),
      (gen_random_uuid(), 'custom_head_code',    '""'::json, false),
      (gen_random_uuid(), 'custom_body_code',    '""'::json, false),
      -- Homepage sections order + visibility
      (gen_random_uuid(), 'homepage_sections',   '"hero,categories,featured_products,brand_story,stats,certifications,testimonials,exhibitions,blog,newsletter"'::json, true),
      (gen_random_uuid(), 'homepage_sections_config', '"{}"'::json, true)
    ON CONFLICT (key) DO NOTHING;
  `);
  console.log('✅ Migration 015 — frontend settings');
  await client.end();
}
up().catch(e=>{ console.error('❌',e.message); process.exit(1); });
