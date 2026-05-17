'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, Phone } from 'lucide-react';

const NAV = [
  { label:'High Jewellery', href:'/jewellery?is_featured=true', sub:[
    { label:'Rings',         href:'/jewellery?category=rings' },
    { label:'Necklaces',     href:'/jewellery?category=necklaces' },
    { label:'Earrings',      href:'/jewellery?category=earrings' },
    { label:'Bracelets',     href:'/jewellery?category=bracelets' },
    { label:'Bridal Sets',   href:'/jewellery?category=bridal' },
  ]},
  { label:'Jewellery',      href:'/jewellery', sub:[
    { label:'All Jewellery', href:'/jewellery' },
    { label:'New Arrivals',  href:'/jewellery?is_new=true' },
    { label:'On Sale',       href:'/jewellery?on_sale=true' },
  ]},
  { label:'Diamonds',  href:'/diamonds', sub:[
    { label:'Natural Diamonds',   href:'/diamonds?type=NATURAL' },
    { label:'Lab-Grown Diamonds', href:'/diamonds?type=LAB_GROWN' },
  ]},
  { label:'Gemstones', href:'/gemstones', sub:[
    { label:'Ruby',      href:'/gemstones?type=Ruby' },
    { label:'Sapphire',  href:'/gemstones?type=Sapphire' },
    { label:'Emerald',   href:'/gemstones?type=Emerald' },
    { label:'All stones',href:'/gemstones' },
  ]},
  { label:'Pearls',    href:'/pearls' },
  { label:'Customisation', href:'/custom' },
  { label:'News',      href:'/blog' },
  { label:'La Maison', href:'/about', sub:[
    { label:'About us',          href:'/about' },
    { label:'Boutique Finder',   href:'/boutiques' },
    { label:'Exhibitions',       href:'/exhibitions' },
    { label:'Ring Builder',      href:'/ring-builder' },
    { label:'Verify Certificate',href:'/verify' },
    { label:'Book Appointment',  href:'/appointment' },
  ]},
];

export default function Header({ template }) {
  const [open,     setOpen]     = useState(false);
  const [active,   setActive]   = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener('scroll',fn);
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  const isDark   = ['luxury-dark','diamond-dealer'].includes(template?.id);
  const isWarm   = template?.id === 'boutique-warm';
  const textColor= isDark ? '#f5f0e8' : isWarm ? '#3d2b1a' : '#1a1a1a';
  const accent   = template?.colors?.accent || '#c9a84c';
  const navBg    = scrolled
    ? (isDark ? 'rgba(10,10,10,0.97)' : isWarm ? '#fdf6ec' : '#ffffff')
    : (isDark ? 'rgba(10,10,10,0.6)'  : isWarm ? '#fdf6ec' : '#ffffff');

  return (
    <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, backdropFilter:'blur(12px)', background:navBg, borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':isWarm?'#e8d5bc':'rgba(0,0,0,0.08)'}`, transition:'all .3s' }}>
      {/* Top bar */}
      <div style={{ background:isDark?'#c9a84c':isWarm?'#3d2b1a':'#1a1a1a', color:'#fff', textAlign:'center', padding:'6px 20px', fontSize:11, letterSpacing:'0.08em' }}>
        GIA & IGI Certified · Worldwide Shipping · WhatsApp for instant support
      </div>

      {/* Main nav */}
      <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', height:60 }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginRight:40, flexShrink:0 }}>
          <div style={{ width:32, height:32, background:accent, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:400, color:textColor, letterSpacing:'-0.01em' }}>
            {process.env.NEXT_PUBLIC_STORE_NAME||'JewelCMS'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:2, flex:1, overflow:'hidden' }}>
          {NAV.map(item=>(
            <div key={item.label} style={{ position:'relative' }}
              onMouseEnter={()=>setActive(item.label)}
              onMouseLeave={()=>setActive(null)}>
              <Link href={item.href}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:6, fontSize:13, fontWeight:500, color:textColor, textDecoration:'none', opacity:0.85, transition:'opacity .15s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                onMouseLeave={e=>e.currentTarget.style.opacity='0.85'}>
                {item.label}
                {item.sub && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </Link>

              {item.sub && active===item.label && (
                <div style={{ position:'absolute', top:'100%', left:0, paddingTop:8, minWidth:200, zIndex:200 }}>
                  <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden', padding:'8px 0' }}>
                    {item.sub.map(s=>(
                      <Link key={s.label} href={s.href}
                        style={{ display:'block', padding:'10px 20px', fontSize:13, color:'#1a1a1a', textDecoration:'none', transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f5f0ea'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer"
            style={{ display:'flex', alignItems:'center', gap:6, background:'#25d366', color:'#fff', padding:'7px 14px', borderRadius:50, fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <Phone size={12}/> WhatsApp
          </a>
          <Link href="/verify"
            style={{ padding:'7px 14px', borderRadius:50, fontSize:12, fontWeight:500, color:textColor, textDecoration:'none', opacity:0.7, border:`1px solid ${isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)'}` }}>
            Verify Cert
          </Link>
          <button onClick={()=>setOpen(!open)} style={{ display:'flex', padding:8, border:'none', background:'transparent', cursor:'pointer', color:textColor }}>
            {open?<X size={20}/>:<Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background:isDark?'#0a0a0a':isWarm?'#fdf6ec':'#fff', borderTop:`1px solid ${isDark?'#2a2a2a':isWarm?'#e8d5bc':'#f0f0f0'}`, padding:'16px 24px', maxHeight:'70vh', overflowY:'auto' }}>
          {NAV.map(item=>(
            <div key={item.label}>
              <Link href={item.href} onClick={()=>setOpen(false)}
                style={{ display:'block', padding:'12px 0', fontSize:15, fontWeight:500, color:textColor, textDecoration:'none', borderBottom:`1px solid ${isDark?'#1a1a1a':isWarm?'#f0e4d0':'#f5f5f5'}` }}>
                {item.label}
              </Link>
              {item.sub?.map(s=>(
                <Link key={s.label} href={s.href} onClick={()=>setOpen(false)}
                  style={{ display:'block', padding:'8px 16px', fontSize:13, color:isDark?'rgba(245,240,232,0.5)':'#9a8a7a', textDecoration:'none' }}>
                  {s.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
