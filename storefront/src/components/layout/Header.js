'use client';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import { useCurrency } from '@/components/ui/CurrencySwitcher';
import Link from 'next/link';
import { Search, Heart, Menu, X, ChevronDown } from 'lucide-react';

// ── MEGA MENU DATA — exact from client spec ────────────────────
const MEGA_NAV = [
  {
    id: 'high-jewellery',
    label: 'High Jewellery',
    href: '/jewellery?type=high',
    cols: [
      {
        heading: 'Type',
        items: [
          { label:'Necklaces',   href:'/jewellery?type=high&category=necklaces',   img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'Earrings',    href:'/jewellery?type=high&category=earrings',    img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
          { label:'Bracelets',   href:'/jewellery?type=high&category=bracelets',   img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
          { label:'Rings',       href:'/jewellery?type=high&category=rings',       img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        ],
      },
      {
        heading: 'Collections',
        items: [
          { label:'Aurora',    href:'/jewellery?type=high&collection=aurora',    img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
          { label:'Frost',     href:'/jewellery?type=high&collection=frost',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Vivid',     href:'/jewellery?type=high&collection=vivid',     img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Ice Deco',  href:'/jewellery?type=high&collection=ice-deco',  img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
          { label:'Mallika',   href:'/jewellery?type=high&collection=mallika',   img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    id: 'jewellery',
    label: 'Jewellery',
    href: '/jewellery',
    cols: [
      {
        heading: 'Type',
        items: [
          { label:'Necklaces',   href:'/jewellery?category=necklaces',   img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'Earrings',    href:'/jewellery?category=earrings',    img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
          { label:'Bracelets',   href:'/jewellery?category=bracelets',   img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
          { label:'Rings',       href:'/jewellery?category=rings',       img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Pendants',    href:'/jewellery?category=pendants',    img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Brooches',    href:'/jewellery?category=brooches',    img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
        ],
      },
      {
        heading: 'Collections',
        items: [
          { label:'Aurora',              href:'/jewellery?collection=aurora',            img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
          { label:'Frost',               href:'/jewellery?collection=frost',             img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Vivid',               href:'/jewellery?collection=vivid',             img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Ice Deco',            href:'/jewellery?collection=ice-deco',          img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
          { label:'Mallika',             href:'/jewellery?collection=mallika',           img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
          { label:'Classics',            href:'/jewellery?collection=classics',          img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
          { label:'Circle of Life',      href:'/jewellery?collection=circle-of-life',   img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'Nectar',              href:'/jewellery?collection=nectar',            img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
          { label:'Bloom',               href:'/jewellery?collection=bloom',             img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Malachite and Coral', href:'/jewellery?collection=malachite-coral',  img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Pearls',              href:'/pearls',                                 img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80',
  },
  {
    id: 'lab-diamond',
    label: 'Lab-Diamond',
    href: '/lab-grown',
    badge: 'NEW',
    cols: [
      {
        heading: 'Learn',
        items: [
          { label:'What are Lab Grown Diamonds?', href:'/lab-grown', img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        ],
      },
      {
        heading: 'Type',
        items: [
          { label:'Necklaces', href:'/lab-grown?category=necklaces', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'Earrings',  href:'/lab-grown?category=earrings',  img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
          { label:'Bracelets', href:'/lab-grown?category=bracelets', img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
          { label:'Rings',     href:'/lab-grown?category=rings',     img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Pendants',  href:'/lab-grown?category=pendants',  img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        ],
      },
      {
        heading: 'Collections',
        items: [
          { label:'Classics', href:'/lab-grown?collection=classics', img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
          { label:'Mallika',  href:'/lab-grown?collection=mallika',  img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    id: 'bespoke',
    label: 'Bespoke Services',
    href: '/custom',
    cols: [
      {
        heading: 'Services',
        items: [
          { label:'Pick your diamond',          href:'/diamonds',           img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
          { label:'Designing bespoke jewellery',href:'/custom',             img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
          { label:'Book a consultation',        href:'/appointment',        img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    id: 'news',
    label: 'News',
    href: '/blog',
    cols: [
      {
        heading: 'Discover',
        items: [
          { label:'Stories',             href:'/blog?cat=stories',   img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'News',                href:'/blog?cat=news',      img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
          { label:'Jewellery Care Guide',href:'/blog?cat=care',      img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Blog',                href:'/blog',               img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
          { label:'Upcoming Events',     href:'/exhibitions',        img:'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  },
  {
    id: 'heritage',
    label: 'Our Heritage',
    href: '/about',
    cols: [
      {
        heading: 'About',
        items: [
          { label:'Legacy',                   href:'/about',                           img:'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
          { label:'Craftsmanship & Expertise',href:'/about#craftsmanship',             img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
          { label:'Care Beyond Craft',        href:'/blog?cat=care',                   img:'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
          { label:'Find a Boutique',          href:'/boutiques',                       img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
          { label:'Book Appointment',         href:'/appointment',                     img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        ],
      },
    ],
    defaultImg: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80',
  },
];

// ── MEGA MENU PANEL (Palmiero-style with hover image update) ───
function MegaMenuPanel({ item, onClose }) {
  const [hoverImg, setHoverImg] = useState(item.defaultImg);

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--nav-height, 72px)',
      left: 0, right: 0,
      background: '#fff',
      borderTop: '1px solid #e5e0d8',
      borderBottom: '1px solid #e5e0d8',
      zIndex: 300,
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      animation: 'fadeIn .2s ease',
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '40px 40px', display: 'flex', gap: 60 }}>
        
        {/* Left — columns of links */}
        <div style={{ display: 'flex', gap: 60, flex: 1 }}>
          {item.cols.map(col => (
            <div key={col.heading} style={{ minWidth: 160 }}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8860b', marginBottom: 16 }}>
                {col.heading}
              </p>
              {col.items.map(link => (
                <Link key={link.label} href={link.href}
                  onClick={onClose}
                  onMouseEnter={() => setHoverImg(link.img)}
                  onMouseLeave={() => setHoverImg(item.defaultImg)}
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: '#1a1a1a',
                    padding: '7px 0',
                    borderBottom: '1px solid transparent',
                    transition: 'all .15s',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#b8860b'; setHoverImg(link.img); }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#1a1a1a'; setHoverImg(item.defaultImg); }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Right — live preview image (updates on hover) */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{ width: '100%', height: 280, overflow: 'hidden', background: '#f5f0e8' }}>
            <img
              src={hoverImg}
              alt="Collection preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .3s ease' }}
              key={hoverImg}
            />
          </div>
          <Link href={item.href} onClick={onClose}
            style={{ display: 'inline-block', marginTop: 16, fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', borderBottom: '1px solid #1a1a1a', paddingBottom: 2 }}>
            View All {item.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── MAIN HEADER ────────────────────────────────────────────────
// ── GOLD RATE TICKER ──────────────────────────────────────────
function GoldRateTicker() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${api}/gold-rates/current`)
      .then(r => r.json())
      .then(res => { if (res.data) setRates(res.data); })
      .catch(() => {});
  }, []);

  if (!rates) return <div style={{ width: 120 }}/>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{ fontSize: 9, color: '#b8860b', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Gold
      </span>
      <span style={{ fontSize: 10, color: '#e8e4df', letterSpacing: '0.05em' }}>
        24K <strong style={{ color: '#b8860b' }}>AED {parseFloat(rates.rate_24k).toFixed(0)}</strong>
      </span>
      <span style={{ fontSize: 10, color: 'rgba(232,228,223,0.5)', letterSpacing: '0.05em' }}>·</span>
      <span style={{ fontSize: 10, color: '#e8e4df', letterSpacing: '0.05em' }}>
        22K <strong style={{ color: '#b8860b' }}>AED {parseFloat(rates.rate_22k).toFixed(0)}</strong>
      </span>
    </div>
  );
}


export default function Header({ template, config }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const closeTimer = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const openMenu  = (id) => { clearTimeout(closeTimer.current); setActiveMenu(id); };
  const closeMenu = ()   => { closeTimer.current = setTimeout(() => setActiveMenu(null), 100); };
  const closeNow  = ()   => { clearTimeout(closeTimer.current); setActiveMenu(null); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { window.location = `/search?q=${encodeURIComponent(query.trim())}`; }
  };

  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const topBarText = config?.theme_topbar_text || 'Complimentary shipping on all orders · GIA & IGI Certified Diamonds';
  const showTopBar = config?.theme_nav_topbar !== 'false';

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 200, fontFamily: "'Inter', system-ui, sans-serif" }}>
        
        {/* Enhanced topbar — announcement + gold rate + lang + currency */}
        {showTopBar && (
          <div style={{ background: '#1a1a1a', padding: '7px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left — gold rate ticker */}
            <GoldRateTicker/>
            {/* Center — announcement */}
            <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', color: '#e8e4df', flex: 1, textAlign: 'center' }}>
              {topBarText}
            </p>
            {/* Right — language + currency */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <CurrencySwitcher/>
              <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }}/>
              <LanguageSwitcher/>
            </div>
          </div>
        )}

        {/* Main nav */}
        <div style={{
          background: '#fff',
          borderBottom: scrolled ? '1px solid #e5e0d8' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none',
          transition: 'all .3s',
          height: 72,
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 32px', width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }}>
              {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>

            {/* Logo — left */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 48 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 26, fontWeight: 300, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#1a1a1a',
              }}>
                TEJORI
              </span>
            </Link>

            {/* Desktop mega nav — center */}
            <nav style={{ display: 'flex', alignItems: 'center', flex: 1 }} className="hidden lg:flex">
              {MEGA_NAV.map(item => (
                <div key={item.id}
                  onMouseEnter={() => openMenu(item.id)}
                  onMouseLeave={closeMenu}
                  style={{ position: 'relative' }}>
                  <Link href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '0 14px', height: 72,
                      fontSize: 11, fontWeight: 400, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: activeMenu === item.id ? '#b8860b' : '#1a1a1a',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      borderBottom: activeMenu === item.id ? '2px solid #b8860b' : '2px solid transparent',
                      transition: 'all .2s',
                    }}>
                    {item.label}
                    {item.badge && (
                      <span style={{ fontSize: 8, fontWeight: 700, background: '#b8860b', color: '#fff', padding: '2px 5px', borderRadius: 2, letterSpacing: '0.1em' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 'auto' }}>
              <button onClick={() => setSearchOpen(!searchOpen)}
                style={{ padding: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
                <Search size={17}/>
              </button>
              <Link href="/wishlist" style={{ padding: 10, color: '#1a1a1a', display: 'flex' }}>
                <Heart size={17}/>
              </Link>
              {wapp && (
                <a href={`https://wa.me/${wapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                  style={{ marginLeft: 8, padding: '8px 16px', background: '#1a1a1a', color: '#fff', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💬</span> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ background: '#fdf8f3', borderBottom: '1px solid #e5e0d8', padding: '16px 32px' }}>
            <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 0 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
                placeholder="Search jewellery, diamonds, collections…"
                style={{ flex: 1, padding: '12px 20px', border: '1px solid #e5e0d8', borderRight: 'none', fontSize: 13, outline: 'none', background: '#fff' }}/>
              <button type="submit"
                style={{ padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mega menu panel — rendered outside header to avoid overflow:hidden issues */}
      {activeMenu && (
        <div
          onMouseEnter={() => openMenu(activeMenu)}
          onMouseLeave={closeMenu}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'all' }}>
            {MEGA_NAV.filter(i => i.id === activeMenu).map(item => (
              <MegaMenuPanel key={item.id} item={item} onClose={closeNow}/>
            ))}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)}/>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '85vw', maxWidth: 360, background: '#fff', overflowY: 'auto', animation: 'slideIn .3s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, letterSpacing: '0.15em' }}>TEJORI</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            {MEGA_NAV.map(item => (
              <div key={item.id}>
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', padding: '14px 24px', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1a1a', borderBottom: '1px solid #f0ece6' }}>
                  {item.label}
                </Link>
                {item.cols?.flatMap(c => c.items).slice(0, 4).map(sub => (
                  <Link key={sub.label} href={sub.href} onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '10px 36px', fontSize: 12, color: '#6b6b6b', borderBottom: '1px solid #f8f6f3', fontFamily: "'Cormorant Garamond', serif" }}>
                    {sub.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Gold rate is now exported as a separate component for storefront use
// Import and use: import { GoldRateBanner } from '@/components/layout/Header'
