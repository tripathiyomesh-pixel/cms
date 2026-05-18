'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ChevronLeft, ChevronRight, Search, MessageCircle } from 'lucide-react';
import { sfAPI } from '@/lib/api';

// ── 1. HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="relative w-full overflow-hidden" style={{ background: '#1a1a1a' }}>
      <img
        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80"
        alt="Frost Yourself"
        className="w-full object-cover"
        style={{ height: 'clamp(400px, 70vh, 800px)', objectPosition: 'center 30%' }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}/>
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300 mb-4">New Collection</p>
          <h1 className="font-serif text-5xl lg:text-7xl text-white font-light leading-tight mb-4">
            Frost Yourself
          </h1>
          <p className="text-white/70 text-base lg:text-lg max-w-md mb-8 leading-relaxed">
            Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.
          </p>
          <Link href="/jewellery" className="inline-flex items-center gap-3 text-sm font-semibold text-white border-b border-white/60 pb-1 hover:border-gold-400 hover:text-gold-400 transition-all">
            Discover the selection <ChevronRight size={16}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── 2. TOP CATEGORIES ──────────────────────────────────────────
function TopCategories() {
  const cats = [
    { name:'Bracelets',          img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=400&q=80',  href:'/jewellery?category=bracelets' },
    { name:'Certified Diamond',  img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',  href:'/diamonds' },
    { name:'Earrings',           img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80',  href:'/jewellery?category=earrings' },
    { name:'High Jewellery',     img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',  href:'/jewellery?is_featured=true' },
    { name:'Jewellery',          img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80',  href:'/jewellery' },
    { name:'Lab Grown',          img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=400&q=80',     href:'/diamonds?type=LAB_GROWN' },
    { name:'Necklaces',          img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',  href:'/jewellery?category=necklaces' },
    { name:'Wedding & Bridal',   img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',  href:'/jewellery?category=bridal' },
  ];
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl text-ink-800 text-center mb-8">Top Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {cats.map(c => (
            <Link key={c.name} href={c.href} className="group flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-gold-400 transition-all duration-300">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <span className="text-xs font-medium text-ink-600 text-center leading-tight group-hover:text-gold-600 transition-colors">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 3. FEATURED PRODUCTS ───────────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [idx, setIdx] = useState(0);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const visible = 4;

  useEffect(() => {
    sfAPI.products({ status:'active', limit:12, sort:'newest' })
      .then(r => setProducts(r.data.data || []))
      .catch(() => setProducts([]));
  }, []);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(products.length - visible, i + 1));

  const shown = products.slice(idx, idx + visible);

  return (
    <section className="py-14" style={{ background: '#fdf8f5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl text-ink-800">Featured Collection</h2>
          <div className="flex gap-2">
            <button onClick={prev} disabled={idx===0} className="w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center hover:border-gold-400 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={next} disabled={idx>=products.length-visible} className="w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center hover:border-gold-400 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name:'Croissant Dome Hoops',      badge:'-10%', img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80' },
              { name:'Diamond Celestial Studs',   badge:'-17%', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=400&q=80' },
              { name:'Medium Flat Hoops',          badge:'',     img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80' },
              { name:'Organic Pearl Stacked Hoops',badge:'',     img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
            ].map(p => (
              <div key={p.name} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-square overflow-hidden bg-ink-50">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  {p.badge && <span className="absolute top-3 left-3 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{p.badge}</span>}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gold-50"><Eye size={13}/></button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gold-50"><Heart size={13}/></button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-ink-700 mb-3">{p.name}</h3>
                  <div className="flex gap-2">
                    {wapp && <a href={`https://wa.me/${wapp}?text=${encodeURIComponent('Hi, I am interested in: '+p.name)}`} target="_blank" rel="noreferrer"
                      className="flex-1 text-center text-xs py-2 bg-ink-800 text-white rounded-full hover:bg-gold-600 transition-colors font-medium">
                      Inquiry Now
                    </a>}
                    <button className="w-9 h-9 border border-ink-200 rounded-full flex items-center justify-center hover:border-gold-400 hover:text-gold-600 transition-colors"><Heart size={13}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {shown.map(p => {
              const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price);
              const disc = hasDiscount ? Math.round((1-parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
              const msg = encodeURIComponent(`Hi, I am interested in: ${p.name}`);
              return (
                <div key={p.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-square overflow-hidden bg-ink-50">
                    {p.thumb_url ? <img src={p.thumb_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}
                    {hasDiscount && <span className="absolute top-3 left-3 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">-{disc}%</span>}
                    {p.is_new && <span className="absolute top-3 left-3 text-[10px] font-bold bg-ink-800 text-white px-2 py-0.5 rounded-full">New</span>}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/jewellery/${p.slug||p.id}`} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gold-50"><Eye size={13}/></Link>
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gold-50"><Heart size={13}/></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-ink-700 mb-1 line-clamp-2">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-ink-800">{p.currency} {Number(p.final_price||0).toLocaleString()}</span>
                      {hasDiscount && <span className="text-xs text-ink-400 line-through">{p.currency} {Number(p.compare_price).toLocaleString()}</span>}
                    </div>
                    <div className="flex gap-2">
                      {wapp && <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                        className="flex-1 text-center text-xs py-2 bg-ink-800 text-white rounded-full hover:bg-gold-600 transition-colors font-medium">
                        Inquiry Now
                      </a>}
                      <button className="w-9 h-9 border border-ink-200 rounded-full flex items-center justify-center hover:border-gold-400 hover:text-gold-600 transition-colors"><Heart size={13}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── 4. PROMO BANNERS ───────────────────────────────────────────
function PromoBanners() {
  const banners = [
    { label:'New Arrivals',   href:'/jewellery?is_new=true',        bg:'#1a1a1a', text:'#c9a84c' },
    { label:'Best Seller',    href:'/jewellery?sort=featured',       bg:'#8b5e3c', text:'#fff' },
    { label:'Clearance Sale', href:'/jewellery?on_sale=true',        bg:'#3d2b1a', text:'#e8d5bc' },
  ];
  return (
    <section className="py-0">
      <div className="grid grid-cols-3">
        {banners.map(b => (
          <Link key={b.label} href={b.href}
            className="flex items-center justify-center py-8 font-serif text-xl font-light hover:opacity-90 transition-opacity"
            style={{ background: b.bg, color: b.text }}>
            {b.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 5. BRAND STORY ─────────────────────────────────────────────
function BrandStory() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-4">Our Promise</p>
            <h2 className="font-serif text-3xl text-ink-800 mb-6">Handcrafted &<br/>Ethically Sourced</h2>
            <div className="space-y-6">
              {[
                { icon:'⚖️', title:'Fair Pricing', desc:'Every piece is priced with transparency. No hidden markups. The price you see reflects the true value of exceptional craftsmanship.' },
                { icon:'✨', title:'High Quality',  desc:'We source only the finest materials — GIA and IGI certified diamonds, ethically sourced gemstones, and 18K gold settings.' },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-ink-700 mb-1">{item.title}</h3>
                    <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
              <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-800 border-b border-ink-300 pb-0.5 hover:border-gold-400 hover:text-gold-600 transition-all">
                Learn More <ChevronRight size={14}/>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80" alt="Handcrafted" className="w-full rounded-2xl object-cover aspect-square"/>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 6. TESTIMONIALS ────────────────────────────────────────────
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const reviews = [
    { name:'Saitama One',    title:'Fabulous Grounds',             text:'An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare and the team made us feel truly special.', img:'https://i.pravatar.cc/80?img=1' },
    { name:'Sara Colinton',  title:'Great vineyard tour and tasting!', text:'The attention to detail in every piece is remarkable. We found our perfect engagement ring and it exceeded all expectations.', img:'https://i.pravatar.cc/80?img=2' },
    { name:'Shetty Jamie',   title:'Stunning Design',              text:'TEJORI has redefined luxury for us. Every visit feels like stepping into a world of elegance and precision.', img:'https://i.pravatar.cc/80?img=3' },
  ];
  const r = reviews[idx];
  return (
    <section className="py-16" style={{ background: '#fdf6ec' }}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-8">What our clients say</p>
        <div className="text-gold-400 text-2xl mb-6">{'★★★★★'}</div>
        <p className="text-ink-600 text-lg leading-relaxed mb-8 font-light italic">"{r.text}"</p>
        <img src={r.img} alt={r.name} className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-gold-300"/>
        <p className="font-semibold text-ink-700">{r.name}</p>
        <p className="text-sm text-gold-600">"{r.title}"</p>
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i===idx?'bg-gold-500 w-6':'bg-ink-300'}`}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 7. COLLECTION BANNERS (2 editorial) ────────────────────────
function CollectionBanners() {
  const cols = [
    { title:'Summer Collections', sub:'Freshwater pearl necklace and earrings', href:'/jewellery', img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80' },
    { title:'Make it memorable',  sub:'Freshwater pearl necklace and earrings', href:'/custom',    img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80' },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {cols.map(c => (
        <div key={c.title} className="relative overflow-hidden group" style={{ height: 400 }}>
          <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
          <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.4)' }}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
            <h3 className="font-serif text-3xl font-light mb-3">{c.title}</h3>
            <p className="text-white/70 text-sm mb-6">{c.sub}</p>
            <Link href={c.href} className="text-sm font-semibold border-b border-white/60 pb-0.5 hover:border-gold-400 hover:text-gold-400 transition-all">
              Explore
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── 8. NEWSLETTER ──────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);
  const submit = async(e) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <section className="py-14 bg-ink-900 text-center">
      <div className="max-w-xl mx-auto px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3">Stay Connected</p>
        <h2 className="font-serif text-2xl text-white font-light mb-3">Latest from Tejori</h2>
        <p className="text-ink-400 text-sm mb-8">Sign up to receive 10% off your next purchase. Plus hear about new arrivals and exclusive offers.</p>
        {done ? (
          <p className="text-green-400 font-medium">✓ Thank you! Your 10% discount is on its way.</p>
        ) : (
          <form onSubmit={submit} className="flex gap-3 max-w-md mx-auto">
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full bg-ink-800 border border-ink-700 text-white text-sm outline-none focus:border-gold-500 transition-colors placeholder-ink-500"/>
            <button type="submit" className="px-6 py-3 bg-gold-500 text-ink-900 rounded-full text-sm font-bold hover:bg-gold-400 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

// ── 9. BRAND LOGOS ─────────────────────────────────────────────
function BrandLogos() {
  const logos = ['GIA', 'IGI', 'HRD', 'AGS', 'GCAL'];
  return (
    <section className="py-10 bg-white border-t border-ink-100">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 text-center mb-6">Certified by</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {logos.map(l => (
            <div key={l} className="text-ink-300 font-serif text-xl font-bold tracking-widest hover:text-gold-500 transition-colors cursor-default">{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 10. EDITORIAL COLLECTIONS ─────────────────────────────────
function EditorialCollections() {
  const cols = [
    { title:'Classics',           sub:'Timeless and elegant jewellery that never goes out of style.',    href:'/jewellery', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80' },
    { title:'The Circle of Life', sub:'Our newest and most technologically advanced collection. A Tejori exclusive.', href:'/jewellery?collection=circle-of-life', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80' },
  ];
  return (
    <section className="space-y-0">
      {cols.map((c, i) => (
        <div key={c.title} className="relative overflow-hidden group" style={{ height: 'clamp(300px, 45vh, 550px)' }}>
          <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
          <div className="absolute inset-0" style={{ background: i===0 ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.5)' }}/>
          <div className={`absolute inset-0 flex flex-col justify-center p-12 lg:p-20 ${i===1?'items-end text-right':'items-start'}`}>
            <h2 className="font-serif text-4xl lg:text-6xl text-white font-light mb-4">{c.title}</h2>
            <p className="text-white/70 text-base max-w-md mb-6">{c.sub}</p>
            <Link href={c.href} className="text-sm font-semibold text-white border-b border-white/60 pb-0.5 hover:border-gold-400 hover:text-gold-400 transition-all">
              Discover the selection
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── 11. LEARNING CENTER ────────────────────────────────────────
function LearningCenter() {
  return (
    <section className="py-0">
      <div className="relative overflow-hidden group" style={{ height: 320 }}>
        <img src="https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80" alt="Learning Center" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        <div className="absolute inset-0" style={{ background:'rgba(10,10,10,0.6)' }}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">Education</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-white font-light mb-4">The Learning Center</h2>
          <p className="text-white/70 max-w-lg text-sm leading-relaxed mb-6">Whether you're buying jewellery for the first time or need a refresher, we've got you covered with our beginner guides.</p>
          <Link href="/blog" className="text-sm font-semibold text-white border-b border-white/50 pb-0.5 hover:border-gold-400 hover:text-gold-400 transition-all">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── 12. ABOUT US ───────────────────────────────────────────────
function AboutUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80" alt="About Tejori" className="w-full rounded-2xl aspect-square object-cover"/>
            <div className="absolute -bottom-5 -right-5 bg-ink-900 rounded-2xl p-5 shadow-xl">
              <p className="text-3xl font-bold text-gold-500 font-serif">60+</p>
              <p className="text-xs text-ink-400 mt-0.5">Years of Legacy</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-4">About us</p>
            <h2 className="font-serif text-3xl text-ink-800 font-light mb-6">Our Heritage</h2>
            <p className="text-ink-500 leading-relaxed mb-4">With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces and personalized customization services.</p>
            <p className="text-ink-500 leading-relaxed mb-8">Founded in 2004, Tejori has become one of the most respected brands in the GCC, combining heritage craftsmanship with contemporary design.</p>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-800 border-b border-ink-300 pb-0.5 hover:border-gold-400 hover:text-gold-600 transition-all">
              Learn More <ChevronRight size={14}/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 13. WHY CHOOSE TEJORI ─────────────────────────────────────
function WhyChoose() {
  const pillars = [
    { icon:'🏆', title:'Authenticity Guaranteed', desc:'Every piece is handpicked and meticulously inspected. We guarantee the authenticity of every diamond and gemstone we sell.' },
    { icon:'💎', title:'Rare & Iconic Jewellery',  desc:'Our rare and iconic jewellery is not just timeless — it\'s a valuable investment. Each piece tells a unique story.' },
    { icon:'✨', title:'Heritage of Craftsmanship',desc:'With a heritage of craftsmanship since 1964, we create masterpieces that last a lifetime. GIA & IGI certified.' },
  ];
  return (
    <section className="py-16" style={{ background:'#fdf6ec' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl text-ink-800 font-light mb-12">Why choose TEJORI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map(p => (
            <div key={p.title} className="flex flex-col items-center">
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-ink-700 mb-3">{p.title}</h3>
              <p className="text-sm text-ink-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 14. UPCOMING EVENTS ────────────────────────────────────────
function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/exhibitions/public`)
      .then(r=>r.json()).then(r=>setEvents((r.data||[]).slice(0,3))).catch(()=>{});
  },[]);

  if (!events.length) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 text-center mb-3">Events</p>
        <h2 className="font-serif text-3xl text-ink-800 text-center font-light mb-10">Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <Link key={ev.id} href={`/exhibitions/${ev.slug}`} className="group card overflow-hidden hover:shadow-lg transition-all">
              <div className="relative overflow-hidden" style={{ height:200 }}>
                {ev.hero_image
                  ? <img src={ev.hero_image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  : <div className="w-full h-full bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-5xl">💎</div>}
                {ev.is_vip && <span className="absolute top-3 left-3 text-[10px] font-bold bg-gold-500 text-white px-2 py-0.5 rounded-full">VIP</span>}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center"><Heart size={13}/></button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-ink-700 mb-1">{ev.title}</h3>
                <p className="text-xs text-ink-400 mb-1">{ev.start_date} · {ev.venue_name}</p>
                {ev.booth_number && <p className="text-xs text-gold-600">Booth {ev.booth_number}</p>}
                <span className="text-xs font-semibold text-gold-600 mt-3 inline-block hover:underline">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MAIN HOMEPAGE ──────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", color:'#1a1a1a' }}>
      <Hero/>
      <TopCategories/>
      <FeaturedProducts/>
      <PromoBanners/>
      <BrandStory/>
      <Testimonials/>
      <CollectionBanners/>
      <Newsletter/>
      <BrandLogos/>
      <EditorialCollections/>
      <LearningCenter/>
      <AboutUs/>
      <WhyChoose/>
      <UpcomingEvents/>
    </div>
  );
}
