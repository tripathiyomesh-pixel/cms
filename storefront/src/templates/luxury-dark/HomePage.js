'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Heart, Eye } from 'lucide-react';
import { sfAPI } from '@/lib/api';

// ── HERO ───────────────────────────────────────────────────────
function Hero() {
  const [cur, setCur] = useState(0);
  const slides = [
    { title:'Frost Yourself',       sub:'Dazzling pear and marquise diamonds, sculpted to mirror the wild beauty of ice crystals.', cta:'Discover the selection', href:'/jewellery?collection=frost',   img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80' },
    { title:'Classics Collection',  sub:'Timeless and elegant jewellery that never goes out of style.',                              cta:'Explore Classics',        href:'/jewellery?collection=classics', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=1800&q=80' },
    { title:'The Circle of Life',   sub:'Our newest and most technologically advanced collection. A Tejori exclusive.',              cta:'View Collection',          href:'/jewellery?collection=circle-of-life', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1800&q=80' },
  ];
  useEffect(() => { const t = setInterval(() => setCur(c => (c+1)%slides.length), 6000); return () => clearInterval(t); }, []);
  const s = slides[cur];

  return (
    <div className="relative w-full overflow-hidden" style={{ height:'clamp(480px,75vh,860px)' }}>
      <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"/>
      <div className="absolute inset-0" style={{ background:'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' }}/>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full max-w-screen-xl mx-auto px-8 lg:px-16">
          <p className="tejori-label mb-4">New Collection</p>
          <h1 className="font-cormorant text-5xl lg:text-7xl text-white font-light leading-tight mb-5" style={{ maxWidth:600 }}>
            {s.title}
          </h1>
          <p className="text-white/70 text-base lg:text-lg mb-8 leading-relaxed" style={{ maxWidth:440 }}>{s.sub}</p>
          <Link href={s.href} className="inline-flex items-center gap-3 text-sm font-medium text-white border-b border-white/50 pb-1 hover:border-yellow-400 hover:text-yellow-400 transition-all" style={{ letterSpacing:'0.05em' }}>
            {s.cta} <ChevronRight size={15}/>
          </Link>
        </div>
      </div>
      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_,i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`h-0.5 transition-all duration-300 ${i===cur?'w-8 bg-white':'w-4 bg-white/40'}`}/>
        ))}
      </div>
    </div>
  );
}

// ── TOP CATEGORIES ─────────────────────────────────────────────
function TopCategories() {
  const cats = [
    { name:'Bracelets',        img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=300&q=80', href:'/jewellery?category=bracelets' },
    { name:'Certified Diamond',img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80', href:'/diamonds' },
    { name:'Earrings',         img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300&q=80', href:'/jewellery?category=earrings' },
    { name:'High Jewellery',   img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=300&q=80', href:'/jewellery?type=high' },
    { name:'Jewellery',        img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=300&q=80', href:'/jewellery' },
    { name:'Lab Grown',        img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=300&q=80',   href:'/lab-grown' },
    { name:'Necklaces',        img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80', href:'/jewellery?category=necklaces' },
    { name:'Wedding & Bridal', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80', href:'/jewellery?category=bridal' },
  ];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <h2 className="font-cormorant text-3xl text-center mb-10" style={{ color:'#1a1a1a', fontWeight:400, letterSpacing:'0.02em' }}>Top Categories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {cats.map(c => (
            <Link key={c.name} href={c.href} className="flex flex-col items-center gap-2.5 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-yellow-600 transition-all duration-300 flex-shrink-0">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <span className="text-center leading-tight group-hover:text-yellow-700 transition-colors" style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'#4a4a4a', fontWeight:500 }}>
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURED PRODUCTS ──────────────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [start, setStart]       = useState(0);
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const PER  = typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 4;

  // Placeholder products until API loads
  const placeholders = [
    { id:'1', name:'Croissant Dome Hoops',       badge:'-10%', img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80', slug:'croissant-dome-hoops' },
    { id:'2', name:'Diamond Celestial Studs',    badge:'-17%', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=500&q=80', slug:'diamond-celestial-studs' },
    { id:'3', name:'Medium Flat Hoops',           badge:'',     img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=500&q=80', slug:'medium-flat-hoops' },
    { id:'4', name:'Organic Pearl Stacked Hoops', badge:'',     img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80', slug:'organic-pearl-stacked-hoops' },
    { id:'5', name:'Large Charlotte Hoops',       badge:'',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80', slug:'large-charlotte-hoops' },
    { id:'6', name:'Diamond Solitaire Ring',      badge:'NEW',  img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=500&q=80', slug:'diamond-solitaire-ring' },
  ];

  useEffect(() => {
    sfAPI.products({ status:'active', limit:12, sort:'newest' })
      .then(r => { const d = r.data.data || []; if (d.length) setProducts(d); })
      .catch(() => {});
  }, []);

  const list   = products.length ? products : placeholders;
  const shown  = list.slice(start, start + PER);
  const canPrev = start > 0;
  const canNext = start + PER < list.length;

  return (
    <section className="py-16" style={{ background:'#fdf8f3' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="tejori-label mb-2">Featured</p>
            <h2 className="font-cormorant text-3xl" style={{ color:'#1a1a1a', fontWeight:400 }}>Our Selection</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStart(s => Math.max(0, s-PER))} disabled={!canPrev}
              className="w-9 h-9 border flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ borderColor:'#e5e0d8' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
              <ChevronLeft size={15}/>
            </button>
            <button onClick={() => setStart(s => s+PER)} disabled={!canNext}
              className="w-9 h-9 border flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ borderColor:'#e5e0d8' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
              <ChevronRight size={15}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map(p => {
            const hasDiscount = p.compare_price && parseFloat(p.compare_price) > parseFloat(p.final_price||0);
            const disc = hasDiscount ? Math.round((1-parseFloat(p.final_price)/parseFloat(p.compare_price))*100) : 0;
            const badge = p.badge || (hasDiscount ? `-${disc}%` : p.is_new ? 'NEW' : '');
            const href  = `/jewellery/${p.slug||p.id}`;
            const msg   = encodeURIComponent(`Hi, I'm interested in: ${p.name}`);

            return (
              <div key={p.id} className="group bg-white" style={{ border:'1px solid transparent', transition:'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#e5e0d8'}
                onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
                {/* Image */}
                <div className="relative overflow-hidden" style={{ aspectRatio:'1', background:'#f5f0e8' }}>
                  <img src={p.thumb_url||p.img} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  {badge && (
                    <span className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5" style={{ background:'#1a1a1a', fontSize:10, letterSpacing:'0.08em' }}>
                      {badge}
                    </span>
                  )}
                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={href} className="w-8 h-8 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50"><Eye size={13}/></Link>
                    <button className="w-8 h-8 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50"><Heart size={13}/></button>
                  </div>
                  {/* Quick view label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={href} style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1a1a1a', fontWeight:500 }}>
                      Quick View
                    </Link>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-cormorant mb-3" style={{ fontSize:16, color:'#1a1a1a', fontWeight:400, lineHeight:1.3 }}>{p.name}</h3>
                  <div className="flex gap-2 items-center mb-3">
                    {p.final_price && <span style={{ fontSize:13, color:'#6b6b6b' }}>{p.currency} {Number(p.final_price).toLocaleString()}</span>}
                    {hasDiscount && <span style={{ fontSize:12, color:'#aaa', textDecoration:'line-through' }}>{p.currency} {Number(p.compare_price).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    {wapp && (
                      <a href={`https://wa.me/${wapp.replace(/\D/g,'')}?text=${msg}`} target="_blank" rel="noreferrer"
                        className="flex-1 text-center text-white py-2.5 transition-colors"
                        style={{ background:'#1a1a1a', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:500 }}
                        onMouseEnter={e=>e.currentTarget.style.background='#b8860b'}
                        onMouseLeave={e=>e.currentTarget.style.background='#1a1a1a'}>
                        Inquiry Now
                      </a>
                    )}
                    <button className="w-10 flex items-center justify-center border transition-colors" style={{ borderColor:'#e5e0d8' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
                      <Heart size={13}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/jewellery" className="btn-tejori">View All Jewellery</Link>
        </div>
      </div>
    </section>
  );
}

// ── PROMO BANNERS ──────────────────────────────────────────────
function PromoBanners() {
  return (
    <section className="grid grid-cols-3">
      {[
        { label:'New Arrivals',   href:'/jewellery?is_new=true',   bg:'#1a1a1a', color:'#c9a84c' },
        { label:'Best Seller',   href:'/jewellery?sort=featured', bg:'#b8860b', color:'#fff' },
        { label:'Clearance Sale',href:'/jewellery?on_sale=true',  bg:'#3d2b1a', color:'#e8d5bc' },
      ].map(b => (
        <Link key={b.label} href={b.href}
          className="flex items-center justify-center py-8 font-cormorant text-xl font-light hover:opacity-90 transition-opacity"
          style={{ background:b.bg, color:b.color, letterSpacing:'0.05em' }}>
          {b.label}
        </Link>
      ))}
    </section>
  );
}

// ── BRAND STORY ────────────────────────────────────────────────
function BrandStory() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="tejori-label mb-4">Our Promise</p>
          <h2 className="font-cormorant text-4xl mb-2 font-light" style={{ color:'#1a1a1a' }}>Handcrafted &</h2>
          <h2 className="font-cormorant text-4xl mb-8 font-light" style={{ color:'#1a1a1a' }}>Ethically Sourced</h2>
          <div style={{ width:40, height:1, background:'#b8860b', marginBottom:32 }}/>
          <div className="space-y-8">
            {[
              { icon:'⚖️', title:'Fair Pricing',    desc:'Every piece is priced with transparency. The price reflects the true value of exceptional craftsmanship and certified materials.' },
              { icon:'✨', title:'High Quality',     desc:'We source only the finest materials — GIA and IGI certified diamonds, ethically sourced gemstones, and 18K gold settings.' },
            ].map(item => (
              <div key={item.title} className="flex gap-5">
                <span className="text-2xl flex-shrink-0 mt-1">{item.icon}</span>
                <div>
                  <h3 className="font-medium mb-2" style={{ color:'#1a1a1a', fontSize:14, letterSpacing:'0.05em' }}>{item.title}</h3>
                  <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.8 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/about" className="inline-flex items-center gap-2 mt-10"
            style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2, fontWeight:500 }}>
            Learn More <ChevronRight size={13}/>
          </Link>
        </div>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80"
            alt="Handcrafted jewellery" className="w-full object-cover" style={{ aspectRatio:'4/5' }}/>
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ───────────────────────────────────────────────
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const reviews = [
    { name:'Saitama One',   title:'Fabulous Grounds',               text:'An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare and the team made us feel truly special.' },
    { name:'Sara Colinton', title:'Great vineyard tour and tasting!', text:'The attention to detail in every piece is remarkable. We found our perfect engagement ring and it exceeded all expectations.' },
    { name:'Shetty Jamie',  title:'Stunning Design',                 text:'TEJORI has redefined luxury for us. Every visit feels like stepping into a world of elegance and precision.' },
  ];
  const r = reviews[idx];
  return (
    <section className="py-20" style={{ background:'#fdf8f3' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="tejori-label mb-10">What Our Clients Say</p>
        <div style={{ color:'#b8860b', fontSize:20, letterSpacing:4, marginBottom:24 }}>★★★★★</div>
        <p className="font-cormorant text-2xl font-light leading-relaxed mb-8" style={{ color:'#1a1a1a', fontStyle:'italic' }}>
          "{r.text}"
        </p>
        <p className="font-medium mb-1" style={{ fontSize:13, color:'#1a1a1a', letterSpacing:'0.08em' }}>{r.name}</p>
        <p style={{ fontSize:12, color:'#b8860b' }}>"{r.title}"</p>
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="h-px transition-all duration-300"
              style={{ width: i===idx ? 32 : 16, background: i===idx ? '#1a1a1a' : '#d4b896' }}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── COLLECTION BANNERS ─────────────────────────────────────────
function CollectionBanners() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {[
        { title:'Summer Collections', sub:'Freshwater pearl necklace and earrings', href:'/jewellery', img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80' },
        { title:'Make it memorable',  sub:'Bespoke jewellery crafted for life\'s most important moments', href:'/custom', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80' },
      ].map(c => (
        <div key={c.title} className="relative group overflow-hidden" style={{ height:400 }}>
          <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.4)' }}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
            <h3 className="font-cormorant text-4xl font-light text-white mb-3">{c.title}</h3>
            <p className="text-white/70 text-sm mb-8">{c.sub}</p>
            <Link href={c.href}
              className="text-white border-b border-white/50 pb-px hover:border-yellow-400 hover:text-yellow-400 transition-all"
              style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:500 }}>
              Explore
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── EDITORIAL COLLECTIONS ──────────────────────────────────────
function EditorialCollections() {
  return (
    <section>
      {[
        { title:'Classics',           sub:'Timeless and elegant jewellery that never goes out of style.',    href:'/jewellery?collection=classics',      img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80', align:'left' },
        { title:'The Circle of Life', sub:'Our newest and most technologically advanced collection. A Tejori exclusive.', href:'/jewellery?collection=circle-of-life', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80', align:'right' },
      ].map(c => (
        <div key={c.title} className="relative group overflow-hidden" style={{ height:'clamp(320px,45vh,560px)' }}>
          <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.42)' }}/>
          <div className={`absolute inset-0 flex flex-col justify-center p-12 lg:p-24 ${c.align==='right'?'items-end text-right':'items-start'}`}>
            <h2 className="font-cormorant text-5xl lg:text-7xl font-light text-white mb-4">{c.title}</h2>
            <p className="text-white/65 text-base mb-8" style={{ maxWidth:400 }}>{c.sub}</p>
            <Link href={c.href}
              className="text-white border-b border-white/40 pb-px hover:border-yellow-400 hover:text-yellow-400 transition-all"
              style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:500 }}>
              Discover the selection
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── LEARNING CENTER ────────────────────────────────────────────
function LearningCenter() {
  return (
    <div className="relative group overflow-hidden" style={{ height:320 }}>
      <img src="https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=1400&q=80" alt="Learning Center" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
      <div className="absolute inset-0" style={{ background:'rgba(10,10,10,0.58)' }}/>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
        <p className="tejori-label mb-4">Education</p>
        <h2 className="font-cormorant text-4xl font-light text-white mb-4">The Learning Center</h2>
        <p className="text-white/65 text-sm leading-relaxed mb-8" style={{ maxWidth:440 }}>
          Whether you're buying jewellery for the first time or need a refresher, we've got you covered with our beginner guides.
        </p>
        <Link href="/blog" className="text-white border-b border-white/40 pb-px hover:border-yellow-400 hover:text-yellow-400 transition-all"
          style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:500 }}>
          Learn more
        </Link>
      </div>
    </div>
  );
}

// ── ABOUT US ───────────────────────────────────────────────────
function AboutUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=700&q=80" alt="About Tejori"
            className="w-full object-cover" style={{ aspectRatio:'4/5' }}/>
          <div className="absolute bottom-0 right-0 p-5" style={{ background:'#1a1a1a', minWidth:120 }}>
            <p className="font-cormorant text-4xl font-light" style={{ color:'#b8860b' }}>60+</p>
            <p style={{ fontSize:10, color:'#888', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:4 }}>Years of Legacy</p>
          </div>
        </div>
        <div>
          <p className="tejori-label mb-4">About us</p>
          <h2 className="font-cormorant text-4xl font-light mb-6" style={{ color:'#1a1a1a' }}>Our Heritage</h2>
          <div style={{ width:40, height:1, background:'#b8860b', marginBottom:24 }}/>
          <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.9, marginBottom:16 }}>
            With a legacy spanning 60 years, TEJORI is dedicated to offering a wide range of exquisite jewellery pieces and personalized customization services.
          </p>
          <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.9, marginBottom:32 }}>
            Founded in 2004, Tejori has become one of the most respected brands in the GCC, combining heritage craftsmanship with contemporary design.
          </p>
          <Link href="/about" className="inline-flex items-center gap-2"
            style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2, fontWeight:500 }}>
            Learn More <ChevronRight size={13}/>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── WHY CHOOSE TEJORI ──────────────────────────────────────────
function WhyChoose() {
  return (
    <section className="py-20" style={{ background:'#fdf8f3' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <p className="tejori-label text-center mb-3">Our Difference</p>
        <h2 className="font-cormorant text-4xl font-light text-center mb-16" style={{ color:'#1a1a1a' }}>Why choose TEJORI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon:'🏆', title:'Authenticity Guaranteed', desc:'Every piece is handpicked and meticulously inspected. We guarantee the authenticity of every diamond and gemstone.' },
            { icon:'💎', title:'Rare & Iconic Jewellery',  desc:'Our rare and iconic jewellery is not just timeless — it\'s a valuable investment. Each piece tells a unique story.' },
            { icon:'✨', title:'Heritage of Craftsmanship',desc:'With a heritage of craftsmanship since 1964, we create masterpieces that last a lifetime. GIA & IGI certified.' },
          ].map(p => (
            <div key={p.title} className="flex flex-col items-center text-center">
              <span className="text-4xl mb-5">{p.icon}</span>
              <h3 className="mb-3" style={{ fontSize:14, fontWeight:600, letterSpacing:'0.08em', color:'#1a1a1a', textTransform:'uppercase' }}>{p.title}</h3>
              <p style={{ fontSize:13, color:'#6b6b6b', lineHeight:1.8 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── UPCOMING EVENTS ────────────────────────────────────────────
function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL||'/api'}/exhibitions/public`)
      .then(r=>r.json()).then(r=>setEvents((r.data||[]).slice(0,3))).catch(()=>{});
  }, []);
  if (!events.length) return null;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <p className="tejori-label text-center mb-3">Events</p>
        <h2 className="font-cormorant text-4xl font-light text-center mb-12" style={{ color:'#1a1a1a' }}>Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {events.map(ev => (
            <Link key={ev.id} href={`/exhibitions/${ev.slug}`}
              className="group block border transition-colors"
              style={{ borderColor:'#e5e0d8' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
              <div className="overflow-hidden" style={{ height:200, background:'#f5ede2' }}>
                {ev.hero_image
                  ? <img src={ev.hero_image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  : <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>}
              </div>
              <div className="p-5">
                {ev.is_vip && <span className="tejori-label mb-2 block">VIP</span>}
                <h3 className="font-cormorant text-xl font-light mb-1" style={{ color:'#1a1a1a' }}>{ev.title}</h3>
                <p style={{ fontSize:11, color:'#6b6b6b', letterSpacing:'0.05em' }}>{ev.start_date}</p>
                {ev.venue_name && <p style={{ fontSize:11, color:'#6b6b6b' }}>{ev.venue_name}{ev.booth_number?` · Booth ${ev.booth_number}`:''}</p>}
                <p className="mt-3" style={{ fontSize:10, color:'#b8860b', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:500 }}>View Details →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
      <Hero/>
      <TopCategories/>
      <FeaturedProducts/>
      <PromoBanners/>
      <BrandStory/>
      <Testimonials/>
      <CollectionBanners/>
      <EditorialCollections/>
      <LearningCenter/>
      <AboutUs/>
      <WhyChoose/>
      <UpcomingEvents/>
    </div>
  );
}
