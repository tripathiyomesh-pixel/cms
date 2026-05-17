'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sfAPI } from '@/lib/api';
import { Calendar, MessageCircle, MapPin, ArrowRight } from 'lucide-react';

function Hero() {
  return (
    <div style={{ background:'#fdf6ec', paddingTop:80, minHeight:'85vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
      {/* Decorative background pattern */}
      <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238b5e3c' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 5L55 20V40L30 55L5 40V20L30 5z' stroke='%238b5e3c' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize:'60px 60px' }}/>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:60, alignItems:'center', position:'relative', zIndex:1 }}>
        <div>
          {/* Arabic-style decorative element */}
          <div style={{ width:48, height:2, background:'#8b5e3c', marginBottom:24 }}/>
          <p style={{ fontSize:12, color:'#8b6f4a', letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:500, marginBottom:16 }}>
            Welcome to Our Boutique
          </p>
          <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", color:'#3d2b1a', fontSize:'clamp(38px,5vw,68px)', fontWeight:400, lineHeight:1.1, marginBottom:20 }}>
            Jewellery Crafted<br/>
            <em style={{ fontStyle:'italic', color:'#8b5e3c' }}>with Love</em>
          </h1>
          <p style={{ color:'#8b6f4a', fontSize:15, lineHeight:1.8, marginBottom:40, maxWidth:480 }}>
            Certified diamonds, coloured gemstones, and fine jewellery. Visit our boutique for a private consultation. WhatsApp us for immediate assistance.
          </p>

          {/* Primary CTAs */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:40 }}>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#25d366', color:'#fff', padding:'16px 28px', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none' }}>
              <MessageCircle size={18}/> WhatsApp Us Now
            </a>
            <Link href="/appointment"
              style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#8b5e3c', color:'#fff', padding:'16px 28px', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none' }}>
              <Calendar size={18}/> Book Appointment
            </Link>
          </div>

          {/* Quick stats */}
          <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
            {[['Certified','GIA & IGI'],['Trusted','Since years'],['Custom','Jewellery']].map(([k,v])=>(
              <div key={k} style={{ borderLeft:'2px solid #e8d5bc', paddingLeft:16 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", color:'#3d2b1a', fontSize:20, fontWeight:400 }}>{k}</div>
                <div style={{ color:'#8b6f4a', fontSize:12, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — product showcase cards */}
        <div style={{ position:'relative' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:8, boxShadow:'0 20px 60px rgba(139,94,60,0.12)' }}>
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80"
              alt="Fine Jewellery" style={{ width:'100%', borderRadius:14, objectFit:'cover', aspectRatio:'1' }}/>
          </div>
          {/* Floating cards */}
          <div style={{ position:'absolute', bottom:-20, left:-30, background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 8px 32px rgba(139,94,60,0.15)', minWidth:180 }}>
            <div style={{ fontSize:11, color:'#8b6f4a', marginBottom:4 }}>Today's featured</div>
            <div style={{ fontFamily:"'Playfair Display', serif", color:'#3d2b1a', fontSize:16, fontWeight:400 }}>18K Diamond Ring</div>
            <div style={{ color:'#8b5e3c', fontSize:14, fontWeight:600, marginTop:4 }}>AED 12,500</div>
          </div>
          <div style={{ position:'absolute', top:20, right:-20, background:'#8b5e3c', borderRadius:12, padding:'12px 16px', color:'#fff' }}>
            <div style={{ fontSize:11, opacity:0.7 }}>GIA Certified</div>
            <div style={{ fontSize:18, fontWeight:700 }}>✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Services() {
  return (
    <section style={{ background:'#f5ebe0', padding:'60px 40px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
        {[
          { icon:'💬', title:'WhatsApp Enquiry', sub:'Message us anytime. Instant response from our gemologists.', cta:'Chat now', href:`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`, external:true },
          { icon:'📅', title:'Book Appointment', sub:'Private boutique visit. View diamonds and jewellery in person.', cta:'Book now', href:'/appointment', external:false },
          { icon:'✏️', title:'Custom Jewellery', sub:'Your design, our craftsmanship. From sketch to finished piece.', cta:'Get started', href:'/custom', external:false },
        ].map(s=>(
          <div key={s.title} style={{ background:'#fff', borderRadius:16, padding:'32px 28px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>{s.icon}</div>
            <h3 style={{ fontFamily:"'Playfair Display', serif", color:'#3d2b1a', fontSize:20, fontWeight:400, marginBottom:12 }}>{s.title}</h3>
            <p style={{ color:'#8b6f4a', fontSize:13, lineHeight:1.6, marginBottom:24 }}>{s.sub}</p>
            {s.external
              ? <a href={s.href} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#8b5e3c', fontSize:13, fontWeight:600, textDecoration:'none' }}>{s.cta} <ArrowRight size={14}/></a>
              : <Link href={s.href} style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#8b5e3c', fontSize:13, fontWeight:600, textDecoration:'none' }}>{s.cta} <ArrowRight size={14}/></Link>
            }
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid() {
  const cats = [
    { label:'Diamonds', sub:'Natural & Lab-grown · GIA/IGI certified', href:'/diamonds', color:'#fef9c3' },
    { label:'Engagement Rings', sub:'Solitaire, halo, pave and more', href:'/jewellery?category=rings', color:'#fce7f3' },
    { label:'Necklaces', sub:'Diamond, gemstone, pearl', href:'/jewellery?category=necklaces', color:'#dbeafe' },
    { label:'Gemstones', sub:'Ruby, sapphire, emerald', href:'/gemstones', color:'#ede9fe' },
    { label:'Bracelets', sub:'Tennis, bangle, chain', href:'/jewellery?category=bracelets', color:'#dcfce7' },
    { label:'Custom Order', sub:'Your design idea', href:'/custom', color:'#fff7ed' },
  ];
  return (
    <section style={{ padding:'70px 40px', maxWidth:1200, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <p style={{ color:'#8b6f4a', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>Our Collection</p>
        <h2 style={{ fontFamily:"'Playfair Display', serif", color:'#3d2b1a', fontSize:'clamp(28px,4vw,44px)', fontWeight:400 }}>What are you looking for?</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {cats.map(c=>(
          <Link key={c.label} href={c.href}
            style={{ background:c.color, border:'1px solid #e8d5bc', borderRadius:16, padding:'28px 24px', textDecoration:'none', display:'block', transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(139,94,60,0.1)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <h3 style={{ fontFamily:"'Playfair Display', serif", color:'#3d2b1a', fontSize:20, fontWeight:400, marginBottom:8 }}>{c.label}</h3>
            <p style={{ color:'#8b6f4a', fontSize:12, lineHeight:1.5 }}>{c.sub}</p>
            <div style={{ marginTop:16, color:'#8b5e3c', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
              Explore <ArrowRight size={12}/>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LocationBar() {
  return (
    <div style={{ background:'#3d2b1a', padding:'20px 40px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:40, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(245,240,232,0.7)', fontSize:13 }}>
          <MapPin size={16} style={{ color:'#c9a84c' }}/>
          Dubai, UAE · Open Sunday–Friday 10:00–20:00
        </div>
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', gap:8, color:'#25d366', fontSize:13, fontWeight:600, textDecoration:'none' }}>
          <MessageCircle size={16}/> WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP||'+971 XX XXX XXXX'}
        </a>
      </div>
    </div>
  );
}

export default function BoutiqueWarmHomePage() {
  return (
    <div style={{ background:'#fdf6ec', minHeight:'100vh' }}>
      <Hero/>
      <Services/>
      <CategoryGrid/>
      <LocationBar/>
    </div>
  );
}
