/**
 * VANTIX-CMS — GrapesJS Page Builder (npm, not CDN)
 *
 * ✅ GrapesJS loaded from npm (already in package.json)
 * ✅ Full-screen layout (route is outside AppLayout in App.jsx)
 * ✅ Save/load to /api/pages/:slug (backend pages module)
 * ✅ 12 jewellery-specific drag-drop blocks
 * ✅ Style / Traits / Layers right panel
 * ✅ Device preview: Desktop / Tablet / Mobile
 * ✅ Undo/Redo / Clear
 * ✅ Save Draft + Publish buttons
 * ✅ Create new custom pages
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = '/api';

// ── Pages ─────────────────────────────────────────────────────────────────────
const DEFAULT_PAGES = [
  { slug: 'home',       label: 'Homepage',        icon: '🏠' },
  { slug: 'about',      label: 'About Us',         icon: '✦' },
  { slug: 'bespoke',    label: 'Bespoke & Custom', icon: '💍' },
  { slug: 'lab-grown',  label: 'Lab Grown',        icon: '💎' },
  { slug: 'heritage',   label: 'Our Heritage',     icon: '📜' },
  { slug: 'care-guide', label: 'Care Guide',       icon: '✨' },
  { slug: 'faq',        label: 'FAQ',              icon: '❓' },
];

// ── Register jewellery blocks ─────────────────────────────────────────────────
function registerJewelleryBlocks(editor) {
  const bm = editor.BlockManager;

  const blocks = [
    {
      id: 'jw-hero',
      label: '🖼 Hero Banner',
      category: '💍 Jewellery',
      content: `<section style="position:relative;width:100%;min-height:600px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;overflow:hidden;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);"></div>
  <div style="position:relative;z-index:2;text-align:center;color:#fff;max-width:800px;padding:40px 20px;">
    <p style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">New Collection 2025</p>
    <h1 style="font-size:52px;font-weight:300;line-height:1.2;margin-bottom:24px;font-family:Georgia,serif;">Timeless Elegance<br>in Every Detail</h1>
    <p style="font-size:16px;color:rgba(255,255,255,0.75);margin-bottom:40px;line-height:1.6;">Discover our curated collection of fine jewellery crafted with rare gemstones and precious metals.</p>
    <a href="#" style="display:inline-block;padding:14px 40px;border:1px solid #c9a96e;color:#c9a96e;text-decoration:none;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Explore Collection</a>
  </div>
</section>`,
    },
    {
      id: 'jw-categories',
      label: '⬡ Category Circles',
      category: '💍 Jewellery',
      content: `<section style="padding:80px 40px;background:#fff;text-align:center;">
  <h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;margin-bottom:48px;color:#1a1a1a;">Shop by Category</h2>
  <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;">
    <div style="text-align:center;cursor:pointer;"><div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:40px;">💍</span></div><p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">Rings</p></div>
    <div style="text-align:center;cursor:pointer;"><div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:40px;">📿</span></div><p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">Necklaces</p></div>
    <div style="text-align:center;cursor:pointer;"><div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:40px;">✨</span></div><p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">Earrings</p></div>
    <div style="text-align:center;cursor:pointer;"><div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:40px;">💎</span></div><p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">Diamonds</p></div>
    <div style="text-align:center;cursor:pointer;"><div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:40px;">👑</span></div><p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">Bridal</p></div>
  </div>
</section>`,
    },
    {
      id: 'jw-products',
      label: '▦ Products Grid',
      category: '💍 Jewellery',
      content: `<section style="padding:80px 40px;background:#faf8f5;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:48px;">
      <h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#1a1a1a;">Featured Pieces</h2>
      <a href="#" style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;border-bottom:1px solid #c9a96e;padding-bottom:3px;">View All</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
      <div style="background:#fff;border:1px solid #f0ebe3;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;">💍</span></div><div style="padding:20px;"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:6px;">18K Rose Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin-bottom:6px;">Diamond Solitaire Ring</h3><p style="font-size:14px;color:#c9a96e;margin-bottom:14px;">AED 12,500</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div>
      <div style="background:#fff;border:1px solid #f0ebe3;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;">📿</span></div><div style="padding:20px;"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:6px;">22K Yellow Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin-bottom:6px;">Emerald Necklace</h3><p style="font-size:14px;color:#c9a96e;margin-bottom:14px;">AED 8,900</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div>
      <div style="background:#fff;border:1px solid #f0ebe3;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;">✨</span></div><div style="padding:20px;"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:6px;">18K White Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin-bottom:6px;">Pearl Drop Earrings</h3><p style="font-size:14px;color:#c9a96e;margin-bottom:14px;">AED 5,200</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div>
      <div style="background:#fff;border:1px solid #f0ebe3;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;">💎</span></div><div style="padding:20px;"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:6px;">IGI Certified</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin-bottom:6px;">Lab Diamond Bracelet</h3><p style="font-size:14px;color:#c9a96e;margin-bottom:14px;">AED 18,000</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div>
    </div>
  </div>
</section>`,
    },
    {
      id: 'jw-whatsapp',
      label: '📱 WhatsApp CTA',
      category: '💍 Jewellery',
      content: `<section style="padding:80px 40px;background:#1a1a1a;text-align:center;">
  <p style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">Personal Shopping</p>
  <h2 style="font-family:Georgia,serif;font-size:36px;font-weight:300;color:#fff;margin-bottom:20px;">Have Questions About a Piece?</h2>
  <p style="font-size:15px;color:rgba(255,255,255,0.65);margin-bottom:40px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;">Our jewellery specialists are available to assist you personally via WhatsApp.</p>
  <a href="https://wa.me/971500000000" style="display:inline-flex;align-items:center;gap:12px;padding:15px 40px;background:#25D366;color:#fff;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    Chat on WhatsApp
  </a>
</section>`,
    },
    {
      id: 'jw-appointment',
      label: '📅 Book Appointment',
      category: '💍 Jewellery',
      content: `<section style="padding:100px 40px;background:linear-gradient(135deg,#f5f0e8 0%,#ede4d0 100%);text-align:center;">
  <p style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">Private Consultation</p>
  <h2 style="font-family:Georgia,serif;font-size:40px;font-weight:300;color:#1a1a1a;margin-bottom:20px;">Visit Our Boutique</h2>
  <p style="font-size:15px;color:#666;margin-bottom:48px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;">Book a private appointment with our jewellery specialists for an exclusive boutique experience.</p>
  <a href="/book-appointment" style="display:inline-block;padding:15px 48px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Book an Appointment</a>
</section>`,
    },
    {
      id: 'jw-brand-story',
      label: '📖 Brand Story',
      category: '💍 Jewellery',
      content: `<section style="padding:100px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
    <div style="aspect-ratio:4/5;background:linear-gradient(135deg,#f5f0e8,#ede4d0);display:flex;align-items:center;justify-content:center;"><span style="font-size:80px;">✦</span></div>
    <div>
      <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:20px;">Our Story</p>
      <h2 style="font-family:Georgia,serif;font-size:36px;font-weight:300;color:#1a1a1a;margin-bottom:24px;line-height:1.3;">Crafting Excellence<br>Since 1985</h2>
      <p style="font-size:15px;color:#666;line-height:1.8;margin-bottom:24px;">For four decades, we have been dedicated to creating jewellery that transcends time. Each piece is a testament to our commitment to exceptional craftsmanship and ethically sourced materials.</p>
      <a href="/about" style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;text-decoration:none;border-bottom:1px solid #1a1a1a;padding-bottom:4px;">Read Our Story</a>
    </div>
  </div>
</section>`,
    },
    {
      id: 'jw-collection-banners',
      label: '⬛⬛ Collection Banners',
      category: '💍 Jewellery',
      content: `<section style="padding:40px;background:#faf8f5;">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div style="position:relative;min-height:500px;background:#2d1f1f;display:flex;align-items:flex-end;overflow:hidden;cursor:pointer;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.15;font-size:120px;">💍</div>
      <div style="position:relative;z-index:2;padding:40px;color:#fff;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin-bottom:12px;">Exclusive</p>
        <h3 style="font-family:Georgia,serif;font-size:28px;font-weight:300;margin-bottom:20px;">Bridal Collection</h3>
        <a href="#" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:3px;">Discover More</a>
      </div>
    </div>
    <div style="position:relative;min-height:500px;background:#1f2d2d;display:flex;align-items:flex-end;overflow:hidden;cursor:pointer;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.15;font-size:120px;">💎</div>
      <div style="position:relative;z-index:2;padding:40px;color:#fff;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin-bottom:12px;">Exclusive</p>
        <h3 style="font-family:Georgia,serif;font-size:28px;font-weight:300;margin-bottom:20px;">Men's Collection</h3>
        <a href="#" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:3px;">Discover More</a>
      </div>
    </div>
  </div>
</section>`,
    },
    {
      id: 'jw-promo-strip',
      label: '━ Promo Strip',
      category: '💍 Jewellery',
      content: `<div style="background:#c9a96e;padding:14px 40px;display:flex;justify-content:center;gap:60px;flex-wrap:wrap;">
  <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;">✦ Complimentary Gift Wrapping</span>
  <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;">✦ Free UAE Delivery over AED 500</span>
  <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;">✦ IGI & GIA Certified Diamonds</span>
  <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fff;">✦ WhatsApp Support 9am–10pm</span>
</div>`,
    },
    {
      id: 'jw-testimonials',
      label: '★ Testimonials',
      category: '💍 Jewellery',
      content: `<section style="padding:100px 40px;background:#1a1a1a;text-align:center;">
  <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">Client Stories</p>
  <h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#fff;margin-bottom:64px;">What Our Clients Say</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;max-width:1100px;margin:0 auto;">
    <div style="padding:40px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:20px;margin-bottom:20px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.8;margin-bottom:24px;font-style:italic;">"The engagement ring exceeded every expectation. The team guided us through every detail with patience and expertise."</p><p style="font-size:13px;font-weight:600;color:#fff;">Sarah Al-Rashid</p><p style="font-size:12px;color:#999;">Dubai</p></div>
    <div style="padding:40px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:20px;margin-bottom:20px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.8;margin-bottom:24px;font-style:italic;">"Exceptional quality and service. My wife was overwhelmed with joy. Will definitely return for our anniversary."</p><p style="font-size:13px;font-weight:600;color:#fff;">Mohammed Al-Farsi</p><p style="font-size:12px;color:#999;">Abu Dhabi</p></div>
    <div style="padding:40px;background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:20px;margin-bottom:20px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.8;margin-bottom:24px;font-style:italic;">"Beautiful craftsmanship and the certification process gave me complete confidence in my purchase."</p><p style="font-size:13px;font-weight:600;color:#fff;">Priya Menon</p><p style="font-size:12px;color:#999;">Sharjah</p></div>
  </div>
</section>`,
    },
    {
      id: 'jw-cert-badges',
      label: '🏅 Certification Badges',
      category: '💍 Jewellery',
      content: `<section style="padding:60px 40px;background:#f5f0e8;text-align:center;">
  <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#999;margin-bottom:40px;">Authenticity Guaranteed</p>
  <div style="display:flex;justify-content:center;gap:60px;flex-wrap:wrap;">
    <div style="text-align:center;"><div style="width:80px;height:80px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:28px;">🏅</span></div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;">IGI Certified</p></div>
    <div style="text-align:center;"><div style="width:80px;height:80px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:28px;">💎</span></div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;">GIA Graded</p></div>
    <div style="text-align:center;"><div style="width:80px;height:80px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:28px;">✅</span></div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;">BIS Hallmarked</p></div>
    <div style="text-align:center;"><div style="width:80px;height:80px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:28px;">🌿</span></div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;">Conflict-Free</p></div>
  </div>
</section>`,
    },
    {
      id: 'jw-newsletter',
      label: '✉ Newsletter',
      category: '💍 Jewellery',
      content: `<section style="padding:80px 40px;background:#faf8f5;text-align:center;">
  <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">Stay Connected</p>
  <h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#1a1a1a;margin-bottom:16px;">First Access to New Collections</h2>
  <p style="font-size:14px;color:#666;margin-bottom:40px;">Subscribe to receive exclusive previews and invitations to private events.</p>
  <div style="display:flex;gap:0;max-width:480px;margin:0 auto;">
    <input type="email" placeholder="Your email address" style="flex:1;padding:14px 20px;border:1px solid #ddd;background:#fff;font-size:14px;outline:none;"/>
    <button style="padding:14px 32px;background:#1a1a1a;color:#fff;border:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;">Subscribe</button>
  </div>
</section>`,
    },
    {
      id: 'jw-editorial',
      label: '📸 Editorial Banner',
      category: '💍 Jewellery',
      content: `<section style="position:relative;min-height:500px;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);display:flex;align-items:center;overflow:hidden;">
  <div style="position:absolute;right:0;top:0;bottom:0;width:50%;background:rgba(201,169,110,0.08);display:flex;align-items:center;justify-content:center;font-size:120px;">💎</div>
  <div style="position:relative;z-index:2;padding:80px;max-width:560px;">
    <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin-bottom:20px;">Limited Edition</p>
    <h2 style="font-family:Georgia,serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:24px;line-height:1.3;">The Constellation<br>Diamond Series</h2>
    <p style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:40px;">Inspired by the night sky over the Arabian desert. Each piece set with hand-selected diamonds.</p>
    <a href="#" style="display:inline-block;padding:14px 40px;background:#c9a96e;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Discover</a>
  </div>
</section>`,
    },
  ];

  blocks.forEach(b => {
    bm.add(b.id, {
      label: b.label,
      category: b.category,
      content: b.content,
    });
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PageBuilderPage() {
  const navigate        = useNavigate();
  const containerRef    = useRef(null);
  const editorRef       = useRef(null);
  const initDone        = useRef(false);

  const [pages,       setPages]       = useState(DEFAULT_PAGES);
  const [activePage,  setActivePage]  = useState(DEFAULT_PAGES[0]);
  const [rightTab,    setRightTab]    = useState('style');
  const [device,      setDevice]      = useState('desktop');
  const [saving,      setSaving]      = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [newModal,    setNewModal]    = useState(false);
  const [newPage,     setNewPage]     = useState({ title: '', slug: '' });

  // ── Init GrapesJS once ──────────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current || !containerRef.current) return;
    initDone.current = true;

    (async () => {
      let grapesjs;
      try {
        const mod = await import('grapesjs');
        grapesjs = mod.default || mod;
      } catch (e) {
        console.error('[PageBuilder] grapesjs not installed. Run: cd admin && npm install grapesjs', e);
        return;
      }

      // Try loading preset (optional — graceful fallback if not installed)
      let presetPlugin = null;
      try {
        const pm = await import('grapesjs-preset-webpage');
        presetPlugin = pm.default || pm;
      } catch (_) {}

      if (!containerRef.current) return;

      const editor = grapesjs.init({
        container:      containerRef.current,
        height:         '100%',
        width:          'auto',
        storageManager: false,
        plugins:        presetPlugin ? [presetPlugin] : [],
        pluginsOpts:    presetPlugin ? { [presetPlugin]: { blocks: ['link-block', 'quote'] } } : {},
        blockManager:   { appendTo: '#gjsBlocks' },
        styleManager:   {
          appendTo: '#gjsStyles',
          sectors: [
            { name: 'Typography', open: true,  properties: ['font-family','font-size','font-weight','color','text-align','line-height','letter-spacing','text-transform'] },
            { name: 'Spacing',    open: false, properties: ['margin','padding'] },
            { name: 'Size',       open: false, properties: ['width','min-width','max-width','height','min-height'] },
            { name: 'Layout',     open: false, properties: ['display','flex-direction','align-items','justify-content','gap'] },
            { name: 'Background', open: false, properties: ['background-color','background-image','background-size','background-position'] },
            { name: 'Border',     open: false, properties: ['border','border-radius','box-shadow'] },
            { name: 'Position',   open: false, properties: ['position','top','right','bottom','left','z-index','overflow'] },
          ],
        },
        traitManager:  { appendTo: '#gjsTraits' },
        layerManager:  { appendTo: '#gjsLayers' },
        panels:        { defaults: [] },
        canvas: {
          styles: ['https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;700&family=Inter:wght@300;400;500&display=swap'],
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet',  width: '768px',  widthMedia: '992px' },
            { name: 'Mobile',  width: '375px',  widthMedia: '480px' },
          ],
        },
      });

      editorRef.current = editor;
      registerJewelleryBlocks(editor);
      await loadPageContent(DEFAULT_PAGES[0].slug, editor);
    })();

    return () => {
      if (editorRef.current) {
        try { editorRef.current.destroy(); } catch (_) {}
        editorRef.current = null;
        initDone.current  = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load page into editor ───────────────────────────────────────────────────
  const loadPageContent = useCallback(async (slug, editor) => {
    const gjs = editor || editorRef.current;
    if (!gjs) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API}/pages/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const pg = data.data;
        if (pg.grapes_data && typeof pg.grapes_data === 'object' && Object.keys(pg.grapes_data).length > 0) {
          gjs.loadProjectData(pg.grapes_data);
        } else if (pg.html_content) {
          gjs.setComponents(pg.html_content);
          if (pg.css_content) gjs.setStyle(pg.css_content);
        } else {
          gjs.setComponents('');
          gjs.setStyle('');
        }
      }
    } catch (e) {
      // Page may not exist yet in DB — blank canvas is correct behaviour
      if (editorRef.current) { editorRef.current.setComponents(''); editorRef.current.setStyle(''); }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Switch page ─────────────────────────────────────────────────────────────
  const switchPage = useCallback(async (pg) => {
    if (pg.slug === activePage.slug) return;
    setActivePage(pg);
    await loadPageContent(pg.slug);
  }, [activePage.slug, loadPageContent]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = useCallback(async (publish = false) => {
    const gjs = editorRef.current;
    if (!gjs) return;
    publish ? setPublishing(true) : setSaving(true);
    setSaveMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/pages/${activePage.slug}`, {
        html:        gjs.getHtml(),
        css:         gjs.getCss(),
        grapes_data: gjs.getProjectData(),
        status:      publish ? 'published' : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaveMsg(publish ? '✓ Published' : '✓ Saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg('✗ ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false); setPublishing(false);
    }
  }, [activePage.slug]);

  // ── Device ──────────────────────────────────────────────────────────────────
  const setEditorDevice = (d) => {
    setDevice(d);
    const map = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
    editorRef.current?.setDevice(map[d]);
  };

  // ── Create new page ─────────────────────────────────────────────────────────
  const createPage = async () => {
    if (!newPage.title || !newPage.slug) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API}/pages`, newPage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const pg = { slug: data.data.slug, label: data.data.title, icon: '📄' };
        setPages(prev => [...prev, pg]);
        setNewModal(false);
        setNewPage({ title: '', slug: '' });
        switchPage(pg);
      }
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div style={s.topLeft}>
          <button onClick={() => navigate('/')} style={s.backBtn} title="Back to dashboard">←</button>
          <span style={s.brand}>VANTIX</span>
          <span style={s.sep}>|</span>
          <span style={s.pageName}>{activePage.icon} {activePage.label}</span>
          {loading && <span style={s.loading}>Loading…</span>}
        </div>

        <div style={s.deviceGroup}>
          {[['desktop','🖥','Desktop'],['tablet','📱','Tablet'],['mobile','📲','Mobile']].map(([k,ico,lbl]) => (
            <button key={k} title={lbl} onClick={() => setEditorDevice(k)}
              style={{ ...s.devBtn, ...(device===k ? s.devBtnActive : {}) }}>{ico}</button>
          ))}
        </div>

        <div style={s.topRight}>
          <button title="Undo" onClick={() => editorRef.current?.UndoManager.undo()} style={s.iconBtn}>↩</button>
          <button title="Redo" onClick={() => editorRef.current?.UndoManager.redo()} style={s.iconBtn}>↪</button>
          <button title="Clear canvas" onClick={() => { if(confirm('Clear canvas?')){ editorRef.current?.setComponents(''); editorRef.current?.setStyle(''); } }} style={{...s.iconBtn,color:'#c0392b'}}>🗑</button>
          {saveMsg && <span style={{ fontSize:12, color: saveMsg.startsWith('✓')?'#2ecc71':'#e74c3c', marginLeft:6 }}>{saveMsg}</span>}
          <button onClick={() => save(false)} disabled={saving}   style={s.btnDraft}>{saving?'Saving…':'Save Draft'}</button>
          <button onClick={() => save(true)}  disabled={publishing} style={s.btnPublish}>{publishing?'Publishing…':'Publish'}</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>

        {/* Left: pages + blocks */}
        <div style={s.left}>
          <div style={s.sectionHeader}>
            <span style={s.sectionLabel}>PAGES</span>
            <button onClick={() => setNewModal(true)} style={s.addBtn} title="New page">＋</button>
          </div>
          <div style={s.pageList}>
            {pages.map(pg => (
              <button key={pg.slug} onClick={() => switchPage(pg)} style={{
                ...s.pageBtn,
                ...(activePage.slug === pg.slug ? s.pageBtnActive : {}),
              }}>{pg.icon} {pg.label}</button>
            ))}
          </div>

          <div style={{...s.sectionHeader, marginTop:8}}>
            <span style={s.sectionLabel}>BLOCKS</span>
          </div>
          <div id="gjsBlocks" style={s.blocksPanel} />
        </div>

        {/* Center: canvas */}
        <div style={s.canvas}>
          <div ref={containerRef} style={{ width:'100%', height:'100%' }} />
        </div>

        {/* Right: style / traits / layers */}
        <div style={s.right}>
          <div style={s.rightTabs}>
            {[['style','Style'],['traits','Traits'],['layers','Layers']].map(([k,lbl]) => (
              <button key={k} onClick={() => setRightTab(k)} style={{
                ...s.rightTabBtn,
                ...(rightTab===k ? s.rightTabActive : {}),
              }}>{lbl}</button>
            ))}
          </div>
          <div style={s.rightBody}>
            <div id="gjsStyles" style={{ display: rightTab==='style'  ? 'block':'none', minHeight:'100%' }} />
            <div id="gjsTraits" style={{ display: rightTab==='traits' ? 'block':'none', minHeight:'100%' }} />
            <div id="gjsLayers" style={{ display: rightTab==='layers' ? 'block':'none', minHeight:'100%' }} />
          </div>
        </div>
      </div>

      {/* ── New page modal ── */}
      {newModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Create New Page</h3>
            <label style={s.label}>Page Title</label>
            <input style={s.input} value={newPage.title}
              onChange={e => { const t=e.target.value; setNewPage({ title:t, slug:t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }); }}
              placeholder="e.g. Our Collections" />
            <label style={s.label}>URL Slug</label>
            <input style={s.input} value={newPage.slug}
              onChange={e => setNewPage(p=>({...p,slug:e.target.value}))}
              placeholder="e.g. our-collections" />
            <div style={{ display:'flex', gap:8, marginTop:24 }}>
              <button onClick={() => setNewModal(false)} style={s.btnCancel}>Cancel</button>
              <button onClick={createPage} style={s.btnCreate}>Create Page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root:          { display:'flex', flexDirection:'column', height:'100vh', background:'#1a1a1a', fontFamily:'Inter,-apple-system,sans-serif', overflow:'hidden' },
  topbar:        { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', height:50, background:'#111', borderBottom:'1px solid #2a2a2a', flexShrink:0, zIndex:100, gap:12 },
  topLeft:       { display:'flex', alignItems:'center', gap:10, minWidth:0 },
  backBtn:       { background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:18, padding:'0 4px', lineHeight:1 },
  brand:         { fontSize:12, fontWeight:700, color:'#c9a96e', letterSpacing:2, textTransform:'uppercase', flexShrink:0 },
  sep:           { color:'#333' },
  pageName:      { fontSize:13, color:'#aaa', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  loading:       { fontSize:11, color:'#c9a96e' },
  deviceGroup:   { display:'flex', gap:2, background:'#1a1a1a', borderRadius:6, padding:2, flexShrink:0 },
  devBtn:        { padding:'4px 10px', borderRadius:4, border:'none', background:'transparent', color:'#666', cursor:'pointer', fontSize:14 },
  devBtnActive:  { background:'#2a2a2a', color:'#fff' },
  topRight:      { display:'flex', alignItems:'center', gap:6, flexShrink:0 },
  iconBtn:       { padding:'4px 8px', background:'none', border:'1px solid #2a2a2a', color:'#888', borderRadius:5, cursor:'pointer', fontSize:14 },
  btnDraft:      { padding:'6px 14px', background:'#2a2a2a', color:'#ccc', border:'none', borderRadius:5, fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer' },
  btnPublish:    { padding:'6px 14px', background:'#c9a96e', color:'#1a1a1a', border:'none', borderRadius:5, fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer', fontWeight:600 },
  body:          { display:'flex', flex:1, overflow:'hidden' },
  left:          { width:210, background:'#141414', borderRight:'1px solid #222', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px 6px' },
  sectionLabel:  { fontSize:9, letterSpacing:2, color:'#444', textTransform:'uppercase' },
  addBtn:        { background:'none', border:'none', color:'#c9a96e', cursor:'pointer', fontSize:18, lineHeight:1, padding:0 },
  pageList:      { padding:'0 6px 4px' },
  pageBtn:       { display:'block', width:'100%', textAlign:'left', padding:'6px 10px', background:'transparent', border:'none', borderRadius:5, color:'#777', fontSize:12, cursor:'pointer', marginBottom:1, borderLeft:'2px solid transparent' },
  pageBtnActive: { background:'#1f1f1f', color:'#fff', borderLeftColor:'#c9a96e' },
  blocksPanel:   { flex:1, overflowY:'auto' },
  canvas:        { flex:1, background:'#3a3a3a', position:'relative', overflow:'hidden' },
  right:         { width:250, background:'#141414', borderLeft:'1px solid #222', display:'flex', flexDirection:'column', flexShrink:0 },
  rightTabs:     { display:'flex', borderBottom:'1px solid #222' },
  rightTabBtn:   { flex:1, padding:'9px 4px', border:'none', background:'transparent', color:'#555', fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer', borderBottom:'2px solid transparent' },
  rightTabActive:{ color:'#c9a96e', borderBottomColor:'#c9a96e' },
  rightBody:     { flex:1, overflowY:'auto' },
  overlay:       { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:         { background:'#1a1a1a', border:'1px solid #333', borderRadius:8, padding:28, width:360 },
  modalTitle:    { color:'#fff', marginBottom:20, fontSize:15, fontWeight:500 },
  label:         { display:'block', fontSize:11, color:'#777', marginBottom:5, letterSpacing:1, textTransform:'uppercase' },
  input:         { display:'block', width:'100%', padding:'9px 12px', background:'#111', border:'1px solid #2a2a2a', borderRadius:5, color:'#fff', fontSize:13, marginBottom:14, boxSizing:'border-box', outline:'none' },
  btnCancel:     { flex:1, padding:'9px', background:'#2a2a2a', color:'#888', border:'none', borderRadius:5, cursor:'pointer', fontSize:12 },
  btnCreate:     { flex:1, padding:'9px', background:'#c9a96e', color:'#1a1a1a', border:'none', borderRadius:5, cursor:'pointer', fontWeight:600, fontSize:12 },
};
