'use client';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import Link from 'next/link';
import { Search, Heart, Menu, X, ChevronDown, ArrowUp } from 'lucide-react';

// ── MEGA MENU DATA ─────────────────────────────────────────────
const MEGA_NAV = [
  {
    id: 'high-jewellery', label: 'High Jewellery', href: '/jewellery?type=high',
    cols: [
      { heading:'Type', items:[
        { label:'Necklaces', href:'/jewellery?type=high&category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label:'Earrings',  href:'/jewellery?type=high&category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        { label:'Bracelets', href:'/jewellery?type=high&category=bracelets', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label:'Rings',     href:'/jewellery?type=high&category=rings',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
      ]},
      { heading:'Collections', items:[
        { label:'Aurora',   href:'/jewellery?type=high&collection=aurora',   img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label:'Frost',    href:'/jewellery?type=high&collection=frost',    img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label:'Vivid',    href:'/jewellery?type=high&collection=vivid',    img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label:'Ice Deco', href:'/jewellery?type=high&collection=ice-deco', img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
        { label:'Mallika',  href:'/jewellery?type=high&collection=mallika',  img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
      ]},
    ],
    defaultImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    id: 'jewellery', label: 'Jewellery', href: '/jewellery',
    cols: [
      { heading:'Type', items:[
        { label:'Necklaces', href:'/jewellery?category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label:'Earrings',  href:'/jewellery?category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        { label:'Bracelets', href:'/jewellery?category=bracelets', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label:'Rings',     href:'/jewellery?category=rings',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label:'Pendants',  href:'/jewellery?category=pendants',  img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
      ]},
      { heading:'Collections', items:[
        { label:'Aurora',         href:'/jewellery?collection=aurora',        img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label:'Frost',          href:'/jewellery?collection=frost',         img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label:'Vivid',          href:'/jewellery?collection=vivid',         img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label:'Classics',       href:'/jewellery?collection=classics',      img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label:'Circle of Life', href:'/jewellery?collection=circle-of-life',img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label:'Pearls',         href:'/pearls',                             img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
      ]},
    ],
    defaultImg: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80',
  },
  {
    id: 'lab-diamond', label: 'Lab-Diamond', href: '/lab-grown', badge:'NEW',
    cols: [
      { heading:'Learn', items:[{ label:'What are Lab Grown Diamonds?', href:'/lab-grown', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' }]},
      { heading:'Type', items:[
        { label:'Necklaces', href:'/lab-grown?category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label:'Earrings',  href:'/lab-grown?category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        { label:'Rings',     href:'/lab-grown?category=rings',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
      ]},
    ],
    defaultImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    id: 'bespoke', label: 'Bespoke', href: '/custom',
    cols: [
      { heading:'Services', items:[
        { label:'Pick your diamond',          href:'/diamonds',    img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label:'Designing bespoke jewellery',href:'/custom',      img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label:'Book a consultation',        href:'/appointment', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
      ]},
    ],
    defaultImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    id: 'heritage', label: 'Our Heritage', href: '/about',
    cols: [
      { heading:'About', items:[
        { label:'Legacy',            href:'/about',       img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label:'Find a Boutique',   href:'/boutiques',   img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label:'Book Appointment',  href:'/appointment', img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        { label:'Blog',              href:'/blog',        img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label:'Upcoming Events',   href:'/exhibitions', img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
      ]},
    ],
    defaultImg: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80',
  },
];

// ── GOLD RATE TICKER ──────────────────────────────────────────
function GoldRateTicker() {
  const [rates, setRates] = useState(null);
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${api}/gold-rates/current`).then(r=>r.json()).then(res=>{ if(res.data) setRates(res.data); }).catch(()=>{});
  }, []);
  if (!rates) return <div style={{ width:120 }}/>;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
      <span style={{ fontSize:9, color:'var(--color-accent,#b8860b)', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase' }}>Gold</span>
      <span style={{ fontSize:10, color:'#e8e4df' }}>24K <strong style={{ color:'var(--color-accent,#b8860b)' }}>AED {parseFloat(rates.rate_24k).toFixed(0)}</strong></span>
      <span style={{ fontSize:10, color:'rgba(232,228,223,0.4)' }}>·</span>
      <span style={{ fontSize:10, color:'#e8e4df' }}>22K <strong style={{ color:'var(--color-accent,#b8860b)' }}>AED {parseFloat(rates.rate_22k).toFixed(0)}</strong></span>
    </div>
  );
}

// ── MEGA MENU PANEL ───────────────────────────────────────────
function MegaMenuPanel({ item, onClose }) {
  const [hoverImg, setHoverImg] = useState(item.defaultImg);
  return (
    <div style={{ position:'fixed', top:'var(--nav-height,72px)', left:0, right:0, background:'#fff', borderTop:'1px solid #e5e0d8', borderBottom:'1px solid #e5e0d8', zIndex:300, boxShadow:'0 8px 32px rgba(0,0,0,0.08)', animation:'fadeIn .2s ease' }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'40px', display:'flex', gap:60 }}>
        <div style={{ display:'flex', gap:60, flex:1 }}>
          {item.cols.map(col => (
            <div key={col.heading} style={{ minWidth:160 }}>
              <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#b8860b)', marginBottom:16 }}>{col.heading}</p>
              {col.items.map(link => (
                <Link key={link.label} href={link.href} onClick={onClose}
                  style={{ display:'block', fontSize:13, fontFamily:"'Cormorant Garamond', Georgia, serif", color:'#1a1a1a', padding:'7px 0', transition:'color .15s', letterSpacing:'0.02em' }}
                  onMouseEnter={e=>{ e.currentTarget.style.color='var(--color-accent,#b8860b)'; setHoverImg(link.img); }}
                  onMouseLeave={e=>{ e.currentTarget.style.color='#1a1a1a'; setHoverImg(item.defaultImg); }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ width:320, flexShrink:0 }}>
          <div style={{ width:'100%', height:280, overflow:'hidden', background:'#f5f0e8' }}>
            <img src={hoverImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity .3s' }} key={hoverImg}/>
          </div>
          <Link href={item.href} onClick={onClose} style={{ display:'inline-block', marginTop:16, fontSize:10, fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #1a1a1a', paddingBottom:2 }}>
            View All {item.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── SHARED TOPBAR ──────────────────────────────────────────────
function TopBar({ config }) {
  const topBarBg   = config?.theme_topbar_bg   || '#1a1a1a';
  const topBarText = config?.theme_topbar_text || 'Complimentary shipping · GIA & IGI Certified Diamonds';
  const showTopBar = config?.theme_nav_topbar  !== 'false';
  if (!showTopBar) return null;
  return (
    <div style={{ background: topBarBg, padding:'7px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <GoldRateTicker/>
      <p style={{ fontSize:11, fontWeight:400, letterSpacing:'0.1em', color:'#e8e4df', flex:1, textAlign:'center' }}>{topBarText}</p>
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <CurrencySwitcher/>
        <div style={{ width:1, height:12, background:'rgba(255,255,255,0.2)' }}/>
        <LanguageSwitcher/>
      </div>
    </div>
  );
}

// ── SHARED RIGHT ICONS ─────────────────────────────────────────
function NavIcons({ searchOpen, setSearchOpen, style = {} }) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0, marginLeft:'auto', ...style }}>
      <button onClick={() => setSearchOpen(v=>!v)} style={{ padding:10, background:'none', border:'none', cursor:'pointer', color:'var(--color-text,#1a1a1a)' }}>
        <Search size={17}/>
      </button>
      <Link href="/wishlist" style={{ padding:10, color:'var(--color-text,#1a1a1a)', display:'flex' }}>
        <Heart size={17}/>
      </Link>
      {wapp && (
        <a href={`https://wa.me/${wapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
          style={{ marginLeft:8, padding:'8px 16px', background:'var(--color-text,#1a1a1a)', color:'#fff', fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}>
          💬 WhatsApp
        </a>
      )}
    </div>
  );
}

// ── MOBILE DRAWER ──────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={onClose}/>
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'85vw', maxWidth:360, background:'#fff', overflowY:'auto', animation:'slideIn .3s ease' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #e5e0d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, letterSpacing:'0.15em' }}>TEJORI</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20}/></button>
        </div>
        {MEGA_NAV.map(item => (
          <div key={item.id}>
            <Link href={item.href} onClick={onClose}
              style={{ display:'block', padding:'14px 24px', fontSize:12, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'#1a1a1a', borderBottom:'1px solid #f0ece6' }}>
              {item.label}
            </Link>
            {item.cols?.flatMap(c=>c.items).slice(0,4).map(sub=>(
              <Link key={sub.label} href={sub.href} onClick={onClose}
                style={{ display:'block', padding:'10px 36px', fontSize:12, color:'#6b6b6b', borderBottom:'1px solid #f8f6f3', fontFamily:"'Cormorant Garamond', serif" }}>
                {sub.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HEADER VARIANT: MEGA MENU (default) ───────────────────────
function HeaderMega({ scrolled, config }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const closeTimer = useRef(null);
  const openMenu  = (id) => { clearTimeout(closeTimer.current); setActiveMenu(id); };
  const closeMenu = ()   => { closeTimer.current = setTimeout(() => setActiveMenu(null), 100); };
  const closeNow  = ()   => { clearTimeout(closeTimer.current); setActiveMenu(null); };

  return (
    <>
      <div style={{ background: scrolled ? '#fff' : 'var(--color-nav-bg,rgba(10,10,10,0.95))', borderBottom: scrolled?'1px solid #e5e0d8':'1px solid transparent', boxShadow: scrolled?'0 2px 24px rgba(0,0,0,0.06)':'none', transition:'all .3s', height:72, display:'flex', alignItems:'center' }}>
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'0 32px', width:'100%', display:'flex', alignItems:'center' }}>
          <Link href="/" style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:26, fontWeight:300, letterSpacing:'0.18em', textTransform:'uppercase', color: scrolled?'#1a1a1a':'var(--color-text,#f5f0e8)', marginRight:48, flexShrink:0, textDecoration:'none' }}>
            TEJORI
          </Link>
          <nav style={{ display:'flex', alignItems:'center', flex:1 }} className="hidden lg:flex">
            {MEGA_NAV.map(item => (
              <div key={item.id} onMouseEnter={() => openMenu(item.id)} onMouseLeave={closeMenu} style={{ position:'relative' }}>
                <Link href={item.href}
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'0 14px', height:72, fontSize:11, fontWeight:400, letterSpacing:'0.08em', textTransform:'uppercase', color: activeMenu===item.id?'var(--color-accent,#b8860b)':(scrolled?'#1a1a1a':'var(--color-text,#f5f0e8)'), textDecoration:'none', whiteSpace:'nowrap', borderBottom: activeMenu===item.id?'2px solid var(--color-accent,#b8860b)':'2px solid transparent', transition:'all .2s' }}>
                  {item.label}
                  {item.badge && <span style={{ fontSize:8, fontWeight:700, background:'var(--color-accent,#b8860b)', color:'#fff', padding:'2px 5px', borderRadius:2 }}>{item.badge}</span>}
                </Link>
              </div>
            ))}
          </nav>
          <NavIcons searchOpen={false} setSearchOpen={()=>{}}/>
        </div>
      </div>
      {activeMenu && (
        <div onMouseEnter={() => openMenu(activeMenu)} onMouseLeave={closeMenu} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:199, pointerEvents:'none' }}>
          <div style={{ pointerEvents:'all' }}>
            {MEGA_NAV.filter(i=>i.id===activeMenu).map(item=>(
              <MegaMenuPanel key={item.id} item={item} onClose={closeNow}/>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── HEADER VARIANT: STANDARD ──────────────────────────────────
function HeaderStandard({ scrolled, config }) {
  const [openDrop, setOpenDrop] = useState(null);
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #e5e0d8', height:72, display:'flex', alignItems:'center', boxShadow: scrolled?'0 2px 16px rgba(0,0,0,0.05)':'none', transition:'box-shadow .3s' }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'0 32px', width:'100%', display:'flex', alignItems:'center', gap:0 }}>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:300, letterSpacing:'0.18em', textTransform:'uppercase', color:'#1a1a1a', marginRight:40, flexShrink:0, textDecoration:'none' }}>
          TEJORI
        </Link>
        <nav style={{ display:'flex', alignItems:'center', flex:1 }} className="hidden lg:flex">
          {MEGA_NAV.map(item => (
            <div key={item.id} style={{ position:'relative' }}
              onMouseEnter={() => setOpenDrop(item.id)}
              onMouseLeave={() => setOpenDrop(null)}>
              <Link href={item.href}
                style={{ display:'flex', alignItems:'center', gap:3, padding:'0 14px', height:72, fontSize:11, fontWeight:400, letterSpacing:'0.08em', textTransform:'uppercase', color:'#1a1a1a', textDecoration:'none', whiteSpace:'nowrap', borderBottom: openDrop===item.id?'2px solid var(--color-accent,#b8860b)':'2px solid transparent', transition:'all .2s' }}>
                {item.label}
                {item.cols?.length > 0 && <ChevronDown size={10}/>}
              </Link>
              {openDrop === item.id && item.cols?.length > 0 && (
                <div style={{ position:'absolute', top:72, left:0, background:'#fff', border:'1px solid #e5e0d8', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', minWidth:200, zIndex:300, padding:'12px 0' }}>
                  {item.cols.flatMap(c=>c.items).map(link=>(
                    <Link key={link.label} href={link.href}
                      style={{ display:'block', padding:'9px 20px', fontSize:12, color:'#1a1a1a', textDecoration:'none', fontFamily:"'Cormorant Garamond', serif", letterSpacing:'0.02em', transition:'background .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fdf8f3'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <NavIcons searchOpen={false} setSearchOpen={()=>{}}/>
      </div>
    </div>
  );
}

// ── HEADER VARIANT: CENTERED LOGO ─────────────────────────────
function HeaderCentered({ scrolled, config }) {
  const half = Math.floor(MEGA_NAV.length / 2);
  const leftNav  = MEGA_NAV.slice(0, half);
  const rightNav = MEGA_NAV.slice(half);
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #e5e0d8', height:72, display:'flex', alignItems:'center', boxShadow: scrolled?'0 2px 16px rgba(0,0,0,0.05)':'none', transition:'box-shadow .3s' }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'0 32px', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <nav style={{ display:'flex', alignItems:'center', gap:0 }} className="hidden lg:flex">
          {leftNav.map(item => (
            <Link key={item.id} href={item.href}
              style={{ padding:'0 14px', height:72, display:'flex', alignItems:'center', fontSize:11, fontWeight:400, letterSpacing:'0.08em', textTransform:'uppercase', color:'#1a1a1a', textDecoration:'none', whiteSpace:'nowrap', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--color-accent,#b8860b)'}
              onMouseLeave={e=>e.currentTarget.style.color='#1a1a1a'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:26, fontWeight:300, letterSpacing:'0.2em', textTransform:'uppercase', color:'#1a1a1a', textDecoration:'none', flexShrink:0, padding:'0 24px' }}>
          TEJORI
        </Link>
        <nav style={{ display:'flex', alignItems:'center', gap:0 }} className="hidden lg:flex">
          {rightNav.map(item => (
            <Link key={item.id} href={item.href}
              style={{ padding:'0 14px', height:72, display:'flex', alignItems:'center', fontSize:11, fontWeight:400, letterSpacing:'0.08em', textTransform:'uppercase', color:'#1a1a1a', textDecoration:'none', whiteSpace:'nowrap', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--color-accent,#b8860b)'}
              onMouseLeave={e=>e.currentTarget.style.color='#1a1a1a'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <Link href="/wishlist" style={{ padding:10, color:'#1a1a1a', display:'flex' }}><Heart size={17}/></Link>
        </div>
      </div>
    </div>
  );
}

// ── HEADER VARIANT: MINIMAL ───────────────────────────────────
function HeaderMinimal({ scrolled, config, mobileOpen, setMobileOpen }) {
  return (
    <div style={{ background: scrolled?'#fff':'transparent', borderBottom: scrolled?'1px solid #e5e0d8':'1px solid transparent', height:72, display:'flex', alignItems:'center', transition:'all .3s', boxShadow: scrolled?'0 2px 16px rgba(0,0,0,0.05)':'none' }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'0 32px', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:300, letterSpacing:'0.2em', textTransform:'uppercase', color: scrolled?'#1a1a1a':'var(--color-text,#1a1a1a)', textDecoration:'none' }}>
          TEJORI
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link href="/wishlist" style={{ padding:8, color: scrolled?'#1a1a1a':'var(--color-text,#1a1a1a)', display:'flex' }}><Heart size={17}/></Link>
          <button onClick={() => setMobileOpen(v=>!v)} style={{ padding:8, background:'none', border:'none', cursor:'pointer', color: scrolled?'#1a1a1a':'var(--color-text,#1a1a1a)' }}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BACK TO TOP ────────────────────────────────────────────────
function BackToTop({ show }) {
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
      style={{ position:'fixed', bottom:32, right:32, width:44, height:44, background:'var(--color-accent,#b8860b)', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', zIndex:400, transition:'opacity .3s', opacity: show?1:0 }}
      aria-label="Back to top">
      <ArrowUp size={18}/>
    </button>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────
function SearchBar({ open }) {
  const [query, setQuery] = useState('');
  if (!open) return null;
  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) window.location = `/search?q=${encodeURIComponent(query.trim())}`; };
  return (
    <div style={{ background:'#fdf8f3', borderBottom:'1px solid #e5e0d8', padding:'16px 32px' }}>
      <form onSubmit={handleSearch} style={{ maxWidth:600, margin:'0 auto', display:'flex' }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} autoFocus placeholder="Search jewellery, diamonds, collections…"
          style={{ flex:1, padding:'12px 20px', border:'1px solid #e5e0d8', borderRight:'none', fontSize:13, outline:'none', background:'#fff' }}/>
        <button type="submit" style={{ padding:'12px 24px', background:'#1a1a1a', color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase' }}>Search</button>
      </form>
    </div>
  );
}

// ── MAIN HEADER EXPORT ─────────────────────────────────────────
export default function Header({ template, config }) {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  const headerStyle = config?.theme_header_style  || 'mega';
  const stickyHeader = config?.theme_sticky_header !== 'false';
  const showBackToTop = config?.theme_back_to_top  !== 'false';

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 10);
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const headerEl = (
    <header style={{ position: stickyHeader ? 'sticky' : 'relative', top:0, zIndex:200, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <TopBar config={config}/>

      {headerStyle === 'standard' && <HeaderStandard scrolled={scrolled} config={config}/>}
      {headerStyle === 'centered' && <HeaderCentered scrolled={scrolled} config={config}/>}
      {headerStyle === 'minimal'  && <HeaderMinimal  scrolled={scrolled} config={config} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>}
      {(headerStyle === 'mega' || !headerStyle) && <HeaderMega scrolled={scrolled} config={config}/>}

      <SearchBar open={searchOpen}/>

      {/* Mobile hamburger for non-minimal styles */}
      {headerStyle !== 'minimal' && (
        <button className="lg:hidden" onClick={() => setMobileOpen(v=>!v)}
          style={{ position:'absolute', top:headerStyle==='mega'?72:0, right:16, top:'50%', transform:'translateY(-50%)', padding:8, background:'none', border:'none', cursor:'pointer', color:'var(--color-text,#1a1a1a)', display:'none' }}>
          <Menu size={20}/>
        </button>
      )}
    </header>
  );

  return (
    <>
      {headerEl}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}/>
      {showBackToTop && <BackToTop show={showBackTop}/>}
    </>
  );
}
