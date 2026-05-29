/**
 * VANTIX-CMS — GrapesJS Page Builder
 * Replaces the previous section-based builder.
 *
 * Architecture:
 *  - GrapesJS loads from CDN (no npm install needed)
 *  - Jewellery-specific custom blocks registered on init
 *  - Saves HTML + CSS JSON to /api/settings/page/:pageId
 *  - Storefront DynamicPage.js renders the saved HTML/CSS
 *  - Three panel layout: Pages sidebar | GrapesJS canvas | default GrapesJS panels
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Save, Eye, RefreshCw, Smartphone, Tablet, Monitor, ChevronDown } from 'lucide-react';

// ── Pages the builder can edit ────────────────────────────────
const PAGES = [
  { id: 'homepage',   label: 'Homepage',       url: '/' },
  { id: 'about',      label: 'About Us',        url: '/about' },
  { id: 'bespoke',    label: 'Bespoke/Custom',  url: '/custom' },
  { id: 'lab-grown',  label: 'Lab Grown',       url: '/lab-grown' },
  { id: 'heritage',   label: 'Our Heritage',    url: '/about#heritage' },
  { id: 'care-guide', label: 'Care Guide',      url: '/care-guide' },
  { id: 'faq',        label: 'FAQ',             url: '/faq' },
];

// ── CDN URLs ──────────────────────────────────────────────────
const GJS_CSS = 'https://unpkg.com/grapesjs@0.21.13/dist/css/grapes.min.css';
const GJS_JS  = 'https://unpkg.com/grapesjs@0.21.13/dist/grapes.min.js';

// ── Jewellery-specific block HTML templates ───────────────────
const BLOCKS = [
  {
    id: 'jw-hero',
    label: 'Hero Banner',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/></svg>`,
    content: `
<section style="position:relative;min-height:540px;background:#1a1a1a;display:flex;align-items:center;overflow:hidden;">
  <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80" alt="Hero" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55;"/>
  <div style="position:relative;z-index:1;padding:60px 80px;max-width:700px;">
    <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px;">New Collection</p>
    <h1 style="font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:20px;">Frost Yourself</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:36px;max-width:480px;">Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.</p>
    <a href="/jewellery" style="display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:3px;">Discover the selection →</a>
  </div>
</section>`,
  },
  {
    id: 'jw-categories',
    label: 'Category Circles',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
    content: `
<section style="padding:64px 40px;background:#fff;text-align:center;">
  <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#1a1a1a;margin-bottom:40px;">Top Categories</h2>
  <div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap;max-width:960px;margin:0 auto;">
    ${['Bracelets','Certified Diamond','Earrings','High Jewellery','Jewellery','Lab Grown','Necklaces','Bridal'].map(cat => `
    <a href="/jewellery?category=${cat.toLowerCase().replace(/\s/g,'-')}" style="display:flex;flex-direction:column;align-items:center;gap:12px;text-decoration:none;">
      <div style="width:88px;height:88px;border-radius:50%;background:#f5ede2;border:2px solid #e5e0d8;overflow:hidden;"></div>
      <span style="font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#4a4a4a;">${cat}</span>
    </a>`).join('')}
  </div>
</section>`,
  },
  {
    id: 'jw-products-grid',
    label: 'Products Grid',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>`,
    content: `
<section style="padding:64px 40px;background:#fdf8f3;">
  <div style="max-width:1280px;margin:0 auto;">
    <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;text-align:center;margin-bottom:12px;">Featured</p>
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;text-align:center;color:#1a1a1a;margin-bottom:40px;">Our Selection</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
      ${[1,2,3,4].map(i => `
      <div style="background:#fff;border:1px solid #e5e0d8;">
        <div style="aspect-ratio:1;background:#f5ede2;display:flex;align-items:center;justify-content:center;font-size:48px;">💍</div>
        <div style="padding:16px;">
          <p style="font-size:10px;color:#b8860b;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">18K Yellow Gold</p>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;color:#1a1a1a;margin-bottom:12px;">Jewellery Piece ${i}</h3>
          <a href="#" style="display:block;background:#25D366;color:#fff;text-align:center;padding:10px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;">Enquire on WhatsApp</a>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`,
  },
  {
    id: 'jw-promo-strip',
    label: 'Promo Strip',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="1"/></svg>`,
    content: `
<div style="display:grid;grid-template-columns:repeat(3,1fr);">
  <a href="/jewellery?is_new=true" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#1a1a1a;text-decoration:none;"><span style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;letter-spacing:0.03em;">New Arrivals</span></a>
  <a href="/jewellery?sort=featured" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#b8860b;text-decoration:none;"><span style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;letter-spacing:0.03em;">Best Seller</span></a>
  <a href="/jewellery?on_sale=true" style="display:flex;align-items:center;justify-content:center;padding:28px;background:#3d2b1a;text-decoration:none;"><span style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff;letter-spacing:0.03em;">Clearance Sale</span></a>
</div>`,
  },
  {
    id: 'jw-brand-story',
    label: 'Brand Story',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h10"/></svg>`,
    content: `
<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
    <div>
      <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px;">Our Promise</p>
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#1a1a1a;line-height:1.1;margin-bottom:20px;">Handcrafted &amp; Ethically Sourced</h2>
      <div style="width:40px;height:1px;background:#b8860b;margin-bottom:24px;"></div>
      <p style="font-size:14px;color:#6b6b6b;line-height:1.9;margin-bottom:32px;">With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces that tell your unique story.</p>
      <a href="/about" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px;text-decoration:none;">Learn More →</a>
    </div>
    <div style="aspect-ratio:4/5;background:#f5ede2;overflow:hidden;">
      <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80" alt="Craftsmanship" style="width:100%;height:100%;object-fit:cover;"/>
    </div>
  </div>
</section>`,
  },
  {
    id: 'jw-editorial-banner',
    label: 'Editorial Banner',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h10M7 12h6"/></svg>`,
    content: `
<div style="position:relative;min-height:400px;overflow:hidden;background:#1a1a1a;">
  <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80" alt="Collection" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.5;"/>
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:60px 80px;min-height:400px;">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:300;color:#fff;line-height:1;margin-bottom:16px;">Classics</h2>
    <p style="font-size:14px;color:rgba(255,255,255,0.65);max-width:400px;line-height:1.7;margin-bottom:28px;">Timeless and elegant jewellery that never goes out of style.</p>
    <a href="/jewellery?collection=classics" style="font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px;text-decoration:none;">Discover the selection</a>
  </div>
</div>`,
  },
  {
    id: 'jw-collection-banners',
    label: 'Collection Banners (2-col)',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/></svg>`,
    content: `
<div style="display:grid;grid-template-columns:1fr 1fr;">
  <div style="position:relative;min-height:400px;overflow:hidden;background:#1a1a1a;">
    <img src="https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80" alt="Summer" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55;"/>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:40px;">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#fff;margin-bottom:12px;">Summer Collections</h3>
      <p style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:24px;">Freshwater pearl necklace and earrings</p>
      <a href="/jewellery" style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px;text-decoration:none;">Explore</a>
    </div>
  </div>
  <div style="position:relative;min-height:400px;overflow:hidden;background:#1a1a1a;">
    <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80" alt="Memorable" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55;"/>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:40px;">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#fff;margin-bottom:12px;">Make it Memorable</h3>
      <p style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:24px;">Bespoke jewellery for life's moments</p>
      <a href="/custom" style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px;text-decoration:none;">Explore</a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'jw-whatsapp-cta',
    label: 'WhatsApp CTA',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    content: `
<section style="padding:64px 40px;background:#f5ede2;text-align:center;">
  <h2 style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#1a1a1a;margin-bottom:12px;">Have a Question?</h2>
  <p style="font-size:14px;color:#6b6b6b;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.7;">Chat with our jewellery experts on WhatsApp. We respond within minutes.</p>
  <a href="https://wa.me/971501234567" style="display:inline-flex;align-items:center;gap:10px;background:#1a7a35;color:#fff;padding:14px 40px;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;">💬 Chat on WhatsApp</a>
</section>`,
  },
  {
    id: 'jw-appointment-cta',
    label: 'Book Appointment',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    content: `
<section style="padding:80px 40px;background:#1a1a1a;text-align:center;">
  <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px;">Private Consultation</p>
  <h2 style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#fff;margin-bottom:16px;">Book an Appointment</h2>
  <p style="font-size:14px;color:rgba(255,255,255,0.55);max-width:480px;margin:0 auto 36px;line-height:1.7;">Experience our collection in person at any of our boutiques. Our jewellery experts will guide you.</p>
  <a href="/appointment" style="display:inline-block;background:#b8860b;color:#fff;padding:16px 48px;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">Book Now</a>
</section>`,
  },
  {
    id: 'jw-testimonials',
    label: 'Testimonials',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>`,
    content: `
<section style="padding:80px 40px;background:#1a1a1a;">
  <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;text-align:center;margin-bottom:48px;">What Our Clients Say</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;">
    ${[
      ['Sarah Al-Rashidi','Dubai','The craftsmanship is extraordinary. My engagement ring is everything I dreamed of.'],
      ['Ahmed Al-Mansoori','Abu Dhabi','TEJORI created a bespoke piece for my wife\'s anniversary. Unmatched quality.'],
      ['Priya Sharma','Dubai','Three generations of my family have trusted TEJORI. True investments in beauty.'],
    ].map(([name, city, review]) => `
    <div style="border:1px solid rgba(184,134,11,0.3);padding:32px;">
      <div style="color:#b8860b;font-size:20px;margin-bottom:16px;">★★★★★</div>
      <p style="color:rgba(255,255,255,0.75);font-size:13px;line-height:1.8;font-style:italic;margin-bottom:20px;">"${review}"</p>
      <p style="color:#b8860b;font-size:12px;font-weight:600;">— ${name}, ${city}</p>
    </div>`).join('')}
  </div>
</section>`,
  },
  {
    id: 'jw-newsletter',
    label: 'Newsletter',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    content: `
<section style="padding:64px 40px;background:#1a1a1a;text-align:center;">
  <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px;">Stay Connected</p>
  <h2 style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:12px;">Stay in the world of Tejori</h2>
  <p style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:32px;letter-spacing:0.05em;">Subscribe for 10% off your first purchase.</p>
  <div style="display:flex;max-width:440px;margin:0 auto;">
    <input type="email" placeholder="Your email address" style="flex:1;padding:14px 18px;border:1px solid rgba(255,255,255,0.15);border-right:none;background:rgba(255,255,255,0.06);color:#fff;font-size:12px;outline:none;"/>
    <button style="padding:14px 24px;background:#b8860b;color:#fff;border:none;cursor:pointer;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;white-space:nowrap;">Subscribe</button>
  </div>
</section>`,
  },
  {
    id: 'jw-cert-logos',
    label: 'Certification Badges',
    category: '✦ Jewellery',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>`,
    content: `
<div style="padding:24px 40px;background:#fff;border-top:1px solid #f0ede8;border-bottom:1px solid #f0ede8;text-align:center;">
  <p style="font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:16px;">Certified by</p>
  <div style="display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap;">
    ${['GIA Certified','IGI Certified','HRD Antwerp','AGS','GCAL'].map(c => `
    <span style="font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:400;color:rgba(0,0,0,0.2);letter-spacing:0.1em;text-transform:uppercase;">${c}</span>`).join('')}
  </div>
</div>`,
  },
  // Standard blocks
  { id: 'std-heading',   label: 'Heading',    category: '⬜ Basic', content: `<h2 style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#1a1a1a;text-align:center;padding:40px;">Your Heading Here</h2>` },
  { id: 'std-text',      label: 'Text Block', category: '⬜ Basic', content: `<p style="font-size:15px;color:#6b6b6b;line-height:1.9;max-width:720px;margin:0 auto;padding:32px 40px;">Your paragraph text goes here. Click to edit.</p>` },
  { id: 'std-image',     label: 'Image',      category: '⬜ Basic', content: `<img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=1400&q=80" alt="Image" style="width:100%;height:400px;object-fit:cover;display:block;"/>` },
  { id: 'std-button',    label: 'Button',     category: '⬜ Basic', content: `<div style="text-align:center;padding:24px;"><a href="#" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 40px;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">Button Text</a></div>` },
  { id: 'std-divider',   label: 'Divider',    category: '⬜ Basic', content: `<div style="display:flex;align-items:center;gap:20px;padding:32px 80px;"><div style="flex:1;height:1px;background:#e5e0d8;"></div><span style="font-size:18px;color:#b8860b;">✦</span><div style="flex:1;height:1px;background:#e5e0d8;"></div></div>` },
  { id: 'std-spacer',    label: 'Spacer',     category: '⬜ Basic', content: `<div style="height:80px;"></div>` },
  { id: 'std-2col',      label: '2 Columns',  category: '⬜ Layout', content: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:40px;max-width:1280px;margin:0 auto;"><div style="padding:24px;background:#f5f5f5;min-height:120px;">Column 1</div><div style="padding:24px;background:#f5f5f5;min-height:120px;">Column 2</div></div>` },
  { id: 'std-3col',      label: '3 Columns',  category: '⬜ Layout', content: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;padding:40px;max-width:1280px;margin:0 auto;"><div style="padding:20px;background:#f5f5f5;min-height:100px;">Col 1</div><div style="padding:20px;background:#f5f5f5;min-height:100px;">Col 2</div><div style="padding:20px;background:#f5f5f5;min-height:100px;">Col 3</div></div>` },
];

// ── GrapesJS custom CSS injected into canvas ──────────────────
const CANVAS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
  a { cursor: pointer; }
  input, button { font-family: inherit; }
`;

export default function PageBuilderPage() {
  const { collapsed } = useOutletContext() || {};
  const editorRef     = useRef(null);
  const containerRef  = useRef(null);
  const [activePage,  setActivePage]  = useState('homepage');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [gjsReady,    setGjsReady]    = useState(false);
  const [device,      setDevice]      = useState('desktop');
  const prevPageRef   = useRef(null);

  // ── Load GrapesJS from CDN once ───────────────────────────────
  useEffect(() => {
    // Inject CSS
    if (!document.getElementById('gjs-css')) {
      const link = document.createElement('link');
      link.id   = 'gjs-css';
      link.rel  = 'stylesheet';
      link.href = GJS_CSS;
      document.head.appendChild(link);
    }
    // Inject JS
    if (window.grapesjs) { setGjsReady(true); return; }
    if (document.getElementById('gjs-js')) return;
    const script  = document.createElement('script');
    script.id     = 'gjs-js';
    script.src    = GJS_JS;
    script.onload = () => setGjsReady(true);
    script.onerror = () => toast.error('Failed to load GrapesJS. Check your internet connection.');
    document.head.appendChild(script);
    return () => {};
  }, []);

  // ── Init GrapesJS once CDN is ready + container mounted ───────
  useEffect(() => {
    if (!gjsReady || !containerRef.current) return;
    if (editorRef.current) return; // already initialised

    const gjs = window.grapesjs;

    const editor = gjs.init({
      container:    containerRef.current,
      height:       '100%',
      storageManager: false,
      fromElement:  false,
      components:   '',
      style:        '',
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@300;400;500;600&display=swap',
        ],
        scripts: [],
      },
      deviceManager: {
        devices: [
          { name:'Desktop',  width:'' },
          { name:'Tablet',   width:'768px' },
          { name:'Mobile',   width:'390px' },
        ],
      },
      styleManager: {
        sectors: [
          { name:'Typography',  properties:['font-family','font-size','font-weight','font-style','color','text-align','line-height','letter-spacing','text-decoration','text-transform'] },
          { name:'Spacing',     properties:['padding','padding-top','padding-bottom','padding-left','padding-right','margin','margin-top','margin-bottom','margin-left','margin-right'] },
          { name:'Layout',      properties:['display','width','max-width','height','min-height','flex-direction','align-items','justify-content','gap','grid-template-columns'] },
          { name:'Background',  properties:['background-color','background-image','background-size','background-position','opacity'] },
          { name:'Border',      properties:['border','border-color','border-width','border-style','border-radius'] },
          { name:'Position',    properties:['position','top','right','bottom','left','z-index','overflow'] },
        ],
      },
      blockManager: { appendTo: '#gjs-block-panel', blocks: [] },
      panels: {
        defaults: [
          {
            id: 'views',
            el: '.panel__right',
            buttons: [
              { id:'open-sm',    label:'Style',   command:'open-sm',    active:true },
              { id:'open-layers',label:'Layers',  command:'open-layers' },
              { id:'open-traits',label:'Settings',command:'open-traits' },
            ],
          },
        ],
      },
    });

    // Inject base CSS into canvas
    editor.CssComposer.clear();
    editor.CssComposer.setRule('*', { 'box-sizing':'border-box' });

    // Register all blocks
    BLOCKS.forEach(block => {
      editor.BlockManager.add(block.id, {
        label:    block.label,
        category: block.category,
        media:    block.media || '',
        content:  block.content,
      });
    });

    editorRef.current = editor;
    // Now load the default page
    loadPage('homepage', editor);
    // eslint-disable-next-line
  }, [gjsReady]);

  // ── Load page content into editor ─────────────────────────────
  const loadPage = useCallback(async (pageId, editorInstance) => {
    const ed = editorInstance || editorRef.current;
    if (!ed) return;
    setLoading(true);
    try {
      const res  = await api.get(`/settings/page/${pageId}`);
      const data = res.data?.data;
      if (data?.html !== undefined) {
        ed.setComponents(data.html || '');
        ed.setStyle(data.css || '');
      } else {
        ed.setComponents('');
        ed.setStyle('');
      }
    } catch {
      ed.setComponents('');
      ed.setStyle('');
    }
    setLoading(false);
  }, []);

  // ── Switch page ───────────────────────────────────────────────
  const handlePageChange = (pageId) => {
    if (pageId === activePage) return;
    setActivePage(pageId);
    loadPage(pageId);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    const ed = editorRef.current;
    if (!ed) return;
    setSaving(true);
    try {
      const payload = {
        html: ed.getHtml(),
        css:  ed.getCss({ avoidProtected: true }),
      };
      await api.post(`/settings/page/${activePage}`, payload);
      toast.success('Page saved — storefront updated ✓');
    } catch {
      toast.error('Save failed — try again');
    }
    setSaving(false);
  };

  // ── Device toggle ─────────────────────────────────────────────
  const setEditorDevice = (d) => {
    setDevice(d);
    const ed = editorRef.current;
    if (!ed) return;
    const nameMap = { desktop:'Desktop', tablet:'Tablet', mobile:'Mobile' };
    ed.setDevice(nameMap[d]);
  };

  // ── Clear page ────────────────────────────────────────────────
  const handleClear = () => {
    if (!confirm('Clear all content on this page? This cannot be undone.')) return;
    editorRef.current?.setComponents('');
    editorRef.current?.setStyle('');
    toast('Page cleared — save to publish');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#f0f0f0' }}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:52, background:'#fff', borderBottom:'1px solid #e5e5e5', flexShrink:0, zIndex:10 }}>

        {/* Page selector */}
        <div style={{ display:'flex', gap:2 }}>
          {PAGES.map(p => (
            <button key={p.id} onClick={() => handlePageChange(p.id)}
              style={{
                padding:'5px 12px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                background: activePage === p.id ? '#1a1a1a' : 'transparent',
                color: activePage === p.id ? '#fff' : '#555',
                transition:'all 0.15s',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1 }}/>

        {/* Device toggle */}
        <div style={{ display:'flex', gap:2, background:'#f5f5f5', borderRadius:8, padding:3 }}>
          {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([d, Icon]) => (
            <button key={d} onClick={() => setEditorDevice(d)}
              style={{
                padding:'5px 8px', borderRadius:6, border:'none', cursor:'pointer',
                background: device === d ? '#fff' : 'transparent',
                color: device === d ? '#b8860b' : '#888',
                boxShadow: device === d ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition:'all 0.15s',
              }}>
              <Icon size={15}/>
            </button>
          ))}
        </div>

        {/* Actions */}
        <button onClick={handleClear}
          style={{ padding:'6px 12px', borderRadius:6, border:'1px solid #e5e5e5', background:'#fff', color:'#888', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <RefreshCw size={12}/> Clear
        </button>

        <a href="http://localhost:3001" target="_blank" rel="noreferrer"
          style={{ padding:'6px 12px', borderRadius:6, border:'1px solid #e5e5e5', background:'#fff', color:'#555', fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
          <Eye size={12}/> Preview
        </a>

        <button onClick={handleSave} disabled={saving}
          style={{
            padding:'6px 16px', borderRadius:6, border:'none', cursor: saving ? 'not-allowed' : 'pointer',
            background: saving ? '#aaa' : '#b8860b', color:'#fff', fontSize:12, fontWeight:600,
            display:'flex', alignItems:'center', gap:5, transition:'background 0.15s',
          }}>
          <Save size={12}/> {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>

      {/* ── Editor body: blocks | canvas | panels ─────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Block panel */}
        <div style={{ width:200, background:'#fff', borderRight:'1px solid #e5e5e5', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>
          <div style={{ padding:'10px 12px', fontSize:10, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'#aaa', borderBottom:'1px solid #f0f0f0' }}>
            Blocks
          </div>
          <div id="gjs-block-panel" style={{ flex:1 }}/>
        </div>

        {/* GrapesJS canvas */}
        <div style={{ flex:1, position:'relative' }}>
          {(loading || !gjsReady) && (
            <div style={{ position:'absolute', inset:0, background:'#f8f8f8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:5, gap:12 }}>
              <div style={{ width:32, height:32, border:'2px solid #b8860b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
              <p style={{ fontSize:13, color:'#888' }}>{!gjsReady ? 'Loading GrapesJS…' : 'Loading page content…'}</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          <div ref={containerRef} style={{ width:'100%', height:'100%' }}/>
        </div>

        {/* GrapesJS right panels (style, layers, traits) */}
        <div className="panel__right" style={{ width:260, background:'#fff', borderLeft:'1px solid #e5e5e5', flexShrink:0, overflowY:'auto' }}/>
      </div>

      {/* Inject GrapesJS theme overrides */}
      <style>{`
        #gjs-block-panel .gjs-block-categories { padding: 0; }
        #gjs-block-panel .gjs-block-category .gjs-block-category__title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; padding: 8px 12px 4px;
          color: #888; background: #fafafa; border-bottom: 1px solid #f0f0f0;
        }
        #gjs-block-panel .gjs-blocks-c { display: flex; flex-direction: column; gap: 2px; padding: 4px 8px 8px; }
        #gjs-block-panel .gjs-block {
          width: 100% !important; min-height: 40px !important; padding: 8px 10px !important;
          border: 1px solid #efefef !important; border-radius: 6px !important;
          background: #fff !important; display: flex !important; align-items: center !important;
          gap: 8px !important; text-align: left !important; cursor: grab !important;
          transition: all 0.15s !important;
        }
        #gjs-block-panel .gjs-block:hover { border-color: #b8860b !important; background: #fdf8ee !important; }
        #gjs-block-panel .gjs-block__media { width: 20px !important; height: 20px !important; margin: 0 !important; flex-shrink: 0 !important; }
        #gjs-block-panel .gjs-block__media svg { width: 16px; height: 16px; stroke: #888; }
        #gjs-block-panel .gjs-block-label { font-size: 12px !important; color: #333 !important; font-weight: 500 !important; }
        .gjs-editor { border: none !important; }
        .gjs-frame-wrapper { background: #e8e8e8 !important; }
        .gjs-cv-canvas { background: #e8e8e8 !important; }
        .panel__right .gjs-sm-sector-title { font-size: 10px !important; font-weight: 700 !important; letter-spacing: 0.07em !important; text-transform: uppercase !important; background: #fafafa !important; }
        .panel__right .gjs-pn-buttons { display: flex; gap: 4px; padding: 8px; border-bottom: 1px solid #efefef; }
        .panel__right .gjs-pn-btn { padding: 5px 10px !important; font-size: 11px !important; border-radius: 5px !important; }
        .panel__right .gjs-pn-active { background: #1a1a1a !important; color: #fff !important; }
      `}</style>
    </div>
  );
}
