'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { sfAPI } from '@/lib/api';
import { ChevronRight, ArrowRight } from 'lucide-react';

// ── HERO — full viewport editorial ───────────────────────────
function Hero() {
  const [current, setCurrent] = useState(0);
  const slides = [
    { title:'Diamonds of Distinction', sub:'GIA & IGI certified natural and lab-grown diamonds', cta:'Explore Diamonds', href:'/diamonds', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1800&q=80' },
    { title:'Coloured Gemstones', sub:'Burmese rubies. Kashmir sapphires. Colombian emeralds.', cta:'View Gemstones', href:'/gemstones', img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1800&q=80' },
    { title:'Fine Jewellery', sub:'Handcrafted in 18K gold and platinum', cta:'Shop Jewellery', href:'/jewellery', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=80' },
  ];
  useEffect(() => { const t=setInterval(()=>setCurrent(c=>(c+1)%slides.length),6000); return()=>clearInterval(t); },[]);
  const s = slides[current];

  return (
    <div className="relative h-screen min-h-[700px] overflow-hidden bg-black">
      {/* Background image with overlay */}
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ backgroundImage:`url(${s.img})`, backgroundSize:'cover', backgroundPosition:'center' }}>
        <div className="absolute inset-0" style={{ background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)' }}/>
      </div>

      {/* Geometric accent */}
      <div className="absolute top-1/2 right-20 -translate-y-1/2 opacity-10 hidden lg:block">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          <polygon points="200,20 380,110 380,290 200,380 20,290 20,110" stroke="#c9a84c" strokeWidth="1" fill="none"/>
          <polygon points="200,60 340,135 340,265 200,340 60,265 60,135" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-20 max-w-7xl mx-auto">
        {/* Collection label */}
        <div className="flex items-center gap-4 mb-8">
          <div style={{ width:40, height:1, background:'#c9a84c' }}/>
          <span style={{ color:'#c9a84c', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', fontWeight:500 }}>
            Fine Jewellery Collection
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", color:'#f5f0e8', fontSize:'clamp(42px,6vw,88px)', fontWeight:400, lineHeight:1.05, maxWidth:700, marginBottom:24 }}>
          {s.title}
        </h1>

        <p style={{ color:'rgba(245,240,232,0.6)', fontSize:16, marginBottom:48, maxWidth:480, lineHeight:1.7 }}>
          {s.sub}
        </p>

        {/* CTAs */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <Link href={s.href} style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#c9a84c', color:'#0a0a0a', padding:'16px 36px', borderRadius:2, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', transition:'all .2s' }}>
            {s.cta} <ArrowRight size={14}/>
          </Link>
          <Link href="/appointment" style={{ display:'inline-flex', alignItems:'center', gap:10, border:'1px solid rgba(245,240,232,0.3)', color:'#f5f0e8', padding:'16px 36px', borderRadius:2, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', transition:'all .2s' }}>
            Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:40, marginTop:60, paddingTop:40, borderTop:'1px solid rgba(245,240,232,0.1)' }}>
          {[['GIA / IGI','Certified'],['10,000+','Diamonds'],['Custom','Creations']].map(([n,l])=>(
            <div key={l}>
              <div style={{ fontFamily:"'Playfair Display', serif", color:'#c9a84c', fontSize:20, fontWeight:400 }}>{n}</div>
              <div style={{ color:'rgba(245,240,232,0.4)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide counter */}
      <div style={{ position:'absolute', bottom:40, right:40, display:'flex', gap:8, zIndex:10 }}>
        {slides.map((_,i)=>(
          <button key={i} onClick={()=>setCurrent(i)}
            style={{ width:i===current?32:8, height:2, background:i===current?'#c9a84c':'rgba(245,240,232,0.3)', border:'none', borderRadius:1, cursor:'pointer', transition:'all .3s', padding:0 }}/>
        ))}
      </div>
    </div>
  );
}

// ── CATEGORY GRID — dark cards ────────────────────────────────
function CategoryGrid() {
  const cats = [
    { label:'Loose Diamonds', sub:'Natural & Lab-grown', href:'/diamonds', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
    { label:'Coloured Stones', sub:'Ruby, Sapphire, Emerald', href:'/gemstones', img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
    { label:'Fine Jewellery', sub:'Rings, necklaces, earrings', href:'/jewellery', img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
    { label:'Pearls', sub:'South Sea, Tahitian', href:'/pearls', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
    { label:'Mountings', sub:'Solitaire, halo, pave', href:'/mountings', img:'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=600&q=80' },
    { label:'Custom Creation', sub:'Your design. Our craft.', href:'/custom', img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  ];

  return (
    <section style={{ background:'#0a0a0a', padding:'80px 0' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px' }}>
        {/* Section header */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:32, height:1, background:'#c9a84c' }}/>
              <span style={{ color:'#c9a84c', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase' }}>Collections</span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#f5f0e8', fontSize:'clamp(28px,4vw,48px)', fontWeight:400 }}>Explore Our World</h2>
          </div>
          <Link href="/jewellery" style={{ color:'#c9a84c', fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
            View all <ArrowRight size={14}/>
          </Link>
        </div>

        {/* 3-col grid with one large card */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'auto auto', gap:2 }}>
          {cats.map((cat, i) => (
            <Link key={cat.label} href={cat.href}
              style={{ position:'relative', overflow:'hidden', textDecoration:'none', aspectRatio: i===0?'unset':'1', gridRow: i===0?'span 2':'auto', cursor:'pointer', display:'block' }}>
              {/* Image */}
              <div style={{ position:'absolute', inset:0, backgroundImage:`url(${cat.img})`, backgroundSize:'cover', backgroundPosition:'center', transition:'transform .6s ease' }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
              {/* Overlay */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)' }}/>
              {/* Label */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:24 }}>
                <p style={{ fontFamily:"'Playfair Display', serif", color:'#f5f0e8', fontSize:i===0?24:18, fontWeight:400, marginBottom:4 }}>{cat.label}</p>
                <p style={{ color:'rgba(245,240,232,0.5)', fontSize:12, letterSpacing:'0.05em' }}>{cat.sub}</p>
              </div>
              {/* Min height for non-span items */}
              <div style={{ paddingTop: i===0?'100%':'100%' }}/>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURED — product strip ──────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  useEffect(()=>{ sfAPI.products({ status:'active', limit:4, is_featured:'true' }).then(r=>setProducts(r.data.data||[])).catch(()=>{}); },[]);

  if (!products.length) return null;
  return (
    <section style={{ background:'#0a0a0a', padding:'0 0 80px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 40px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:32, height:1, background:'#c9a84c' }}/>
              <span style={{ color:'#c9a84c', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase' }}>Selection</span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#f5f0e8', fontSize:'clamp(24px,3vw,40px)', fontWeight:400 }}>Featured Pieces</h2>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 }}>
          {products.map(p=>(
            <Link key={p.id} href={`/jewellery/${p.slug||p.id}`}
              style={{ background:'#141414', textDecoration:'none', display:'block', cursor:'pointer', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1a1a'}
              onMouseLeave={e=>e.currentTarget.style.background='#141414'}>
              <div style={{ aspectRatio:'4/5', overflow:'hidden', background:'#1a1a1a' }}>
                {p.thumb_url ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>💍</div>}
              </div>
              <div style={{ padding:'20px 16px' }}>
                <p style={{ color:'rgba(245,240,232,0.4)', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:6 }}>{p.metal_type?.replace('_',' ')||'Fine Jewellery'}</p>
                <p style={{ fontFamily:"'Playfair Display', serif", color:'#f5f0e8', fontSize:16, fontWeight:400, marginBottom:8, lineHeight:1.3 }}>{p.name}</p>
                <p style={{ color:'#c9a84c', fontSize:14, fontWeight:500 }}>{p.currency} {Number(p.final_price||0).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── APPOINTMENT SECTION ───────────────────────────────────────
function AppointmentSection() {
  return (
    <section style={{ background:'#111', padding:'100px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
      {/* Decorative lines */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.08)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.12)', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:40, height:1, background:'#c9a84c' }}/>
          <span style={{ color:'#c9a84c', fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase' }}>Boutique Experience</span>
          <div style={{ width:40, height:1, background:'#c9a84c' }}/>
        </div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#f5f0e8', fontSize:'clamp(32px,5vw,60px)', fontWeight:400, marginBottom:16, lineHeight:1.1 }}>
          Visit Our Boutique
        </h2>
        <p style={{ color:'rgba(245,240,232,0.4)', fontSize:16, maxWidth:500, margin:'0 auto 48px', lineHeight:1.7 }}>
          Private appointments with our gemologists. View certified diamonds in person. Design your custom jewellery.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/appointment" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#c9a84c', color:'#0a0a0a', padding:'16px 40px', borderRadius:2, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
            Book Private Appointment
          </Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:10, border:'1px solid rgba(245,240,232,0.2)', color:'#f5f0e8', padding:'16px 40px', borderRadius:2, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}

// ── TRUST STRIP ───────────────────────────────────────────────
function TrustStrip() {
  return (
    <div style={{ background:'#141414', borderTop:'1px solid #2a2a2a', borderBottom:'1px solid #2a2a2a', padding:'24px 40px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'center', flexWrap:'wrap', gap:40 }}>
        {[['GIA & IGI','Certified diamonds'],['Custom Creation','Bespoke jewellery'],['Private Appointments','Boutique experience'],['Worldwide','Insured delivery']].map(([t,s])=>(
          <div key={t} style={{ textAlign:'center' }}>
            <div style={{ color:'#c9a84c', fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600, marginBottom:3 }}>{t}</div>
            <div style={{ color:'rgba(245,240,232,0.4)', fontSize:11 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LuxuryDarkHomePage() {
  return (
    <div style={{ background:'#0a0a0a', minHeight:'100vh' }}>
      <Hero/>
      <TrustStrip/>
      <CategoryGrid/>
      <FeaturedProducts/>
      <AppointmentSection/>
    </div>
  );
}
