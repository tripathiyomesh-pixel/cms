'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sfAPI } from '@/lib/api';
import { ArrowRight, ChevronRight } from 'lucide-react';

function Hero() {
  const [current, setCurrent] = useState(0);
  const slides = [
    { tag:'New Collection', title:'Diamonds, Simply Beautiful', sub:'Natural and lab-grown diamonds. GIA & IGI certified.', cta:'Shop Diamonds', href:'/diamonds', bg:'#f8f6f3' },
    { tag:'Engagement', title:'Find Your Perfect Ring', sub:'Build your ring — choose a diamond, choose a setting.', cta:'Start Building', href:'/ring-builder', bg:'#f0ede8' },
    { tag:'Fine Jewellery', title:'Crafted for a Lifetime', sub:'Rings, necklaces, earrings in 18K gold and platinum.', cta:'Shop Jewellery', href:'/jewellery', bg:'#f5f5f5' },
  ];
  useEffect(()=>{ const t=setInterval(()=>setCurrent(c=>(c+1)%slides.length),5000); return()=>clearInterval(t); },[]);
  const s = slides[current];

  return (
    <div style={{ background:s.bg, minHeight:'90vh', display:'flex', alignItems:'center', transition:'background .8s', paddingTop:80 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 40px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
        {/* Left — text */}
        <div>
          <span style={{ fontSize:11, color:'#9a8a7a', letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:500 }}>{s.tag}</span>
          <h1 style={{ fontSize:'clamp(36px,4vw,64px)', fontWeight:300, lineHeight:1.1, color:'#1a1a1a', margin:'16px 0 24px', letterSpacing:'-0.02em' }}>
            {s.title}
          </h1>
          <p style={{ color:'#6b6b6b', fontSize:16, lineHeight:1.7, marginBottom:40, maxWidth:420 }}>{s.sub}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link href={s.href} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#1a1a1a', color:'#fff', padding:'14px 28px', borderRadius:40, fontSize:13, fontWeight:500, textDecoration:'none', transition:'all .2s' }}>
              {s.cta} <ArrowRight size={14}/>
            </Link>
            <Link href="/appointment" style={{ display:'inline-flex', alignItems:'center', gap:8, border:'1px solid #d0c8c0', color:'#1a1a1a', padding:'14px 28px', borderRadius:40, fontSize:13, fontWeight:500, textDecoration:'none', transition:'all .2s' }}>
              Book Visit
            </Link>
          </div>
          {/* Trust marks */}
          <div style={{ display:'flex', gap:24, marginTop:48, flexWrap:'wrap' }}>
            {['GIA Certified','IGI Certified','Free Shipping','Returns'].map(t=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:6, color:'#9a8a7a', fontSize:12 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', border:'1px solid #9a8a7a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right — visual */}
        <div style={{ position:'relative' }}>
          <div style={{ background:'#e8e3dc', borderRadius:200, aspectRatio:'1', overflow:'hidden', position:'relative' }}>
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" alt="Jewellery"
              style={{ width:'100%', height:'100%', objectFit:'cover', mixBlendMode:'multiply' }}/>
          </div>
          {/* Floating badge */}
          <div style={{ position:'absolute', bottom:40, left:-20, background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize:11, color:'#9a8a7a', marginBottom:2 }}>Starting from</div>
            <div style={{ fontSize:20, fontWeight:600, color:'#1a1a1a' }}>AED 2,500</div>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
        {slides.map((_,i)=>(
          <button key={i} onClick={()=>setCurrent(i)}
            style={{ width:i===current?24:8, height:8, borderRadius:4, background:i===current?'#1a1a1a':'#ccc', border:'none', cursor:'pointer', transition:'all .3s', padding:0 }}/>
        ))}
      </div>
    </div>
  );
}

function CategoryGrid() {
  const cats = [
    { label:'Diamonds', href:'/diamonds', emoji:'💎', count:'10,000+ certified' },
    { label:'Rings', href:'/jewellery?category=rings', emoji:'💍', count:'500+ styles' },
    { label:'Necklaces', href:'/jewellery?category=necklaces', emoji:'📿', count:'300+ pieces' },
    { label:'Earrings', href:'/jewellery?category=earrings', emoji:'✨', count:'400+ pairs' },
    { label:'Gemstones', href:'/gemstones', emoji:'💜', count:'GRS & SSEF cert' },
    { label:'Pearls', href:'/pearls', emoji:'🤍', count:'South Sea & Tahitian' },
    { label:'Mountings', href:'/mountings', emoji:'⚙️', count:'All styles' },
    { label:'Custom', href:'/custom', emoji:'✏️', count:'Your design' },
  ];
  return (
    <section style={{ padding:'80px 40px', maxWidth:1200, margin:'0 auto' }}>
      <h2 style={{ fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:8, letterSpacing:'-0.02em' }}>Shop by category</h2>
      <p style={{ color:'#9a8a7a', marginBottom:40, fontSize:14 }}>Certified diamonds, fine jewellery and gemstones</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {cats.map(c=>(
          <Link key={c.label} href={c.href}
            style={{ background:'#fafaf8', border:'1px solid #e8e3dc', borderRadius:12, padding:'24px 20px', textDecoration:'none', display:'block', transition:'all .2s', cursor:'pointer' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#f5f0ea'; e.currentTarget.style.borderColor='#c9a84c'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#fafaf8'; e.currentTarget.style.borderColor='#e8e3dc'; }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{c.emoji}</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#1a1a1a', marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:11, color:'#9a8a7a' }}>{c.count}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DiamondSearchBar() {
  const [filters, setFilters] = useState({ type:'NATURAL', shape:'', min_carat:'', max_carat:'' });
  return (
    <section style={{ background:'#1a1a1a', padding:'60px 40px' }}>
      <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:28, fontWeight:300, marginBottom:8, letterSpacing:'-0.02em' }}>Find your diamond</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:40 }}>Search {'{10,000+}'} certified stones</p>
        <div style={{ background:'#fff', borderRadius:12, padding:24, display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:16, alignItems:'end' }}>
          {[
            { label:'Type', options:[['NATURAL','Natural'],['LAB_GROWN','Lab-grown']], key:'type' },
            { label:'Shape', options:[['','All shapes'],['Round','Round'],['Oval','Oval'],['Princess','Princess'],['Cushion','Cushion']], key:'shape' },
            { label:'Min carat', type:'number', key:'min_carat', ph:'0.50' },
            { label:'Max carat', type:'number', key:'max_carat', ph:'3.00' },
          ].map(f=>(
            <div key={f.key}>
              <div style={{ fontSize:11, color:'#9a8a7a', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500 }}>{f.label}</div>
              {f.options ? (
                <select value={filters[f.key]} onChange={e=>setFilters(p=>({...p,[f.key]:e.target.value}))}
                  style={{ width:'100%', border:'1px solid #e8e3dc', borderRadius:8, padding:'10px 12px', fontSize:14, outline:'none', background:'#fafaf8' }}>
                  {f.options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input type="number" value={filters[f.key]} onChange={e=>setFilters(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.ph} style={{ width:'100%', border:'1px solid #e8e3dc', borderRadius:8, padding:'10px 12px', fontSize:14, outline:'none', background:'#fafaf8' }}/>
              )}
            </div>
          ))}
          <Link href={`/diamonds?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v))).toString()}`}
            style={{ background:'#1a1a1a', color:'#fff', padding:'11px 24px', borderRadius:8, fontSize:13, fontWeight:500, textDecoration:'none', whiteSpace:'nowrap', display:'block', textAlign:'center' }}>
            Search
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  useEffect(()=>{ sfAPI.products({ status:'active', limit:4 }).then(r=>setProducts(r.data.data||[])).catch(()=>{}); },[]);
  if (!products.length) return null;
  return (
    <section style={{ padding:'80px 40px', maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:40 }}>
        <div>
          <h2 style={{ fontSize:28, fontWeight:300, color:'#1a1a1a', letterSpacing:'-0.02em' }}>New arrivals</h2>
          <p style={{ color:'#9a8a7a', fontSize:14, marginTop:4 }}>Freshly added to our collection</p>
        </div>
        <Link href="/jewellery" style={{ fontSize:13, color:'#1a1a1a', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>View all <ChevronRight size={14}/></Link>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
        {products.map(p=>(
          <Link key={p.id} href={`/jewellery/${p.slug||p.id}`}
            style={{ textDecoration:'none', display:'block' }}
            onMouseEnter={e=>e.currentTarget.querySelector('.price').style.color='#1a1a1a'}
            onMouseLeave={e=>e.currentTarget.querySelector('.price').style.color='#6b6b6b'}>
            <div style={{ background:'#f5f5f5', borderRadius:8, overflow:'hidden', aspectRatio:'1', marginBottom:16, position:'relative' }}>
              {p.thumb_url ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>💍</div>}
            </div>
            <p style={{ fontSize:12, color:'#9a8a7a', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{p.metal_type?.replace('_',' ')||'Jewellery'}</p>
            <p style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', marginBottom:6, lineHeight:1.3 }}>{p.name}</p>
            <p className="price" style={{ fontSize:15, fontWeight:600, color:'#6b6b6b', transition:'color .2s' }}>{p.currency} {Number(p.final_price||0).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function CleanMinimalHomePage() {
  return (
    <div style={{ background:'#ffffff', minHeight:'100vh' }}>
      <Hero/>
      <CategoryGrid/>
      <DiamondSearchBar/>
      <FeaturedProducts/>
    </div>
  );
}
