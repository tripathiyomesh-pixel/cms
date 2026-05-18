import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Save, Eye, Smartphone, Tablet, Monitor, RotateCcw,
  Layout, Square, Columns, Type, Image, ChevronDown,
} from 'lucide-react';

// ── WHAT CAN BE EDITED ────────────────────────────────────────
const EDIT_SECTIONS = [
  { id:'homepage',   label:'Homepage',         icon:'🏠', desc:'Hero, products, about, testimonials' },
  { id:'header',     label:'Header / Nav',     icon:'⬆️', desc:'Logo, menu items, announcement bar' },
  { id:'footer',     label:'Footer',           icon:'⬇️', desc:'Links, social, newsletter, copyright' },
  { id:'about',      label:'About / Heritage', icon:'🏛️', desc:'Brand story, team, heritage page' },
  { id:'lab-grown',  label:'Lab Diamond',      icon:'💎', desc:'Lab grown landing page' },
  { id:'bespoke',    label:'Bespoke Services', icon:'✏️', desc:'Custom jewellery page' },
];

// ── TEJORI BLOCK DEFINITIONS ──────────────────────────────────
const BLOCKS = [
  // ─ Layout ─
  {
    id:'hero-full', label:'Hero — Full Screen', cat:'Hero',
    thumb:'🖼️',
    html:`<section data-section="hero" style="position:relative;min-height:85vh;background:#1a1a1a;display:flex;align-items:center;overflow:hidden">
<img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80" data-type="image" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55"/>
<div style="position:relative;z-index:1;padding:64px 96px;max-width:680px">
  <p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">New Collection</p>
  <h1 data-type="text" style="font-family:'Cormorant Garamond',Georgia,serif;font-size:80px;font-weight:300;color:#fff;line-height:1;margin-bottom:20px">Frost Yourself</h1>
  <p data-type="text" style="font-size:16px;color:rgba(255,255,255,0.7);max-width:420px;line-height:1.7;margin-bottom:36px">Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.</p>
  <a href="/jewellery" data-type="link" style="font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:3px">Discover the selection →</a>
</div></section>`,
  },
  {
    id:'hero-split', label:'Hero — Split Screen', cat:'Hero',
    thumb:'↔️',
    html:`<section data-section="hero-split" style="display:grid;grid-template-columns:1fr 1fr;min-height:80vh">
<div style="background:#f5ede2;display:flex;flex-direction:column;justify-content:center;padding:80px 60px">
  <p data-type="text" style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">New Collection</p>
  <h1 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:60px;font-weight:300;color:#1a1a1a;line-height:1.05;margin-bottom:20px">Fine Jewellery</h1>
  <p data-type="text" style="font-size:14px;color:#6b6b6b;line-height:1.8;margin-bottom:32px">Discover our curated collection of certified diamonds and precious gemstones.</p>
  <a href="/jewellery" style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px;width:fit-content">Explore Collection →</a>
</div>
<div style="overflow:hidden"><img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=900&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/></div>
</section>`,
  },

  // ─ Products ─
  {
    id:'products-grid', label:'Product Grid (4 cols)', cat:'Products',
    thumb:'📦',
    html:`<section style="padding:80px 60px;background:#fdf8f3">
<div style="max-width:1280px;margin:0 auto">
  <p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;text-align:center;margin-bottom:10px">Featured</p>
  <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#1a1a1a;text-align:center;margin-bottom:48px">Our Selection</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px">
    ${['Croissant Dome Hoops','Diamond Celestial Studs','Medium Flat Hoops','Organic Pearl Hoops'].map((name,i)=>`
    <div style="background:#fff;border:1px solid #e5e0d8">
      <div style="overflow:hidden;aspect-ratio:1;background:#f5ede2">
        <img src="https://images.unsplash.com/photo-${['1611652022419-a9419f74343d','1573408301185-9519f94ae069','1535632787350-4e68ef0ac584','1599643478518-a784e5dc4c8f'][i]}?w=500&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
      </div>
      <div style="padding:16px">
        <h3 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;color:#1a1a1a;margin-bottom:12px">${name}</h3>
        <a href="/jewellery" style="display:block;width:100%;padding:12px;background:#1a1a1a;color:#fff;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;text-align:center;text-decoration:none">Inquiry Now</a>
      </div>
    </div>`).join('')}
  </div>
</div></section>`,
  },
  {
    id:'products-3col', label:'Product Grid (3 cols)', cat:'Products',
    thumb:'📱',
    html:`<section style="padding:80px 60px;background:#fff">
<div style="max-width:1280px;margin:0 auto">
  <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#1a1a1a;text-align:center;margin-bottom:48px">New Arrivals</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
    ${['Diamond Ring','Pearl Necklace','Sapphire Bracelet'].map((name,i)=>`
    <div style="background:#f5ede2">
      <div style="overflow:hidden;aspect-ratio:4/5">
        <img src="https://images.unsplash.com/photo-${['1605100804763-247f67b3557e','1602173574767-37ac01994b2a','1544376798-89aa6b0de868'][i]}?w=600&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
      </div>
      <div style="padding:20px">
        <h3 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;color:#1a1a1a;margin-bottom:8px">${name}</h3>
        <a href="/jewellery" style="font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#b8860b;border-bottom:1px solid #b8860b;padding-bottom:1px">Discover →</a>
      </div>
    </div>`).join('')}
  </div>
</div></section>`,
  },

  // ─ Categories ─
  {
    id:'categories-circles', label:'Category Circles', cat:'Categories',
    thumb:'⭕',
    html:`<section style="padding:60px 60px;background:#fff;text-align:center">
<h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#1a1a1a;margin-bottom:40px">Shop by Category</h2>
<div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap">
  ${['Rings','Necklaces','Earrings','Bracelets','Pendants','Bridal'].map(c=>`
  <a href="/jewellery?category=${c.toLowerCase()}" style="display:flex;flex-direction:column;align-items:center;gap:12px;text-decoration:none">
    <div style="width:88px;height:88px;border-radius:50%;overflow:hidden;border:1.5px solid #e5e0d8">
      <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=200&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
    </div>
    <span data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#4a4a4a">${c}</span>
  </a>`).join('')}
</div></section>`,
  },

  // ─ Content ─
  {
    id:'brand-story', label:'Brand Story (split)', cat:'Content',
    thumb:'📖',
    html:`<section style="padding:80px 60px;background:#fff">
<div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">
  <div>
    <p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">Our Promise</p>
    <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:300;color:#1a1a1a;line-height:1.05;margin-bottom:24px">Handcrafted &<br/>Ethically Sourced</h2>
    <div style="width:40px;height:1px;background:#b8860b;margin-bottom:28px"></div>
    <p data-type="text" style="font-size:13px;color:#6b6b6b;line-height:1.9;margin-bottom:32px">With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces and personalized customization services.</p>
    <a href="/about" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px">Learn More →</a>
  </div>
  <div><img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80" data-type="image" style="width:100%;aspect-ratio:4/5;object-fit:cover"/></div>
</div></section>`,
  },
  {
    id:'about-heritage', label:'About / Heritage', cat:'Content',
    thumb:'🏛️',
    html:`<section style="padding:80px 60px;background:#fff">
<div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center">
  <div style="position:relative">
    <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80" data-type="image" style="width:100%;aspect-ratio:4/5;object-fit:cover"/>
    <div style="position:absolute;bottom:0;right:0;background:#1a1a1a;padding:20px 28px">
      <p data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#b8860b">60+</p>
      <p data-type="text" style="font-size:9px;color:#888;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px">Years of Legacy</p>
    </div>
  </div>
  <div>
    <p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">About us</p>
    <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:300;color:#1a1a1a;margin-bottom:24px">Our Heritage</h2>
    <div style="width:40px;height:1px;background:#b8860b;margin-bottom:28px"></div>
    <p data-type="text" style="font-size:13px;color:#6b6b6b;line-height:1.9;margin-bottom:32px">Founded in 2004, Tejori has become one of the most respected jewellery brands in the GCC, combining heritage craftsmanship with contemporary design.</p>
    <a href="/about" style="font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #1a1a1a;padding-bottom:2px">Learn More →</a>
  </div>
</div></section>`,
  },
  {
    id:'testimonials', label:'Testimonials', cat:'Content',
    thumb:'⭐',
    html:`<section style="padding:80px 60px;background:#fdf8f3;text-align:center">
<p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:40px">What Our Clients Say</p>
<div style="color:#b8860b;font-size:22px;letter-spacing:4px;margin-bottom:24px">★★★★★</div>
<p data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;font-style:italic;color:#1a1a1a;max-width:760px;margin:0 auto 32px;line-height:1.6">"An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare."</p>
<p data-type="text" style="font-size:13px;font-weight:600;color:#1a1a1a;letter-spacing:0.1em;margin-bottom:4px">Saitama One</p>
<p data-type="text" style="font-size:12px;color:#b8860b">"Fabulous Grounds"</p>
</section>`,
  },
  {
    id:'why-choose', label:'Why Choose Tejori', cat:'Content',
    thumb:'🏆',
    html:`<section style="padding:80px 60px;background:#fdf8f3;text-align:center">
<p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:12px">Our Difference</p>
<h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:#1a1a1a;margin-bottom:60px">Why choose TEJORI?</h2>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:48px;max-width:1000px;margin:0 auto">
  ${[
    {icon:'🏆',t:'Authenticity Guaranteed',d:'Every piece is handpicked and meticulously inspected.'},
    {icon:'💎',t:'Rare & Iconic Jewellery',d:'Our rare jewellery is a valuable investment.'},
    {icon:'✨',t:'Heritage of Craftsmanship',d:'Creating masterpieces since 1964. GIA & IGI certified.'},
  ].map(p=>`<div>
    <div style="font-size:48px;margin-bottom:20px">${p.icon}</div>
    <h3 data-type="text" style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#1a1a1a;margin-bottom:12px">${p.t}</h3>
    <p data-type="text" style="font-size:13px;color:#6b6b6b;line-height:1.8">${p.d}</p>
  </div>`).join('')}
</div></section>`,
  },

  // ─ Banners ─
  {
    id:'editorial-full', label:'Editorial Full Width', cat:'Banners',
    thumb:'🎨',
    html:`<div data-section="editorial" style="position:relative;height:600px;overflow:hidden">
<img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
<div style="position:absolute;inset:0;background:rgba(0,0,0,0.42)"></div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:80px 96px">
  <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:80px;font-weight:300;color:#fff;line-height:1;margin-bottom:16px">Classics</h2>
  <p data-type="text" style="font-size:16px;color:rgba(255,255,255,0.65);max-width:420px;line-height:1.7;margin-bottom:32px">Timeless and elegant jewellery that never goes out of style.</p>
  <a href="/jewellery?collection=classics" style="font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:2px;width:fit-content">Discover the selection →</a>
</div></div>`,
  },
  {
    id:'collection-2col', label:'Collection Banners (2 col)', cat:'Banners',
    thumb:'🗂️',
    html:`<div style="display:grid;grid-template-columns:1fr 1fr">
${[
  {t:'Summer Collections',s:'Freshwater pearl necklace and earrings',h:'/jewellery',img:'1535632787350-4e68ef0ac584'},
  {t:'Make it memorable',s:'Bespoke jewellery for life\'s moments',h:'/custom',img:'1599643478518-a784e5dc4c8f'},
].map(c=>`<div style="position:relative;height:440px;overflow:hidden">
  <img src="https://images.unsplash.com/photo-${c.img}?w=900&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4)"></div>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px">
    <h3 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#fff;margin-bottom:12px">${c.t}</h3>
    <p data-type="text" style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:24px">${c.s}</p>
    <a href="${c.h}" style="font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.5);padding-bottom:2px">Explore</a>
  </div>
</div>`).join('')}
</div>`,
  },
  {
    id:'promo-strip', label:'Promo Strip (3 col)', cat:'Banners',
    thumb:'🎯',
    html:`<div style="display:grid;grid-template-columns:repeat(3,1fr)">
  <a href="/jewellery?is_new=true" style="display:flex;align-items:center;justify-content:center;padding:32px;background:#1a1a1a;text-decoration:none">
    <span data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#c9a84c">New Arrivals</span>
  </a>
  <a href="/jewellery?sort=featured" style="display:flex;align-items:center;justify-content:center;padding:32px;background:#b8860b;text-decoration:none">
    <span data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#fff">Best Seller</span>
  </a>
  <a href="/jewellery?on_sale=true" style="display:flex;align-items:center;justify-content:center;padding:32px;background:#3d2b1a;text-decoration:none">
    <span data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#e8d5bc">Clearance Sale</span>
  </a>
</div>`,
  },

  // ─ Newsletter ─
  {
    id:'newsletter', label:'Newsletter', cat:'Engagement',
    thumb:'📧',
    html:`<section style="padding:64px 60px;background:#1a1a1a;text-align:center">
<p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:12px">Stay Connected</p>
<h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#fff;margin-bottom:12px">Stay in the world of Tejori</h2>
<p data-type="text" style="font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:32px;letter-spacing:0.05em">Subscribe for 10% off your first purchase.</p>
<form style="display:flex;max-width:420px;margin:0 auto" onsubmit="return false">
  <input type="email" placeholder="Your email address" style="flex:1;padding:14px 18px;border:1px solid rgba(255,255,255,0.15);border-right:none;background:rgba(255,255,255,0.06);color:#fff;font-size:12px;outline:none"/>
  <button style="padding:14px 24px;background:#b8860b;color:#fff;border:none;cursor:pointer;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;white-space:nowrap">Subscribe</button>
</form></section>`,
  },
  {
    id:'whatsapp-cta', label:'WhatsApp CTA', cat:'Engagement',
    thumb:'💬',
    html:`<section style="padding:64px 60px;background:#f5ede2;text-align:center">
<p data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:#1a1a1a;margin-bottom:12px">Have a question?</p>
<p data-type="text" style="font-size:14px;color:#6b6b6b;margin-bottom:32px">Chat with our jewellery experts on WhatsApp. We reply within minutes.</p>
<a href="https://wa.me/971500000000" target="_blank" style="display:inline-flex;align-items:center;gap:12px;padding:16px 40px;background:#1a7a35;color:#fff;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none">
  💬 Chat on WhatsApp
</a></section>`,
  },

  // ─ Text / Media ─
  {
    id:'text-block', label:'Text Block', cat:'Text & Media',
    thumb:'📝',
    html:`<section style="padding:60px 96px;background:#fff;max-width:800px;margin:0 auto">
<h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#1a1a1a;margin-bottom:24px">Section Heading</h2>
<div style="width:40px;height:1px;background:#b8860b;margin-bottom:24px"></div>
<p data-type="text" style="font-size:14px;color:#6b6b6b;line-height:1.9">Add your content here. Click to edit this text and make it your own.</p>
</section>`,
  },
  {
    id:'image-full', label:'Full Width Image', cat:'Text & Media',
    thumb:'🖼️',
    html:`<div style="overflow:hidden;height:500px">
<img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
</div>`,
  },
  {
    id:'divider', label:'Section Divider', cat:'Text & Media',
    thumb:'—',
    html:`<div style="display:flex;align-items:center;gap:20px;padding:40px 80px;background:#fff">
<div style="flex:1;height:0.5px;background:#e5e0d8"></div>
<span style="font-size:18px;color:#b8860b">✦</span>
<div style="flex:1;height:0.5px;background:#e5e0d8"></div>
</div>`,
  },
  {
    id:'spacer', label:'Spacer', cat:'Text & Media',
    thumb:'↕️',
    html:`<div style="height:80px;background:#fff"></div>`,
  },
  {
    id:'learning-center', label:'Learning Center', cat:'Content',
    thumb:'📚',
    html:`<div style="position:relative;height:340px;overflow:hidden">
<img src="https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80" data-type="image" style="width:100%;height:100%;object-fit:cover"/>
<div style="position:absolute;inset:0;background:rgba(10,10,10,0.58)"></div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
  <p data-type="text" style="font-size:10px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;margin-bottom:16px">Education</p>
  <h2 data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;color:#fff;margin-bottom:16px">The Learning Center</h2>
  <p data-type="text" style="font-size:13px;color:rgba(255,255,255,0.65);max-width:480px;line-height:1.8;margin-bottom:28px">Whether you're buying jewellery for the first time or need a refresher.</p>
  <a href="/blog" style="font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#fff;border-bottom:1px solid rgba(255,255,255,0.4);padding-bottom:2px">Learn more →</a>
</div></div>`,
  },
  {
    id:'cert-logos', label:'Certification Logos', cat:'Trust',
    thumb:'🏅',
    html:`<section style="padding:32px 60px;background:#fff;border-top:1px solid #f0ede8;border-bottom:1px solid #f0ede8">
<p style="text-align:center;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:20px">Certified by</p>
<div style="display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap">
  ${['GIA Certified','IGI Certified','HRD Antwerp','AGS','GCAL'].map(c=>`<span data-type="text" style="font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:400;color:rgba(0,0,0,0.18);letter-spacing:0.1em;text-transform:uppercase">${c}</span>`).join('')}
</div></section>`,
  },
];

// ── MAIN PAGE BUILDER COMPONENT ───────────────────────────────
export default function PageBuilderPage() {
  const editorRef    = useRef(null);
  const containerRef = useRef(null);
  const [editor,     setEditor]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [activeSection, setActiveSection] = useState('homepage');
  const [device,     setDevice]     = useState('desktop');
  const [activeTab,  setActiveTab]  = useState('blocks');
  const [search,     setSearch]     = useState('');

  // Group blocks by category
  const categories = [...new Set(BLOCKS.map(b=>b.cat))];
  const filtered   = BLOCKS.filter(b =>
    !search || b.label.toLowerCase().includes(search.toLowerCase()) || b.cat.toLowerCase().includes(search.toLowerCase())
  );

  const initEditor = async (page) => {
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
      setEditor(null);
    }
    if (!containerRef.current) return;
    setLoading(true);

    const grapes = await import('grapesjs');
    const GrapesJS = grapes.default;

    let savedHtml = '', savedCss = '';
    try {
      const res = await api.get(`/settings/page/${page}`);
      if (res.data.data?.html) { savedHtml = res.data.data.html; savedCss = res.data.data.css||''; }
    } catch {}

    const gjs = GrapesJS.init({
      container: containerRef.current,
      height: '100%',
      width: 'auto',
      storageManager: false,
      undoManager: { trackChanges: true },
      panels: { defaults: [] },
      deviceManager: {
        devices: [
          { name:'Desktop', width:'' },
          { name:'Tablet',  width:'768px', widthMedia:'992px' },
          { name:'Mobile',  width:'390px', widthMedia:'480px' },
        ],
      },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap',
        ],
      },
      components: savedHtml || '',
      style: savedCss || '',
      blockManager: { blocks: [] },
      styleManager: { sectors: [] },
    });

    editorRef.current = gjs;
    setEditor(gjs);
    setLoading(false);
  };

  useEffect(() => {
    initEditor(activeSection);
    return () => {
      if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; }
    };
  }, [activeSection]);

  // Device
  useEffect(() => {
    if (!editor) return;
    const map = { desktop:'Desktop', tablet:'Tablet', mobile:'Mobile' };
    editor.setDevice(map[device]);
  }, [device, editor]);

  // Drag block onto canvas
  const addBlock = (block) => {
    if (!editor) return;
    editor.addComponents(block.html);
    toast.success(`${block.label} added`);
  };

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await api.post(`/settings/page/${activeSection}`, {
        html: editor.getHtml(),
        css:  editor.getCss(),
      });
      toast.success('Saved! Storefront updated.');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleUndo  = () => editor?.UndoManager?.undo();
  const handleClear = () => { if (editor && confirm('Clear page?')) { editor.setComponents(''); editor.setStyle(''); } };

  const sec = EDIT_SECTIONS.find(s=>s.id===activeSection);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:"'Inter', system-ui" }}>

      {/* ── TOP BAR ────────────────────────────────────────── */}
      <div style={{ height:52, flexShrink:0, background:'#fff', borderBottom:'1px solid #e5e0d8', display:'flex', alignItems:'center', padding:'0 16px', gap:12 }}>

        {/* Page tabs */}
        <div style={{ display:'flex', gap:2, flexShrink:0 }}>
          {EDIT_SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setActiveSection(s.id)}
              style={{ padding:'6px 12px', fontSize:11, fontWeight:500, letterSpacing:'0.03em', borderRadius:6, border:'none', cursor:'pointer', background: activeSection===s.id ? '#1a1a1a' : 'transparent', color: activeSection===s.id ? '#fff' : '#6b6b6b', transition:'all .15s' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }}/>

        {/* Device switcher */}
        <div style={{ display:'flex', background:'#f5f0e8', borderRadius:8, padding:3, gap:1 }}>
          {[['desktop','🖥️',Monitor],['tablet','📱',Tablet],['mobile','📱',Smartphone]].map(([d,emoji,Icon])=>(
            <button key={d} onClick={()=>setDevice(d)} title={d}
              style={{ width:32, height:28, borderRadius:6, border:'none', cursor:'pointer', background: device===d?'#fff':'transparent', color: device===d?'#b8860b':'#888', transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon size={14}/>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={handleUndo}
            style={{ padding:'7px 12px', fontSize:11, border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', borderRadius:4, color:'#6b6b6b' }}
            title="Undo">↩ Undo</button>
          <button onClick={handleClear}
            style={{ padding:'7px 12px', fontSize:11, border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', borderRadius:4, color:'#6b6b6b' }}>
            Clear
          </button>
          <a href="http://localhost:3011" target="_blank" rel="noreferrer"
            style={{ padding:'7px 14px', fontSize:11, border:'1px solid #e5e0d8', background:'#fff', cursor:'pointer', borderRadius:4, color:'#6b6b6b', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            <Eye size={12}/> Preview
          </a>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'7px 18px', fontSize:11, fontWeight:600, background: saving?'#888':'#1a1a1a', color:'#fff', border:'none', cursor:'pointer', borderRadius:4, letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:6 }}>
            <Save size={12}/>{saving?'Saving…':'Save & Publish'}
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ──────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* LEFT — Block library */}
        <div style={{ width:220, flexShrink:0, background:'#fafaf8', borderRight:'1px solid #e5e0d8', display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Search */}
          <div style={{ padding:'10px 10px 6px' }}>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search blocks…"
              style={{ width:'100%', padding:'7px 10px', fontSize:11, border:'1px solid #e5e0d8', borderRadius:4, outline:'none', background:'#fff' }}/>
          </div>

          {/* Blocks list */}
          <div style={{ flex:1, overflowY:'auto', padding:'4px 8px 16px' }}>
            {categories.map(cat=>{
              const catBlocks = filtered.filter(b=>b.cat===cat);
              if (!catBlocks.length) return null;
              return (
                <div key={cat}>
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#b8860b', padding:'12px 4px 6px' }}>{cat}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                    {catBlocks.map(block=>(
                      <button key={block.id}
                        onClick={()=>addBlock(block)}
                        draggable
                        onDragStart={e=>{ e.dataTransfer.setData('text/plain', block.id); }}
                        style={{ padding:'10px 6px', border:'1px solid #e5e0d8', borderRadius:4, background:'#fff', cursor:'pointer', textAlign:'center', transition:'all .15s', fontSize:10 }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='#b8860b'; e.currentTarget.style.background='#fdf8f3'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e0d8'; e.currentTarget.style.background='#fff'; }}
                        title={`Click to add: ${block.label}`}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{block.thumb}</div>
                        <div style={{ fontSize:10, color:'#4a4a4a', fontWeight:500, lineHeight:1.3 }}>{block.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom hint */}
          <div style={{ padding:'8px 12px', borderTop:'1px solid #e5e0d8', fontSize:10, color:'#aaa', textAlign:'center', lineHeight:1.4 }}>
            Click block to add<br/>Drag to reorder in canvas
          </div>
        </div>

        {/* CENTER — GrapesJS canvas */}
        <div style={{ flex:1, position:'relative', background:'#e8e4df', overflow:'hidden' }}>
          {loading && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fdf8f3', zIndex:10 }}>
              <div style={{ width:32, height:32, border:'2px solid #b8860b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite', marginBottom:12 }}/>
              <p style={{ fontSize:12, color:'#6b6b6b', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading editor…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          <div ref={containerRef} style={{ width:'100%', height:'100%' }}/>

          {/* Empty state */}
          {!loading && editor && editor.getComponents().length === 0 && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:5 }}>
              <div style={{ textAlign:'center', padding:40 }}>
                <p style={{ fontSize:32, marginBottom:16 }}>🏗️</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>Start building</p>
                <p style={{ fontSize:13, color:'#6b6b6b' }}>Click any block on the left to add it to the page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GrapesJS minimal overrides */}
      <style>{`
        .gjs-cv-canvas { background: #e8e4df !important; }
        .gjs-cv-canvas .gjs-frame { box-shadow: 0 4px 40px rgba(0,0,0,0.15); }
        .gjs-selected { outline: 2px solid #b8860b !important; outline-offset: -2px; }
        .gjs-hovered  { outline: 1px solid rgba(184,134,11,0.4) !important; }
        .gjs-toolbar  { background: #1a1a1a !important; border-radius: 4px; }
        .gjs-toolbar-item { color: #fff !important; }
      `}</style>
    </div>
  );
}
