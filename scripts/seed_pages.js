/**
 * Seed all 7 TEJORI pages with production-quality HTML content
 * Run: node /tmp/seed_pages.js (or via docker exec)
 */
const { pool } = require('./src/config/database');

const GOLD = '#b8860b';
const DARK = '#1a1a1a';
const CREAM = '#faf6f0';

const pages = [
  {
    slug: 'home',
    title: 'Homepage',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">

  <!-- ANNOUNCEMENT BAR -->
  <div style="background:#1a1a1a;color:#c9a96e;text-align:center;padding:10px 20px;font-size:12px;letter-spacing:3px;text-transform:uppercase;">
    ✦ Complimentary Gift Wrapping &nbsp;|&nbsp; Free UAE Delivery over AED 500 &nbsp;|&nbsp; IGI & GIA Certified &nbsp;|&nbsp; WhatsApp Support 9am–10pm ✦
  </div>

  <!-- HERO -->
  <section style="position:relative;min-height:90vh;background:#111;display:flex;align-items:center;overflow:hidden;">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,10,0.95) 0%,rgba(30,20,10,0.85) 50%,rgba(10,10,10,0.7) 100%);"></div>
    <div style="position:absolute;right:0;top:0;bottom:0;width:55%;background:linear-gradient(135deg,#1a1208,#2d1f0a);display:flex;align-items:center;justify-content:center;opacity:0.4;">
      <div style="font-size:220px;opacity:0.3;filter:blur(2px);">💎</div>
    </div>
    <div style="position:relative;z-index:2;padding:80px 80px;max-width:680px;">
      <p style="font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 20px;">Tejori Fine Jewellery — Est. 2004</p>
      <h1 style="font-size:68px;font-weight:300;line-height:1.05;color:#fff;margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;">Frost<br>Yourself</h1>
      <p style="font-size:18px;color:rgba(255,255,255,0.65);line-height:1.8;margin:0 0 44px;max-width:480px;font-weight:300;">Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals. Worn by women who write their own stories.</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="/jewellery" style="display:inline-block;padding:15px 44px;background:#c9a96e;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Discover the Selection</a>
        <a href="/book-appointment" style="display:inline-block;padding:15px 44px;border:1px solid rgba(255,255,255,0.3);color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Book Appointment</a>
      </div>
    </div>
  </section>

  <!-- TOP CATEGORIES -->
  <section style="padding:90px 60px;background:#fff;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 12px;font-family:Inter,sans-serif;">Explore</p>
    <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 56px;">Top Categories</h2>
    <div style="display:flex;justify-content:center;gap:28px;flex-wrap:wrap;max-width:1100px;margin:0 auto;">
      <a href="/bracelets" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;transition:all 0.3s;">💎</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Bracelets</p>
      </a>
      <a href="/certified-diamond" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">🏅</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Certified Diamond</p>
      </a>
      <a href="/earrings" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">✨</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Earrings</p>
      </a>
      <a href="/high-jewellery" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">👑</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">High Jewellery</p>
      </a>
      <a href="/jewellery" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">💍</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Jewellery</p>
      </a>
      <a href="/lab-grown" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">🌱</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Lab Grown</p>
      </a>
      <a href="/necklaces" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">📿</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Necklaces</p>
      </a>
      <a href="/bridal" style="text-decoration:none;text-align:center;width:140px;">
        <div style="width:140px;height:140px;border-radius:50%;background:#f5f0e8;border:1px solid #e8dcc8;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:44px;">🤍</div>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#333;margin:0;font-family:Inter,sans-serif;">Wedding & Bridal</p>
      </a>
    </div>
  </section>

  <!-- FEATURED PRODUCTS -->
  <section style="padding:90px 60px;background:#faf6f0;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:50px;">
        <div>
          <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 10px;font-family:Inter,sans-serif;">New Arrivals</p>
          <h2 style="font-size:40px;font-weight:300;color:#1a1a1a;margin:0;">Featured Pieces</h2>
        </div>
        <a href="/jewellery" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;border-bottom:1px solid #c9a96e;padding-bottom:3px;font-family:Inter,sans-serif;">View All Pieces</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
        <div style="background:#fff;border:1px solid #ede8e0;">
          <div style="position:relative;aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;">💍</span>
            <div style="position:absolute;top:12px;left:12px;background:#c9a96e;color:#fff;font-size:9px;letter-spacing:1px;padding:3px 8px;font-family:Inter,sans-serif;">NEW</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;font-family:Inter,sans-serif;">18K Rose Gold · IGI Certified</p>
            <h3 style="font-size:16px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Croissant Dome Hoops</h3>
            <p style="font-size:14px;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">AED 8,500</p>
            <a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire Now</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #ede8e0;">
          <div style="position:relative;aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;">✨</span>
            <div style="position:absolute;top:12px;left:12px;background:#1a1a1a;color:#fff;font-size:9px;letter-spacing:1px;padding:3px 8px;font-family:Inter,sans-serif;">-17%</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;font-family:Inter,sans-serif;">22K Yellow Gold · GIA Certified</p>
            <h3 style="font-size:16px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Diamond Celestial Studs</h3>
            <p style="font-size:14px;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">AED 12,200</p>
            <a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire Now</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #ede8e0;">
          <div style="position:relative;aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;">📿</span>
          </div>
          <div style="padding:20px;">
            <p style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;font-family:Inter,sans-serif;">18K White Gold · Lab Grown</p>
            <h3 style="font-size:16px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Organic Pearl Stacked Hoops</h3>
            <p style="font-size:14px;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">AED 6,800</p>
            <a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire Now</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #ede8e0;">
          <div style="position:relative;aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;">💎</span>
            <div style="position:absolute;top:12px;left:12px;background:#c9a96e;color:#fff;font-size:9px;letter-spacing:1px;padding:3px 8px;font-family:Inter,sans-serif;">BEST SELLER</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin:0 0 6px;font-family:Inter,sans-serif;">Platinum · IGI Certified</p>
            <h3 style="font-size:16px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Large Charlotte Hoops</h3>
            <p style="font-size:14px;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">AED 22,000</p>
            <a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire Now</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- HANDCRAFTED BANNER -->
  <section style="padding:90px 60px;background:#1a1a1a;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:60px;text-align:center;">
      <div>
        <div style="font-size:40px;margin-bottom:20px;">⚖️</div>
        <h3 style="font-size:16px;font-weight:400;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;font-family:Inter,sans-serif;">Fair Pricing</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.8;margin:0;">Transparent pricing with no hidden costs. Every piece is priced for its true value — nothing more.</p>
      </div>
      <div>
        <div style="font-size:40px;margin-bottom:20px;">✦</div>
        <h3 style="font-size:16px;font-weight:400;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;font-family:Inter,sans-serif;">High Quality</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.8;margin:0;">Every piece is handcrafted by master artisans using ethically sourced precious metals and certified gemstones.</p>
      </div>
      <div>
        <div style="font-size:40px;margin-bottom:20px;">🌿</div>
        <h3 style="font-size:16px;font-weight:400;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;font-family:Inter,sans-serif;">Ethically Sourced</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.8;margin:0;">Conflict-free diamonds and sustainably sourced gemstones. We believe luxury and responsibility go hand in hand.</p>
      </div>
    </div>
  </section>

  <!-- COLLECTION EDITORIAL -->
  <section style="padding:0;background:#fff;">
    <div style="display:grid;grid-template-columns:1fr 1fr;">
      <div style="min-height:600px;background:linear-gradient(135deg,#2d1f0a,#1a1208);display:flex;align-items:flex-end;padding:60px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.08;font-size:200px;">💍</div>
        <div style="position:relative;z-index:2;">
          <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 12px;font-family:Inter,sans-serif;">2025 Collection</p>
          <h2 style="font-size:40px;font-weight:300;color:#fff;margin:0 0 16px;">Classics</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.6);margin:0 0 28px;line-height:1.7;max-width:380px;">Timeless and elegant jewellery that never goes out of style.</p>
          <a href="/jewellery" style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;text-decoration:none;border-bottom:1px solid #c9a96e;padding-bottom:3px;font-family:Inter,sans-serif;">Discover the Selection →</a>
        </div>
      </div>
      <div style="min-height:600px;background:linear-gradient(135deg,#0a1a0a,#0d2010);display:flex;align-items:flex-end;padding:60px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.08;font-size:200px;">🌱</div>
        <div style="position:relative;z-index:2;">
          <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 12px;font-family:Inter,sans-serif;">Sustainable Luxury</p>
          <h2 style="font-size:40px;font-weight:300;color:#fff;margin:0 0 16px;">The Circle of Life</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.6);margin:0 0 28px;line-height:1.7;max-width:380px;">Our newest and most technologically advanced collection. A Tejori exclusive.</p>
          <a href="/lab-grown" style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;text-decoration:none;border-bottom:1px solid #c9a96e;padding-bottom:3px;font-family:Inter,sans-serif;">Discover the Selection →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- WHATSAPP CTA -->
  <section style="padding:90px 60px;background:#c9a96e;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 14px;font-family:Inter,sans-serif;">Personal Shopping</p>
    <h2 style="font-size:44px;font-weight:300;color:#fff;margin:0 0 16px;">Talk to a Jewellery Expert</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.8);margin:0 auto 40px;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">Our specialists are available on WhatsApp for personal consultations, sizing advice, and bespoke enquiries.</p>
    <a href="https://wa.me/971500000000" style="display:inline-flex;align-items:center;gap:12px;padding:16px 48px;background:#fff;color:#1a1a1a;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">
      💬 &nbsp;Chat on WhatsApp
    </a>
  </section>

  <!-- TESTIMONIALS -->
  <section style="padding:90px 60px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 12px;font-family:Inter,sans-serif;">Client Stories</p>
    <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 56px;">Testimonials</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1100px;margin:0 auto;">
      <div style="background:#fff;padding:40px;border:1px solid #ede8e0;text-align:left;">
        <div style="color:#c9a96e;font-size:20px;margin-bottom:18px;">★★★★★</div>
        <p style="font-size:15px;color:#444;line-height:1.85;margin:0 0 24px;font-style:italic;">"The engagement ring exceeded every expectation. The team guided us through every detail with patience and true expertise."</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
          <div><p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0;font-family:Inter,sans-serif;">Sarah Al-Rashid</p><p style="font-size:11px;color:#999;margin:0;font-family:Inter,sans-serif;">Dubai, UAE</p></div>
        </div>
      </div>
      <div style="background:#fff;padding:40px;border:1px solid #ede8e0;text-align:left;">
        <div style="color:#c9a96e;font-size:20px;margin-bottom:18px;">★★★★★</div>
        <p style="font-size:15px;color:#444;line-height:1.85;margin:0 0 24px;font-style:italic;">"Exceptional quality and service. My wife was overwhelmed with joy. Will definitely return for our anniversary gift."</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
          <div><p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0;font-family:Inter,sans-serif;">Mohammed Al-Farsi</p><p style="font-size:11px;color:#999;margin:0;font-family:Inter,sans-serif;">Abu Dhabi, UAE</p></div>
        </div>
      </div>
      <div style="background:#fff;padding:40px;border:1px solid #ede8e0;text-align:left;">
        <div style="color:#c9a96e;font-size:20px;margin-bottom:18px;">★★★★★</div>
        <p style="font-size:15px;color:#444;line-height:1.85;margin:0 0 24px;font-style:italic;">"Beautiful craftsmanship. The GIA certification gave me complete confidence. Fabulous grounds indeed."</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
          <div><p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0;font-family:Inter,sans-serif;">Priya Menon</p><p style="font-size:11px;color:#999;margin:0;font-family:Inter,sans-serif;">Sharjah, UAE</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- NEWSLETTER -->
  <section style="padding:90px 60px;background:#1a1a1a;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 12px;font-family:Inter,sans-serif;">Latest from Tejori</p>
    <h2 style="font-size:40px;font-weight:300;color:#fff;margin:0 0 14px;">Sign Up &amp; Save 10%</h2>
    <p style="font-size:15px;color:rgba(255,255,255,0.5);margin:0 auto 40px;max-width:460px;line-height:1.8;font-family:Inter,sans-serif;">Sign up to receive 10% off your next purchase, plus new arrivals, exclusive offers and event invitations.</p>
    <div style="display:flex;max-width:460px;margin:0 auto;">
      <input type="email" placeholder="Enter your email address" style="flex:1;padding:14px 20px;border:none;background:#fff;font-size:14px;outline:none;font-family:Inter,sans-serif;"/>
      <button style="padding:14px 28px;background:#c9a96e;color:#fff;border:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:Inter,sans-serif;">Subscribe</button>
    </div>
  </section>

</div>`,
  },

  {
    slug: 'about',
    title: 'About Us',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">

  <!-- PAGE HERO -->
  <section style="padding:120px 80px 80px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Our Story</p>
    <h1 style="font-size:64px;font-weight:300;color:#1a1a1a;margin:0 0 24px;line-height:1.1;">About Us</h1>
    <p style="font-size:18px;color:#888;font-weight:300;margin:0;font-style:italic;">Timeless Craftsmanship, Endless Brilliance.</p>
  </section>

  <!-- OUR PHILOSOPHY -->
  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:center;">
      <div style="aspect-ratio:3/4;background:linear-gradient(135deg,#f5f0e8,#e8dcc8);display:flex;align-items:center;justify-content:center;font-size:120px;">✦</div>
      <div>
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">Philosophy</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 28px;line-height:1.2;">Our Philosophy</h2>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 20px;font-family:Inter,sans-serif;">At TEJORI, our mission is to create exquisite, bespoke jewellery that delights our customers across the globe, from Asia to the US and beyond.</p>
        <p style="font-size:16px;color:#555;line-height:2;margin:0;font-family:Inter,sans-serif;">Every piece we craft — be it a ring, bracelet, necklace, or earrings — is designed with the utmost care and attention to quality, ensuring it is cherished for a lifetime.</p>
      </div>
    </div>
  </section>

  <!-- OUR STORY TIMELINE -->
  <section style="padding:100px 80px;background:#1a1a1a;">
    <div style="max-width:900px;margin:0 auto;text-align:center;">
      <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Heritage</p>
      <h2 style="font-size:42px;font-weight:300;color:#fff;margin:0 0 64px;">Our Story</h2>
      <div style="text-align:left;border-left:1px solid #333;padding-left:48px;position:relative;">
        <div style="position:relative;margin-bottom:56px;">
          <div style="position:absolute;left:-57px;top:4px;width:18px;height:18px;border-radius:50%;background:#c9a96e;border:3px solid #1a1a1a;"></div>
          <p style="font-size:12px;letter-spacing:3px;color:#c9a96e;margin:0 0 10px;font-family:Inter,sans-serif;">1964</p>
          <h3 style="font-size:22px;font-weight:300;color:#fff;margin:0 0 12px;">The Beginning</h3>
          <p style="font-size:15px;color:rgba(255,255,255,0.55);line-height:1.9;margin:0;font-family:Inter,sans-serif;">Narottam Soni moved to Dubai with his brothers to establish a jewellery business. What began as a gold jewellery store soon evolved, as the Soni family became among the first jewellers to introduce diamond jewellery to the Middle East.</p>
        </div>
        <div style="position:relative;margin-bottom:56px;">
          <div style="position:absolute;left:-57px;top:4px;width:18px;height:18px;border-radius:50%;background:#c9a96e;border:3px solid #1a1a1a;"></div>
          <p style="font-size:12px;letter-spacing:3px;color:#c9a96e;margin:0 0 10px;font-family:Inter,sans-serif;">2004</p>
          <h3 style="font-size:22px;font-weight:300;color:#fff;margin:0 0 12px;">TEJORI Founded</h3>
          <p style="font-size:15px;color:rgba(255,255,255,0.55);line-height:1.9;margin:0;font-family:Inter,sans-serif;">Building on this heritage, Kaushik Soni founded TEJORI, beginning with a single store in Dubai's Souk Madinat Jumeirah. The brand has since grown to encompass six retail locations across the UAE.</p>
        </div>
        <div style="position:relative;">
          <div style="position:absolute;left:-57px;top:4px;width:18px;height:18px;border-radius:50%;background:#c9a96e;border:3px solid #1a1a1a;"></div>
          <p style="font-size:12px;letter-spacing:3px;color:#c9a96e;margin:0 0 10px;font-family:Inter,sans-serif;">Today</p>
          <h3 style="font-size:22px;font-weight:300;color:#fff;margin:0 0 12px;">A Trusted Name Worldwide</h3>
          <p style="font-size:15px;color:rgba(255,255,255,0.55);line-height:1.9;margin:0;font-family:Inter,sans-serif;">With six boutiques across the UAE, TEJORI has become a trusted name for discerning clients around the world. From dazzling diamonds to exquisite gemstones, every creation is tailored to delight and inspire.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FOUNDER -->
  <section style="padding:100px 80px;background:#faf6f0;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:center;">
      <div>
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">Leadership</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 10px;">Our Founder</h2>
        <p style="font-size:22px;font-weight:300;color:#c9a96e;margin:0 0 28px;font-style:italic;">Kaushik Soni</p>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 20px;font-family:Inter,sans-serif;">Kaushik Soni is a Certified Diamond Grader, being a graduate from GIA's prestigious gemmologist course from their New York campus. He is also an expert in gemstones.</p>
        <p style="font-size:16px;color:#555;line-height:2;margin:0;font-family:Inter,sans-serif;">As Managing Director, he brings a wealth of expertise and a visionary approach to the dynamic Middle Eastern jewellery market, with an unwavering commitment to quality, craftsmanship, and exceptional service.</p>
      </div>
      <div style="aspect-ratio:3/4;background:linear-gradient(135deg,#2d1f0a,#1a1208);display:flex;align-items:center;justify-content:center;font-size:100px;">👑</div>
    </div>
  </section>

  <!-- VALUES -->
  <section style="padding:90px 60px;background:#fff;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">What We Stand For</p>
    <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 64px;">Our Values</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;max-width:1100px;margin:0 auto;">
      <div><div style="font-size:44px;margin-bottom:20px;">💎</div><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Inter,sans-serif;">Quality</h3><p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Every piece crafted to the highest standards of gemological excellence.</p></div>
      <div><div style="font-size:44px;margin-bottom:20px;">🌿</div><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Inter,sans-serif;">Ethics</h3><p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Conflict-free diamonds and sustainably sourced gemstones, always.</p></div>
      <div><div style="font-size:44px;margin-bottom:20px;">⚖️</div><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Inter,sans-serif;">Transparency</h3><p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Fair pricing and complete transparency on every single piece.</p></div>
      <div><div style="font-size:44px;margin-bottom:20px;">✦</div><h3 style="font-size:15px;font-weight:400;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-family:Inter,sans-serif;">Heritage</h3><p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">60 years of family expertise shaping every jewellery decision we make.</p></div>
    </div>
  </section>

  <!-- BOUTIQUES CTA -->
  <section style="padding:90px 60px;background:#c9a96e;text-align:center;">
    <h2 style="font-size:44px;font-weight:300;color:#fff;margin:0 0 18px;">Visit Our Boutiques</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.85);margin:0 auto 40px;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">Six locations across the UAE. Experience Tejori in person — where every piece tells a story.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="/locations" style="padding:14px 40px;background:#fff;color:#1a1a1a;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Find a Boutique</a>
      <a href="/book-appointment" style="padding:14px 40px;border:1px solid rgba(255,255,255,0.6);color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Book Appointment</a>
    </div>
  </section>

</div>`,
  },

  {
    slug: 'bespoke',
    title: 'Bespoke & Custom',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">

  <section style="padding:140px 80px 100px;background:#1a1a1a;text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Exclusively Yours</p>
    <h1 style="font-size:64px;font-weight:300;color:#fff;margin:0 0 24px;line-height:1.1;">Bespoke &amp; Custom</h1>
    <p style="font-size:18px;color:rgba(255,255,255,0.55);font-weight:300;margin:0 auto;max-width:600px;line-height:1.8;font-family:Inter,sans-serif;">Every love story is unique. Your jewellery should be too. Work with our master craftsmen to create a piece that is entirely and exclusively yours.</p>
  </section>

  <section style="padding:100px 80px;background:#faf6f0;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:72px;">
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">The Process</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0;">How It Works</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;text-align:center;">
        <div>
          <div style="width:80px;height:80px;border-radius:50%;background:#1a1a1a;color:#c9a96e;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">💬</div>
          <div style="font-size:10px;letter-spacing:2px;color:#c9a96e;margin-bottom:10px;font-family:Inter,sans-serif;">STEP 01</div>
          <h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Consultation</h3>
          <p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Meet our jewellery specialists in-boutique or via WhatsApp to discuss your vision, budget, and timeline.</p>
        </div>
        <div>
          <div style="width:80px;height:80px;border-radius:50%;background:#1a1a1a;color:#c9a96e;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">✏️</div>
          <div style="font-size:10px;letter-spacing:2px;color:#c9a96e;margin-bottom:10px;font-family:Inter,sans-serif;">STEP 02</div>
          <h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Design</h3>
          <p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Our designers create detailed sketches and 3D renderings based on your brief, refined until perfect.</p>
        </div>
        <div>
          <div style="width:80px;height:80px;border-radius:50%;background:#1a1a1a;color:#c9a96e;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">💎</div>
          <div style="font-size:10px;letter-spacing:2px;color:#c9a96e;margin-bottom:10px;font-family:Inter,sans-serif;">STEP 03</div>
          <h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Crafting</h3>
          <p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Master artisans handcraft your piece using ethically sourced metals and certified gemstones.</p>
        </div>
        <div>
          <div style="width:80px;height:80px;border-radius:50%;background:#1a1a1a;color:#c9a96e;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">📦</div>
          <div style="font-size:10px;letter-spacing:2px;color:#c9a96e;margin-bottom:10px;font-family:Inter,sans-serif;">STEP 04</div>
          <h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Delivery</h3>
          <p style="font-size:14px;color:#888;line-height:1.8;margin:0;font-family:Inter,sans-serif;">Your bespoke piece is presented in our signature Tejori packaging — a gift in itself.</p>
        </div>
      </div>
    </div>
  </section>

  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
      <div>
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">Bespoke</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 24px;line-height:1.2;">Make It Yours</h2>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 20px;font-family:Inter,sans-serif;">From engagement rings to anniversary gifts, we specialise in creating pieces that carry personal meaning. Choose your metal, gemstone, cut, and setting — every element tailored to your story.</p>
        <ul style="list-style:none;padding:0;margin:0 0 36px;">
          <li style="font-size:14px;color:#555;padding:8px 0;border-bottom:1px solid #f0ebe3;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;">✦</span> Custom engagement rings</li>
          <li style="font-size:14px;color:#555;padding:8px 0;border-bottom:1px solid #f0ebe3;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;">✦</span> Anniversary &amp; milestone pieces</li>
          <li style="font-size:14px;color:#555;padding:8px 0;border-bottom:1px solid #f0ebe3;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;">✦</span> Heritage jewellery redesign</li>
          <li style="font-size:14px;color:#555;padding:8px 0;border-bottom:1px solid #f0ebe3;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;">✦</span> Corporate &amp; gifting commissions</li>
          <li style="font-size:14px;color:#555;padding:8px 0;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;">✦</span> Bridal jewellery sets</li>
        </ul>
        <a href="https://wa.me/971500000000" style="display:inline-block;padding:14px 40px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Start Your Journey</a>
      </div>
      <div style="aspect-ratio:1;background:linear-gradient(135deg,#f5f0e8,#e8dcc8);display:flex;align-items:center;justify-content:center;font-size:120px;">💍</div>
    </div>
  </section>

  <section style="padding:90px 60px;background:#c9a96e;text-align:center;">
    <h2 style="font-size:44px;font-weight:300;color:#fff;margin:0 0 18px;">Ready to Begin?</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.85);margin:0 auto 40px;max-width:480px;line-height:1.8;font-family:Inter,sans-serif;">Book a private consultation with our bespoke team. In-boutique or via WhatsApp — your choice.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="/book-appointment" style="padding:14px 40px;background:#fff;color:#1a1a1a;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Book Consultation</a>
      <a href="https://wa.me/971500000000" style="padding:14px 40px;border:1px solid rgba(255,255,255,0.6);color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">💬 WhatsApp Us</a>
    </div>
  </section>

</div>`,
  },

  {
    slug: 'lab-grown',
    title: 'Lab Grown',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">

  <section style="padding:140px 80px 100px;background:linear-gradient(135deg,#0a1a0a,#0d2010);text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Sustainable Luxury</p>
    <h1 style="font-size:64px;font-weight:300;color:#fff;margin:0 0 24px;line-height:1.1;">Lab Grown<br>Diamonds</h1>
    <p style="font-size:18px;color:rgba(255,255,255,0.55);font-weight:300;margin:0 auto;max-width:600px;line-height:1.8;font-family:Inter,sans-serif;">Physically, chemically, and optically identical to mined diamonds — created sustainably, without compromise on brilliance.</p>
  </section>

  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
      <div>
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">Why Lab Grown</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 28px;line-height:1.2;">The Circle<br>of Life</h2>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 28px;font-family:Inter,sans-serif;">Lab grown diamonds are real diamonds. Created using advanced technology that replicates the natural diamond-growing process, they are graded by the same gemological institutes — IGI and GIA — using the same 4C criteria.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:36px;">
          <div style="padding:20px;background:#faf6f0;border:1px solid #ede8e0;">
            <div style="font-size:28px;margin-bottom:10px;">🌿</div>
            <h4 style="font-size:13px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;text-transform:uppercase;letter-spacing:1px;">Eco-Friendly</h4>
            <p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Up to 85% less environmental impact than mined diamonds.</p>
          </div>
          <div style="padding:20px;background:#faf6f0;border:1px solid #ede8e0;">
            <div style="font-size:28px;margin-bottom:10px;">⚖️</div>
            <h4 style="font-size:13px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;text-transform:uppercase;letter-spacing:1px;">Better Value</h4>
            <p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">More diamond for your budget without any compromise on quality.</p>
          </div>
          <div style="padding:20px;background:#faf6f0;border:1px solid #ede8e0;">
            <div style="font-size:28px;margin-bottom:10px;">🏅</div>
            <h4 style="font-size:13px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;text-transform:uppercase;letter-spacing:1px;">IGI / GIA Certified</h4>
            <p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Every lab grown diamond certified by leading gemological labs.</p>
          </div>
          <div style="padding:20px;background:#faf6f0;border:1px solid #ede8e0;">
            <div style="font-size:28px;margin-bottom:10px;">💎</div>
            <h4 style="font-size:13px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;text-transform:uppercase;letter-spacing:1px;">Identical Brilliance</h4>
            <p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Same hardness, same fire, same brilliance — indistinguishable.</p>
          </div>
        </div>
        <a href="https://wa.me/971500000000" style="display:inline-block;padding:14px 40px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire Now</a>
      </div>
      <div style="aspect-ratio:1;background:linear-gradient(135deg,#0a1a0a,#0d2010);display:flex;align-items:center;justify-content:center;font-size:120px;">🌱</div>
    </div>
  </section>

  <section style="padding:90px 60px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Our Collection</p>
    <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 16px;">Lab Grown Pieces</h2>
    <p style="font-size:16px;color:#888;margin:0 auto 56px;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">Explore our certified lab grown diamond jewellery, set in 18K gold and platinum.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:900px;margin:0 auto;">
      <div style="background:#fff;border:1px solid #ede8e0;">
        <div style="aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;font-size:72px;">🌱</div>
        <div style="padding:24px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin:0 0 6px;font-family:Inter,sans-serif;">Lab Grown · IGI Certified</p><h3 style="font-size:18px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Solitaire Ring 2ct</h3><p style="font-size:15px;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">AED 14,500</p><a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire</a></div>
      </div>
      <div style="background:#fff;border:1px solid #ede8e0;">
        <div style="aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;font-size:72px;">💚</div>
        <div style="padding:24px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin:0 0 6px;font-family:Inter,sans-serif;">Lab Grown · GIA Certified</p><h3 style="font-size:18px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Tennis Bracelet</h3><p style="font-size:15px;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">AED 28,000</p><a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire</a></div>
      </div>
      <div style="background:#fff;border:1px solid #ede8e0;">
        <div style="aspect-ratio:1;background:linear-gradient(135deg,#f9f4ec,#f0e8d8);display:flex;align-items:center;justify-content:center;font-size:72px;">🌿</div>
        <div style="padding:24px;"><p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin:0 0 6px;font-family:Inter,sans-serif;">Lab Grown · IGI Certified</p><h3 style="font-size:18px;font-weight:400;color:#1a1a1a;margin:0 0 8px;">Halo Earrings</h3><p style="font-size:15px;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">AED 9,800</p><a href="#" style="display:block;padding:10px;text-align:center;background:#1a1a1a;color:#fff;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;">Enquire</a></div>
      </div>
    </div>
  </section>

</div>`,
  },

  {
    slug: 'heritage',
    title: 'Our Heritage',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">
  <section style="padding:140px 80px 100px;background:#1a1a1a;text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">60 Years of Excellence</p>
    <h1 style="font-size:64px;font-weight:300;color:#fff;margin:0 0 24px;">Our Heritage</h1>
    <p style="font-size:18px;color:rgba(255,255,255,0.55);font-weight:300;margin:0 auto;max-width:600px;line-height:1.8;font-family:Inter,sans-serif;">A legacy of craftsmanship that began in 1964 and has shaped the finest jewellery tradition in the UAE.</p>
  </section>
  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
      <div style="aspect-ratio:4/5;background:linear-gradient(135deg,#2d1f0a,#1a1208);display:flex;align-items:center;justify-content:center;font-size:100px;">📜</div>
      <div>
        <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 18px;font-family:Inter,sans-serif;">Craftsmanship &amp; Expertise</p>
        <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 28px;line-height:1.2;">Handcrafted &amp;<br>Ethically Sourced</h2>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 20px;font-family:Inter,sans-serif;">Every Tejori piece is born from a deep respect for the art of jewellery making. Our master craftsmen — many trained across generations — bring an unrivalled level of skill and dedication to every creation.</p>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 32px;font-family:Inter,sans-serif;">From the initial sketch to the final polish, each step is carried out with meticulous attention to detail, using only the finest ethically sourced materials.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div style="text-align:center;padding:24px;background:#faf6f0;border:1px solid #ede8e0;"><div style="font-size:36px;margin-bottom:8px;">60+</div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0;font-family:Inter,sans-serif;">Years of Heritage</p></div>
          <div style="text-align:center;padding:24px;background:#faf6f0;border:1px solid #ede8e0;"><div style="font-size:36px;margin-bottom:8px;">6</div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0;font-family:Inter,sans-serif;">UAE Boutiques</p></div>
          <div style="text-align:center;padding:24px;background:#faf6f0;border:1px solid #ede8e0;"><div style="font-size:36px;margin-bottom:8px;">10K+</div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0;font-family:Inter,sans-serif;">Pieces Crafted</p></div>
          <div style="text-align:center;padding:24px;background:#faf6f0;border:1px solid #ede8e0;"><div style="font-size:36px;margin-bottom:8px;">GIA</div><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0;font-family:Inter,sans-serif;">Certified Grader</p></div>
        </div>
      </div>
    </div>
  </section>
  <section style="padding:100px 80px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Our Boutiques</p>
    <h2 style="font-size:42px;font-weight:300;color:#1a1a1a;margin:0 0 16px;">Six Locations Across UAE</h2>
    <p style="font-size:16px;color:#888;margin:0 auto 56px;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">From Dubai Mall to Souk Madinat Jumeirah — find your nearest Tejori boutique.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto 40px;">
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Dubai Mall</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Lower Ground Floor<br>Daily 10am–10pm</p></div>
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Madinat Jumeirah</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Souk Madinat<br>Daily 10am–10pm</p></div>
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Gold Souk, Deira</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Shop 12, Gold Souk<br>Sat–Thu 10am–9pm</p></div>
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Zabeel Saray</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Palm Jumeirah<br>Daily 10am–10pm</p></div>
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Ibn Battuta Mall</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Jebel Ali<br>Daily 10am–10pm</p></div>
      <div style="padding:28px;background:#fff;border:1px solid #ede8e0;text-align:left;"><h4 style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0 0 6px;font-family:Inter,sans-serif;">Dubai Festival City</h4><p style="font-size:13px;color:#888;margin:0;line-height:1.6;font-family:Inter,sans-serif;">Festival Waterfront<br>Daily 10am–10pm</p></div>
    </div>
    <a href="/book-appointment" style="display:inline-block;padding:14px 40px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Book a Boutique Visit</a>
  </section>
</div>`,
  },

  {
    slug: 'care-guide',
    title: 'Care Guide',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">
  <section style="padding:140px 80px 100px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Preserve Your Pieces</p>
    <h1 style="font-size:64px;font-weight:300;color:#1a1a1a;margin:0 0 24px;">Jewellery Care Guide</h1>
    <p style="font-size:18px;color:#888;font-weight:300;margin:0 auto;max-width:600px;line-height:1.8;font-family:Inter,sans-serif;">Care beyond craft. Learn how to keep your Tejori pieces as brilliant as the day you received them.</p>
  </section>
  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:900px;margin:0 auto;">
      <div style="margin-bottom:60px;">
        <h2 style="font-size:32px;font-weight:300;color:#1a1a1a;margin:0 0 24px;display:flex;align-items:center;gap:16px;">💍 <span>Gold Jewellery Care</span></h2>
        <div style="height:1px;background:#f0ebe3;margin-bottom:28px;"></div>
        <p style="font-size:16px;color:#555;line-height:2;margin:0 0 16px;font-family:Inter,sans-serif;">Gold is a durable metal, but daily wear and exposure to chemicals can affect its lustre. Follow these guidelines to keep your gold jewellery in pristine condition:</p>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Remove before swimming, showering, or applying lotions and perfumes.</li>
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Clean with a soft cloth and mild soap dissolved in warm water. Gently rub and rinse thoroughly.</li>
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Store in a soft pouch or lined jewellery box, away from other pieces to prevent scratching.</li>
          <li style="padding:12px 0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Bring to a Tejori boutique for professional polishing once a year.</li>
        </ul>
      </div>
      <div style="margin-bottom:60px;">
        <h2 style="font-size:32px;font-weight:300;color:#1a1a1a;margin:0 0 24px;display:flex;align-items:center;gap:16px;">💎 <span>Diamond Care</span></h2>
        <div style="height:1px;background:#f0ebe3;margin-bottom:28px;"></div>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Diamonds attract grease. Clean regularly with warm water, a drop of dish soap, and a soft toothbrush.</li>
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Avoid chlorine bleach and harsh chemical cleaners which can damage settings.</li>
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Store diamonds separately — they can scratch other gemstones and metals.</li>
          <li style="padding:12px 0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Have settings inspected annually to ensure claws are secure.</li>
        </ul>
      </div>
      <div>
        <h2 style="font-size:32px;font-weight:300;color:#1a1a1a;margin:0 0 24px;display:flex;align-items:center;gap:16px;">📿 <span>Gemstone Care</span></h2>
        <div style="height:1px;background:#f0ebe3;margin-bottom:28px;"></div>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Avoid prolonged exposure to direct sunlight, which can fade certain gemstones.</li>
          <li style="padding:12px 0;border-bottom:1px solid #faf6f0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Pearls are especially delicate — wipe with a soft damp cloth after wearing and store flat.</li>
          <li style="padding:12px 0;font-size:15px;color:#555;display:flex;gap:14px;font-family:Inter,sans-serif;"><span style="color:#c9a96e;flex-shrink:0;">✦</span>Emeralds, opals, and pearls should never be placed in ultrasonic cleaners.</li>
        </ul>
      </div>
    </div>
  </section>
  <section style="padding:90px 60px;background:#1a1a1a;text-align:center;">
    <h2 style="font-size:40px;font-weight:300;color:#fff;margin:0 0 16px;">Professional Cleaning Service</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.55);margin:0 auto 40px;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">Bring any Tejori piece to any of our six boutiques for a complimentary professional cleaning and inspection.</p>
    <a href="/locations" style="display:inline-block;padding:14px 40px;background:#c9a96e;color:#fff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">Find a Boutique</a>
  </section>
</div>`,
  },

  {
    slug: 'faq',
    title: 'FAQ',
    html: `
<div style="font-family:'Cormorant Garamond',Georgia,serif;">
  <section style="padding:140px 80px 100px;background:#faf6f0;text-align:center;">
    <p style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c9a96e;margin:0 0 16px;font-family:Inter,sans-serif;">Got Questions?</p>
    <h1 style="font-size:64px;font-weight:300;color:#1a1a1a;margin:0 0 24px;">Frequently Asked<br>Questions</h1>
    <p style="font-size:18px;color:#888;font-weight:300;margin:0 auto;max-width:500px;line-height:1.8;font-family:Inter,sans-serif;">Everything you need to know about Tejori, our products, and the jewellery buying process.</p>
  </section>
  <section style="padding:100px 80px;background:#fff;">
    <div style="max-width:800px;margin:0 auto;">
      <div style="margin-bottom:48px;">
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin:0 0 24px;font-family:Inter,sans-serif;">Purchasing</p>
        <div style="border-top:1px solid #f0ebe3;">
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">How do I enquire about a piece?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Simply click "Enquire Now" on any product page or WhatsApp us directly at +971 50 000 0000. Our specialists will respond within 2 hours during business hours (9am–10pm daily).</p></div>
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Do you ship internationally?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Yes, we ship to all GCC countries and internationally. All international shipments are fully insured and tracked. Contact us for shipping rates to your country.</p></div>
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Can I visit a boutique to see pieces in person?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Absolutely. We have six boutiques across the UAE. We recommend booking an appointment for a private viewing — book online or WhatsApp us.</p></div>
          <div style="padding:24px 0;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">What payment methods do you accept?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">We accept cash, all major credit cards, bank transfer, and payment plans for selected pieces. Contact us to discuss payment options for higher-value purchases.</p></div>
        </div>
      </div>
      <div style="margin-bottom:48px;">
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin:0 0 24px;font-family:Inter,sans-serif;">Diamonds &amp; Certification</p>
        <div style="border-top:1px solid #f0ebe3;">
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Are your diamonds certified?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Yes. All our diamonds are certified by IGI (International Gemological Institute) or GIA (Gemological Institute of America). Certificates are provided with every diamond purchase.</p></div>
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">What is the difference between natural and lab grown diamonds?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Lab grown diamonds are physically, chemically, and optically identical to natural diamonds. They are created using advanced technology and graded by the same institutions using the same 4C criteria. The key difference is their origin — and their price.</p></div>
          <div style="padding:24px 0;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Are your diamonds conflict-free?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Yes. All Tejori diamonds comply with the Kimberley Process and are 100% conflict-free. We are committed to ethical sourcing across our entire supply chain.</p></div>
        </div>
      </div>
      <div>
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;margin:0 0 24px;font-family:Inter,sans-serif;">Bespoke &amp; Custom</p>
        <div style="border-top:1px solid #f0ebe3;">
          <div style="padding:24px 0;border-bottom:1px solid #f0ebe3;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">How long does a bespoke piece take?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Typically 4–8 weeks from final design approval, depending on complexity. We recommend beginning at least 3 months before any occasion date.</p></div>
          <div style="padding:24px 0;"><h3 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0 0 12px;">Can I bring my own gemstone?</h3><p style="font-size:15px;color:#666;margin:0;line-height:1.8;font-family:Inter,sans-serif;">Yes. We work with client-supplied gemstones and can also redesign or reset heirloom pieces. Bring your stone to any boutique for an initial assessment.</p></div>
        </div>
      </div>
    </div>
  </section>
  <section style="padding:90px 60px;background:#c9a96e;text-align:center;">
    <h2 style="font-size:44px;font-weight:300;color:#fff;margin:0 0 16px;">Still Have Questions?</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.85);margin:0 auto 40px;max-width:460px;line-height:1.8;font-family:Inter,sans-serif;">Our team is available on WhatsApp daily from 9am to 10pm UAE time.</p>
    <a href="https://wa.me/971500000000" style="display:inline-flex;align-items:center;gap:10px;padding:14px 40px;background:#fff;color:#1a1a1a;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Inter,sans-serif;">💬 &nbsp;WhatsApp Us</a>
  </section>
</div>`,
  },
];

async function seed() {
  await client.connect();
  console.log('🔗 Connected');
  for (const pg of pages) {
    await client.query(
      `UPDATE pages SET html_content=$1, grapes_data='{}', status='published', updated_at=NOW() WHERE slug=$2`,
      [pg.html, pg.slug]
    );
    console.log('✅ Seeded:', pg.slug);
  }
  console.log('\n🎉 All 7 pages seeded with Tejori content');
}

const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'jewellery_cms',
  user: process.env.DB_USER || 'cmsuser',
  password: process.env.DB_PASS || 'CmsPass@2026',
});
seed().then(() => client.end()).catch(e => { console.error('❌', e.message); client.end(); process.exit(1); });
