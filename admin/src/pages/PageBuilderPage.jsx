/**
 * VANTIX-CMS — GrapesJS Page Builder
 * Full rewrite — clean layout, no panel conflicts, jewellery blocks working
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = '/api';

const PAGES = [
  { slug: 'home',       label: 'Homepage',        icon: '🏠' },
  { slug: 'about',      label: 'About Us',         icon: '✦'  },
  { slug: 'bespoke',    label: 'Bespoke & Custom', icon: '💍' },
  { slug: 'lab-grown',  label: 'Lab Grown',        icon: '💎' },
  { slug: 'heritage',   label: 'Our Heritage',     icon: '📜' },
  { slug: 'care-guide', label: 'Care Guide',       icon: '✨' },
  { slug: 'faq',        label: 'FAQ',              icon: '❓' },
];

// ── Jewellery blocks HTML ─────────────────────────────────────────────────────
const JW_BLOCKS = [
  {
    id: 'jw-hero', label: 'Hero Banner', category: '💍 Jewellery',
    content: `<section style="position:relative;width:100%;min-height:580px;background:#111;display:flex;align-items:center;justify-content:center;overflow:hidden;"><div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);"></div><div style="position:relative;z-index:2;text-align:center;color:#fff;max-width:760px;padding:40px 20px;"><p style="font-size:12px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;">New Collection 2025</p><h1 style="font-size:54px;font-weight:300;line-height:1.15;margin:0 0 22px;font-family:Georgia,serif;">Timeless Elegance<br>in Every Detail</h1><p style="font-size:16px;color:rgba(255,255,255,0.7);margin:0 0 38px;line-height:1.7;">Discover fine jewellery crafted with rare gemstones and precious metals.</p><a href="#" style="display:inline-block;padding:14px 44px;border:1px solid #c9a96e;color:#c9a96e;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Explore Collection</a></div></section>`,
  },
  {
    id: 'jw-categories', label: 'Category Circles', category: '💍 Jewellery',
    content: `<section style="padding:80px 40px;background:#fff;text-align:center;"><h2 style="font-family:Georgia,serif;font-size:34px;font-weight:300;margin:0 0 50px;color:#1a1a1a;">Shop by Category</h2><div style="display:flex;justify-content:center;gap:36px;flex-wrap:wrap;"><div style="text-align:center;"><div style="width:130px;height:130px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:38px;">💍</div><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;">Rings</p></div><div style="text-align:center;"><div style="width:130px;height:130px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:38px;">📿</div><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;">Necklaces</p></div><div style="text-align:center;"><div style="width:130px;height:130px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:38px;">✨</div><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;">Earrings</p></div><div style="text-align:center;"><div style="width:130px;height:130px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:38px;">💎</div><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;">Diamonds</p></div><div style="text-align:center;"><div style="width:130px;height:130px;border-radius:50%;background:#f5f0e8;border:2px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:38px;">👑</div><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;">Bridal</p></div></div></section>`,
  },
  {
    id: 'jw-products', label: 'Products Grid (4)', category: '💍 Jewellery',
    content: `<section style="padding:80px 40px;background:#faf8f5;"><div style="max-width:1200px;margin:0 auto;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:44px;"><h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#1a1a1a;margin:0;">Featured Pieces</h2><a href="#" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;border-bottom:1px solid #c9a96e;padding-bottom:2px;">View All</a></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;"><div style="background:#fff;border:1px solid #ede8e0;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:56px;">💍</div><div style="padding:18px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;">18K Rose Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin:0 0 6px;font-family:Georgia,serif;">Diamond Solitaire</h3><p style="font-size:14px;color:#c9a96e;margin:0 0 14px;">AED 12,500</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div><div style="background:#fff;border:1px solid #ede8e0;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:56px;">📿</div><div style="padding:18px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;">22K Yellow Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin:0 0 6px;font-family:Georgia,serif;">Emerald Necklace</h3><p style="font-size:14px;color:#c9a96e;margin:0 0 14px;">AED 8,900</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div><div style="background:#fff;border:1px solid #ede8e0;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:56px;">✨</div><div style="padding:18px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;">18K White Gold</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin:0 0 6px;font-family:Georgia,serif;">Pearl Earrings</h3><p style="font-size:14px;color:#c9a96e;margin:0 0 14px;">AED 5,200</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div><div style="background:#fff;border:1px solid #ede8e0;"><div style="aspect-ratio:1;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:56px;">💎</div><div style="padding:18px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;">IGI Certified</p><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;margin:0 0 6px;font-family:Georgia,serif;">Lab Diamond</h3><p style="font-size:14px;color:#c9a96e;margin:0 0 14px;">AED 18,000</p><a href="#" style="display:block;padding:9px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Enquire</a></div></div></div></div></section>`,
  },
  {
    id: 'jw-whatsapp', label: 'WhatsApp CTA', category: '💍 Jewellery',
    content: `<section style="padding:80px 40px;background:#1a1a1a;text-align:center;"><p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;">Personal Shopping</p><h2 style="font-family:Georgia,serif;font-size:36px;font-weight:300;color:#fff;margin:0 0 18px;">Have Questions About a Piece?</h2><p style="font-size:15px;color:rgba(255,255,255,0.6);margin:0 auto 38px;max-width:480px;line-height:1.8;">Our specialists are available on WhatsApp for personal consultations.</p><a href="https://wa.me/971500000000" style="display:inline-flex;align-items:center;gap:12px;padding:15px 42px;background:#25D366;color:#fff;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">💬 Chat on WhatsApp</a></section>`,
  },
  {
    id: 'jw-appointment', label: 'Book Appointment', category: '💍 Jewellery',
    content: `<section style="padding:100px 40px;background:linear-gradient(135deg,#f5f0e8,#ede4d0);text-align:center;"><p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;">Private Consultation</p><h2 style="font-family:Georgia,serif;font-size:40px;font-weight:300;color:#1a1a1a;margin:0 0 18px;">Visit Our Boutique</h2><p style="font-size:15px;color:#666;margin:0 auto 44px;max-width:480px;line-height:1.8;">Book a private appointment for an exclusive boutique experience.</p><a href="/book-appointment" style="display:inline-block;padding:15px 50px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Book an Appointment</a></section>`,
  },
  {
    id: 'jw-brand-story', label: 'Brand Story', category: '💍 Jewellery',
    content: `<section style="padding:100px 40px;background:#fff;"><div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;"><div style="aspect-ratio:4/5;background:linear-gradient(135deg,#f5f0e8,#ede4d0);display:flex;align-items:center;justify-content:center;font-size:90px;">✦</div><div><p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;">Our Story</p><h2 style="font-family:Georgia,serif;font-size:36px;font-weight:300;color:#1a1a1a;margin:0 0 22px;line-height:1.3;">Crafting Excellence<br>Since 1985</h2><p style="font-size:15px;color:#666;line-height:1.9;margin:0 0 22px;">For four decades, we have been dedicated to creating jewellery that transcends time. Each piece is a testament to our commitment to exceptional craftsmanship and ethically sourced materials.</p><a href="/about" style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;text-decoration:none;border-bottom:1px solid #1a1a1a;padding-bottom:3px;">Read Our Story</a></div></div></section>`,
  },
  {
    id: 'jw-collection-banners', label: 'Collection Banners', category: '💍 Jewellery',
    content: `<section style="padding:32px 40px;background:#faf8f5;"><div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div style="position:relative;min-height:480px;background:#2d1f1f;display:flex;align-items:flex-end;overflow:hidden;"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.12;font-size:130px;">💍</div><div style="position:relative;z-index:2;padding:36px;color:#fff;"><p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin:0 0 10px;">Exclusive</p><h3 style="font-family:Georgia,serif;font-size:28px;font-weight:300;margin:0 0 18px;">Bridal Collection</h3><a href="#" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:3px;">Discover More</a></div></div><div style="position:relative;min-height:480px;background:#1f2d2d;display:flex;align-items:flex-end;overflow:hidden;"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.12;font-size:130px;">💎</div><div style="position:relative;z-index:2;padding:36px;color:#fff;"><p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin:0 0 10px;">Exclusive</p><h3 style="font-family:Georgia,serif;font-size:28px;font-weight:300;margin:0 0 18px;">Men's Collection</h3><a href="#" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:3px;">Discover More</a></div></div></div></section>`,
  },
  {
    id: 'jw-promo-strip', label: 'Promo Strip', category: '💍 Jewellery',
    content: `<div style="background:#c9a96e;padding:13px 40px;display:flex;justify-content:center;gap:56px;flex-wrap:wrap;"><span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap;">✦ Complimentary Gift Wrapping</span><span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap;">✦ Free UAE Delivery over AED 500</span><span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap;">✦ IGI & GIA Certified Diamonds</span><span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap;">✦ WhatsApp Support 9am–10pm</span></div>`,
  },
  {
    id: 'jw-testimonials', label: 'Testimonials', category: '💍 Jewellery',
    content: `<section style="padding:100px 40px;background:#111;text-align:center;"><p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 14px;">Client Stories</p><h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#fff;margin:0 0 56px;">What Our Clients Say</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1080px;margin:0 auto;"><div style="padding:36px;background:rgba(255,255,255,0.04);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:18px;margin-bottom:18px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.85;margin:0 0 22px;font-style:italic;">"The engagement ring exceeded every expectation. The team guided us with patience and expertise."</p><p style="font-size:13px;font-weight:600;color:#fff;margin:0 0 4px;">Sarah Al-Rashid</p><p style="font-size:11px;color:#666;margin:0;">Dubai</p></div><div style="padding:36px;background:rgba(255,255,255,0.04);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:18px;margin-bottom:18px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.85;margin:0 0 22px;font-style:italic;">"Exceptional quality. My wife was overwhelmed with joy. Will definitely return for our anniversary."</p><p style="font-size:13px;font-weight:600;color:#fff;margin:0 0 4px;">Mohammed Al-Farsi</p><p style="font-size:11px;color:#666;margin:0;">Abu Dhabi</p></div><div style="padding:36px;background:rgba(255,255,255,0.04);border:1px solid rgba(201,169,110,0.2);"><div style="color:#c9a96e;font-size:18px;margin-bottom:18px;">★★★★★</div><p style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.85;margin:0 0 22px;font-style:italic;">"Beautiful craftsmanship. The certification gave me complete confidence in my purchase."</p><p style="font-size:13px;font-weight:600;color:#fff;margin:0 0 4px;">Priya Menon</p><p style="font-size:11px;color:#666;margin:0;">Sharjah</p></div></div></section>`,
  },
  {
    id: 'jw-cert-badges', label: 'Certification Badges', category: '💍 Jewellery',
    content: `<section style="padding:60px 40px;background:#f5f0e8;text-align:center;"><p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#999;margin:0 0 36px;">Authenticity Guaranteed</p><div style="display:flex;justify-content:center;gap:56px;flex-wrap:wrap;"><div style="text-align:center;"><div style="width:76px;height:76px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">🏅</div><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0;">IGI Certified</p></div><div style="text-align:center;"><div style="width:76px;height:76px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">💎</div><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0;">GIA Graded</p></div><div style="text-align:center;"><div style="width:76px;height:76px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">✅</div><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0;">BIS Hallmarked</p></div><div style="text-align:center;"><div style="width:76px;height:76px;border-radius:50%;background:#fff;border:2px solid #c9a96e;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;">🌿</div><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0;">Conflict-Free</p></div></div></section>`,
  },
  {
    id: 'jw-newsletter', label: 'Newsletter', category: '💍 Jewellery',
    content: `<section style="padding:80px 40px;background:#faf8f5;text-align:center;"><p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 14px;">Stay Connected</p><h2 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#1a1a1a;margin:0 0 14px;">First Access to New Collections</h2><p style="font-size:14px;color:#888;margin:0 0 36px;">Subscribe for exclusive previews and invitations to private events.</p><div style="display:flex;max-width:440px;margin:0 auto;"><input type="email" placeholder="Your email address" style="flex:1;padding:13px 18px;border:1px solid #ddd;border-right:none;background:#fff;font-size:14px;outline:none;"/><button style="padding:13px 28px;background:#1a1a1a;color:#fff;border:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;">Subscribe</button></div></section>`,
  },
  {
    id: 'jw-editorial', label: 'Editorial Banner', category: '💍 Jewellery',
    content: `<section style="position:relative;min-height:480px;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;overflow:hidden;"><div style="position:absolute;right:0;top:0;bottom:0;width:45%;display:flex;align-items:center;justify-content:center;opacity:0.1;font-size:140px;">💎</div><div style="position:relative;z-index:2;padding:70px;max-width:540px;"><p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;">Limited Edition</p><h2 style="font-family:Georgia,serif;font-size:40px;font-weight:300;color:#fff;margin:0 0 22px;line-height:1.3;">The Constellation<br>Diamond Series</h2><p style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.85;margin:0 0 36px;">Inspired by the night sky over the Arabian desert.</p><a href="#" style="display:inline-block;padding:13px 38px;background:#c9a96e;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Discover</a></div></section>`,
  },
];

// ── CSS to inject into page <head> to kill all GrapesJS built-in UI ───────────
const KILL_GJS_UI_CSS = `
  /* Hide ALL built-in GrapesJS panels — we use our own DOM */
  .gjs-pn-panels, .gjs-pn-panel { display: none !important; }
  /* Hide built-in block manager, style manager when they render in wrong place */
  .gjs-blocks-c { padding: 6px !important; }
  .gjs-block {
    width: 100% !important; min-width: unset !important; max-width: unset !important;
    margin: 0 0 4px !important; padding: 8px 10px !important;
    background: #1e1e1e !important; border: 1px solid #2a2a2a !important;
    border-radius: 6px !important; color: #ccc !important;
    font-size: 12px !important; text-align: left !important;
    cursor: grab !important; display: flex !important;
    align-items: center !important; gap: 8px !important;
  }
  .gjs-block:hover { background: #252525 !important; border-color: #c9a96e !important; color: #fff !important; }
  .gjs-block__media { font-size: 16px !important; flex-shrink: 0 !important; }
  .gjs-block-category .gjs-title {
    background: #161616 !important; color: #555 !important;
    font-size: 9px !important; letter-spacing: 2px !important;
    text-transform: uppercase !important; padding: 8px 10px !important;
    border-bottom: 1px solid #222 !important; cursor: pointer !important;
  }
  .gjs-block-category.gjs-open .gjs-title { color: #c9a96e !important; }
  /* Canvas */
  .gjs-cv-canvas { background: #2a2a2a !important; }
  /* Selected element */
  .gjs-selected { outline: 2px solid #c9a96e !important; outline-offset: -1px !important; }
  .gjs-hovered { outline: 1px dashed rgba(201,169,110,0.5) !important; }
  /* Toolbar (move/delete bar on selected element) */
  .gjs-toolbar { background: #c9a96e !important; border-radius: 4px !important; }
  .gjs-toolbar-item { color: #1a1a1a !important; }
  /* Style manager */
  .gjs-sm-sector-title {
    background: #1a1a1a !important; color: #666 !important;
    font-size: 9px !important; letter-spacing: 2px !important;
    text-transform: uppercase !important; padding: 9px 12px !important;
    border-bottom: 1px solid #222 !important; cursor: pointer !important;
  }
  .gjs-sm-sector.gjs-sm-open .gjs-sm-sector-title,
  .gjs-sm-sector-title:hover { color: #c9a96e !important; }
  .gjs-sm-properties { padding: 10px 12px !important; background: #141414 !important; }
  .gjs-sm-label { color: #666 !important; font-size: 11px !important; margin-bottom: 4px !important; }
  .gjs-sm-property input, .gjs-sm-property select, .gjs-sm-property textarea {
    background: #1e1e1e !important; border: 1px solid #2a2a2a !important;
    color: #ddd !important; border-radius: 4px !important;
    padding: 4px 8px !important; font-size: 12px !important; width: 100% !important;
    box-sizing: border-box !important;
  }
  .gjs-sm-property input:focus, .gjs-sm-property select:focus {
    border-color: #c9a96e !important; outline: none !important;
  }
  /* Trait manager */
  .gjs-trt-trait { padding: 8px 12px !important; border-bottom: 1px solid #1e1e1e !important; }
  .gjs-trt-trait__label { color: #666 !important; font-size: 11px !important; margin-bottom: 4px !important; }
  .gjs-trt-trait input, .gjs-trt-trait select {
    background: #1e1e1e !important; border: 1px solid #2a2a2a !important;
    color: #ddd !important; border-radius: 4px !important; padding: 4px 8px !important;
    font-size: 12px !important; width: 100% !important; box-sizing: border-box !important;
  }
  /* Layer manager */
  .gjs-layer { color: #777 !important; font-size: 12px !important; }
  .gjs-layer.gjs-selected { background: #1e1e1e !important; color: #c9a96e !important; }
  .gjs-layer:hover { background: #1a1a1a !important; }
  .gjs-layer__name { padding: 6px 10px !important; }
  /* Resize handles */
  .gjs-resizer-h { background: #c9a96e !important; }
`;

export default function PageBuilderPage() {
  const navigate     = useNavigate();
  const wrapRef      = useRef(null);   // outer container GrapesJS attaches to
  const editorRef    = useRef(null);
  const initDone     = useRef(false);

  const [pages,      setPages]      = useState(PAGES);
  const [active,     setActive]     = useState(PAGES[0]);
  const [rightTab,   setRightTab]   = useState('style');
  const [device,     setDevice]     = useState('desktop');
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg,        setMsg]        = useState('');
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(false);
  const [newPg,      setNewPg]      = useState({ title: '', slug: '' });

  // ── Init editor ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current || !wrapRef.current) return;
    initDone.current = true;

    (async () => {
      // Dynamic import — grapesjs is in package.json
      let grapesjs;
      try {
        const m = await import('grapesjs');
        grapesjs = m.default || m;
      } catch (e) {
        console.error('[Builder] grapesjs import failed:', e);
        return;
      }

      const editor = grapesjs.init({
        container:      wrapRef.current,
        height:         '100%',
        width:          'auto',
        storageManager: false,
        // NO plugins — preset-webpage hijacks the panel layout
        plugins:        [],
        pluginsOpts:    {},
        blockManager:   { appendTo: '#vx-blocks' },
        styleManager: {
          appendTo: '#vx-styles',
          sectors: [
            { name: 'Typography', open: true,  properties: ['font-family','font-size','font-weight','font-style','color','text-align','line-height','letter-spacing','text-transform','text-decoration'] },
            { name: 'Spacing',    open: false, properties: ['margin','padding'] },
            { name: 'Size',       open: false, properties: ['width','min-width','max-width','height','min-height','max-height'] },
            { name: 'Layout',     open: false, properties: ['display','flex-direction','align-items','justify-content','flex-wrap','gap'] },
            { name: 'Background', open: false, properties: ['background-color','background-image','background-size','background-position','background-repeat'] },
            { name: 'Border',     open: false, properties: ['border','border-width','border-style','border-color','border-radius'] },
            { name: 'Effects',    open: false, properties: ['box-shadow','opacity','overflow'] },
            { name: 'Position',   open: false, properties: ['position','top','right','bottom','left','z-index'] },
          ],
        },
        traitManager:  { appendTo: '#vx-traits' },
        layerManager:  { appendTo: '#vx-layers' },
        panels:        { defaults: [] },  // kill ALL built-in panels/toolbar icons
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@300;400;500&display=swap',
          ],
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

      // Inject CSS into the MAIN document to hide GrapesJS built-in UI
      // (the iframe gets KILL_GJS_UI_CSS via the 'load' event below)
      const mainStyle = document.createElement('style');
      mainStyle.id = 'vx-gjs-overrides';
      mainStyle.textContent = `
        /* Hide GrapesJS built-in panels rendered in main document */
        .gjs-pn-panels { display: none !important; }
        .gjs-block-category .gjs-caret { display: none !important; }
        /* Fix "less xOk" — these are LESS variable inputs rendered outside canvas */
        .gjs-sm-sector .gjs-sm-properties .gjs-sm-field-colorp,
        .gjs-field-colorp { display: flex !important; }
        /* Make sure block manager fills our container properly */
        #vx-blocks .gjs-blocks-c { 
          display: flex !important; flex-direction: column !important; 
          padding: 6px !important; gap: 3px !important;
        }
        #vx-blocks .gjs-block { 
          width: 100% !important; margin: 0 !important;
          min-height: 36px !important;
        }
        #vx-blocks .gjs-block-category .gjs-title {
          font-size: 9px !important; letter-spacing: 2px !important;
          text-transform: uppercase !important; color: #c9a96e !important;
          padding: 8px 10px !important; cursor: pointer !important;
          background: #0a0a0a !important; border-bottom: 1px solid #1a1a1a !important;
        }
      \`;
      if (!document.getElementById('vx-gjs-overrides')) {
        document.head.appendChild(mainStyle);
      }

      // Inject our CSS overrides into the GrapesJS iframe canvas
      editor.on('load', () => {
        const frame = editor.Canvas.getFrameEl();
        if (frame) {
          const style = frame.contentDocument.createElement('style');
          style.textContent = KILL_GJS_UI_CSS;
          frame.contentDocument.head.appendChild(style);
        }
      });

      // Register jewellery blocks
      const bm = editor.BlockManager;
      JW_BLOCKS.forEach(b => bm.add(b.id, { label: b.label, category: b.category, content: b.content }));

      // Load first page
      await loadContent(PAGES[0].slug, editor);
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

  // ── Load page content ────────────────────────────────────────────────────────
  const loadContent = useCallback(async (slug, ed) => {
    const gjs = ed || editorRef.current;
    if (!gjs) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API}/pages/${slug}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (data.success) {
        const pg = data.data;
        if (pg.grapes_data && Object.keys(pg.grapes_data).length > 0) {
          gjs.loadProjectData(pg.grapes_data);
        } else if (pg.html_content) {
          gjs.setComponents(pg.html_content);
          if (pg.css_content) gjs.setStyle(pg.css_content);
        } else {
          gjs.setComponents('');
          gjs.setStyle('');
        }
      }
    } catch (_) {
      const g = editorRef.current;
      if (g) { g.setComponents(''); g.setStyle(''); }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Switch page ──────────────────────────────────────────────────────────────
  const switchPage = useCallback(async pg => {
    if (pg.slug === active.slug) return;
    setActive(pg);
    await loadContent(pg.slug);
  }, [active.slug, loadContent]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const save = useCallback(async (publish = false) => {
    const gjs = editorRef.current;
    if (!gjs) return;
    publish ? setPublishing(true) : setSaving(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };

      // Always save content first
      await axios.put(`${API}/pages/${active.slug}`, {
        html:        gjs.getHtml(),
        css:         gjs.getCss(),
        grapes_data: gjs.getProjectData(),
      }, { headers });

      // Then change status via dedicated endpoint (bug fix: was sending status in PUT)
      if (publish) {
        await axios.patch(`${API}/pages/${active.slug}/publish`, { status: 'published' }, { headers });
      }

      setMsg(publish ? '✓ Published' : '✓ Saved');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('✗ ' + (e.response?.data?.error || e.message));
    } finally { setSaving(false); setPublishing(false); }
  }, [active.slug]);

  // ── Device ───────────────────────────────────────────────────────────────────
  const switchDevice = d => {
    setDevice(d);
    editorRef.current?.setDevice({ desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' }[d]);
  };

  // ── Create page ──────────────────────────────────────────────────────────────
  const createPage = async () => {
    if (!newPg.title || !newPg.slug) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API}/pages`, newPg, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (data.success) {
        const pg = { slug: data.data.slug, label: data.data.title, icon: '📄' };
        setPages(p => [...p, pg]);
        setModal(false);
        setNewPg({ title: '', slug: '' });
        switchPage(pg);
      }
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0f0f0f', fontFamily:'Inter,-apple-system,sans-serif', overflow:'hidden' }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{ height:48, background:'#0a0a0a', borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', flexShrink:0, zIndex:200 }}>

        {/* Left */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('/')} title="Dashboard"
            style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:16, padding:'0 2px', lineHeight:1, marginRight:2 }}>←</button>
          <span style={{ fontSize:11, fontWeight:700, color:'#c9a96e', letterSpacing:3, textTransform:'uppercase' }}>VANTIX</span>
          <span style={{ color:'#2a2a2a' }}>|</span>
          <span style={{ fontSize:12, color:'#888' }}>{active.icon} {active.label}</span>
          {loading && <span style={{ fontSize:11, color:'#c9a96e', marginLeft:4 }}>Loading…</span>}
        </div>

        {/* Centre — device */}
        <div style={{ display:'flex', gap:2, background:'#141414', borderRadius:6, padding:3 }}>
          {[['desktop','🖥 Desktop'],['tablet','⬛ Tablet'],['mobile','📱 Mobile']].map(([k,lbl]) => (
            <button key={k} onClick={() => switchDevice(k)} style={{
              padding:'4px 12px', borderRadius:4, border:'none', cursor:'pointer', fontSize:11, letterSpacing:1,
              background: device===k ? '#c9a96e' : 'transparent',
              color:      device===k ? '#1a1a1a' : '#555',
              fontWeight: device===k ? 600 : 400,
            }}>{lbl}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button title="Undo" onClick={() => editorRef.current?.UndoManager.undo()}
            style={{ padding:'5px 9px', background:'none', border:'1px solid #222', color:'#777', borderRadius:5, cursor:'pointer', fontSize:13 }}>↩</button>
          <button title="Redo" onClick={() => editorRef.current?.UndoManager.redo()}
            style={{ padding:'5px 9px', background:'none', border:'1px solid #222', color:'#777', borderRadius:5, cursor:'pointer', fontSize:13 }}>↪</button>
          <button title="Clear" onClick={() => { if (confirm('Clear the canvas?')) { editorRef.current?.setComponents(''); editorRef.current?.setStyle(''); }}}
            style={{ padding:'5px 9px', background:'none', border:'1px solid #222', color:'#c0392b', borderRadius:5, cursor:'pointer', fontSize:13 }}>🗑</button>
          {msg && <span style={{ fontSize:11, color: msg.startsWith('✓') ? '#2ecc71' : '#e74c3c', marginLeft:4 }}>{msg}</span>}
          <button onClick={() => save(false)} disabled={saving}
            style={{ padding:'7px 16px', background:'#1e1e1e', color:'#bbb', border:'1px solid #2a2a2a', borderRadius:6, fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer' }}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={() => save(true)} disabled={publishing}
            style={{ padding:'7px 16px', background:'#c9a96e', color:'#1a1a1a', border:'none', borderRadius:6, fontSize:11, letterSpacing:1, textTransform:'uppercase', cursor:'pointer', fontWeight:700 }}>
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ══ BODY ══════════════════════════════════════════════════════════════ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── LEFT PANEL: pages + blocks ─────────────────────────────────── */}
        <div style={{ width:200, background:'#111', borderRight:'1px solid #1e1e1e', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>

          {/* Pages */}
          <div style={{ borderBottom:'1px solid #1a1a1a', paddingBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 10px 6px' }}>
              <span style={{ fontSize:8, letterSpacing:2, color:'#333', textTransform:'uppercase' }}>Pages</span>
              <button onClick={() => setModal(true)} title="New page"
                style={{ background:'none', border:'none', color:'#c9a96e', cursor:'pointer', fontSize:16, lineHeight:1 }}>＋</button>
            </div>
            <div style={{ padding:'0 6px' }}>
              {pages.map(pg => (
                <button key={pg.slug} onClick={() => switchPage(pg)} style={{
                  display:'block', width:'100%', textAlign:'left', padding:'6px 8px',
                  background: active.slug===pg.slug ? '#1a1a1a' : 'transparent',
                  border:'none', borderRadius:5, borderLeft: active.slug===pg.slug ? '2px solid #c9a96e' : '2px solid transparent',
                  color: active.slug===pg.slug ? '#fff' : '#666',
                  fontSize:12, cursor:'pointer', marginBottom:1,
                }}>
                  {pg.icon} {pg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks */}
          <div style={{ padding:'8px 10px 4px', fontSize:8, letterSpacing:2, color:'#333', textTransform:'uppercase' }}>Blocks</div>
          <div id="vx-blocks" style={{ flex:1, overflowY:'auto' }} />
        </div>

        {/* ── CANVAS ─────────────────────────────────────────────────────── */}
        <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#2a2a2a' }}>
          {/* GrapesJS mounts here — must be absolute to fill parent properly */}
          <div ref={wrapRef} style={{ position:'absolute', inset:0 }} />
        </div>

        {/* ── RIGHT PANEL: style / traits / layers ───────────────────────── */}
        <div style={{ width:256, background:'#111', borderLeft:'1px solid #1e1e1e', display:'flex', flexDirection:'column', flexShrink:0 }}>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1a1a1a', flexShrink:0 }}>
            {[['style','Style'],['traits','Traits'],['layers','Layers']].map(([k,lbl]) => (
              <button key={k} onClick={() => setRightTab(k)} style={{
                flex:1, padding:'10px 4px', border:'none', background:'transparent', cursor:'pointer',
                fontSize:10, letterSpacing:1, textTransform:'uppercase',
                color:       rightTab===k ? '#c9a96e' : '#444',
                borderBottom: rightTab===k ? '2px solid #c9a96e' : '2px solid transparent',
              }}>{lbl}</button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex:1, overflowY:'auto' }}>
            <div id="vx-styles" style={{ display: rightTab==='style'  ? 'block' : 'none' }} />
            <div id="vx-traits" style={{ display: rightTab==='traits' ? 'block' : 'none' }} />
            <div id="vx-layers" style={{ display: rightTab==='layers' ? 'block' : 'none' }} />
          </div>
        </div>
      </div>

      {/* ══ NEW PAGE MODAL ════════════════════════════════════════════════════ */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:28, width:360 }}>
            <h3 style={{ color:'#fff', margin:'0 0 22px', fontSize:15, fontWeight:500 }}>Create New Page</h3>
            <label style={{ display:'block', fontSize:10, color:'#555', marginBottom:5, letterSpacing:1, textTransform:'uppercase' }}>Page Title</label>
            <input style={{ display:'block', width:'100%', padding:'9px 12px', background:'#0a0a0a', border:'1px solid #222', borderRadius:5, color:'#fff', fontSize:13, marginBottom:14, boxSizing:'border-box', outline:'none' }}
              value={newPg.title}
              onChange={e => { const t=e.target.value; setNewPg({ title:t, slug:t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }); }}
              placeholder="e.g. Our Collections" />
            <label style={{ display:'block', fontSize:10, color:'#555', marginBottom:5, letterSpacing:1, textTransform:'uppercase' }}>URL Slug</label>
            <input style={{ display:'block', width:'100%', padding:'9px 12px', background:'#0a0a0a', border:'1px solid #222', borderRadius:5, color:'#fff', fontSize:13, marginBottom:22, boxSizing:'border-box', outline:'none' }}
              value={newPg.slug}
              onChange={e => setNewPg(p => ({ ...p, slug:e.target.value }))}
              placeholder="e.g. our-collections" />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:'10px', background:'#1a1a1a', color:'#888', border:'1px solid #222', borderRadius:6, cursor:'pointer', fontSize:12 }}>Cancel</button>
              <button onClick={createPage} style={{ flex:1, padding:'10px', background:'#c9a96e', color:'#1a1a1a', border:'none', borderRadius:6, cursor:'pointer', fontWeight:700, fontSize:12 }}>Create Page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
